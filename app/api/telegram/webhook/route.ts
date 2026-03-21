import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Manager } from "@prisma/client";
import {
  sendMessage,
  getChat,
  getChatInviteLink,
  type TelegramUpdate,
} from "@/lib/telegram";

/** Telegram user id -> manager (who runs /add is set as manager). */
const TELEGRAM_ID_TO_MANAGER: Record<number, Manager> = {
  790457897: "ROHIT",
  1714837071: "UJJWAL",
  1336679662: "RISHABH",
};

function managerFromTelegramUserId(userId: number): Manager {
  return TELEGRAM_ID_TO_MANAGER[userId] ?? "RISHABH";
}

function getAdminIds(): Set<number> {
  const raw = process.env.TELEGRAM_ADMIN_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n)),
  );
}

function isPrivateChat(type: string) {
  return type === "private";
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = (await req.json()) as TelegramUpdate;
  const msg = update.message;
  if (!msg) return NextResponse.json({ ok: true });

  const userId = msg.from?.id;
  const adminIds = getAdminIds();
  // Only listed admins may interact; everyone else gets no reply (group or DM).
  if (!userId || !adminIds.has(userId)) {
    return NextResponse.json({ ok: true });
  }

  if (!msg.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const text = msg.text.trim();

  if (!text.startsWith("/")) return NextResponse.json({ ok: true });

  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@\w+$/, "");

  // Admins: commands only in groups; DMs are ignored (no reply).
  if (isPrivateChat(chatType)) {
    return NextResponse.json({ ok: true });
  }

  if (!["/add", "/paid", "/remove"].includes(cmd)) {
    return NextResponse.json({ ok: true });
  }

  if (cmd !== "/remove") {
    backfillGroupLink(chatId, msg.chat).catch(() => {});
  }

  try {
    switch (cmd) {
      case "/add":
        await handleAdd(chatId, args, msg.chat, userId);
        break;
      case "/paid":
        await handlePaid(chatId, args);
        break;
      case "/remove":
        await handleRemove(chatId);
        break;
      default:
        break;
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    await sendMessage(chatId, `Error: ${errMsg}`);
  }

  return NextResponse.json({ ok: true });
}

async function backfillGroupLink(
  chatId: number,
  chat: { title?: string; username?: string },
) {
  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster || poster.groupLink) return;

  let groupLink = chat.username ? `https://t.me/${chat.username}` : "";
  if (!groupLink) {
    const chatInfo = await getChat(chatId);
    if (chatInfo?.invite_link) {
      groupLink = chatInfo.invite_link;
    } else {
      const inviteLink = await getChatInviteLink(chatId);
      if (inviteLink) groupLink = inviteLink;
    }
  }

  if (groupLink) {
    await prisma.poster.update({
      where: { id: poster.id },
      data: { groupLink },
    });
  }
}

async function handleAdd(
  chatId: number,
  args: string[],
  chat: { title?: string; username?: string },
  fromUserId: number,
) {
  const instaLink = args[0];
  if (!instaLink || !instaLink.includes("instagram.com")) {
    await sendMessage(chatId, "<code>/add https://instagram.com/username</code>");
    return;
  }

  const existing = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (existing && !existing.disabled) {
    await sendMessage(chatId, "Already registered.");
    return;
  }

  const channelName = chat.title ?? "Unknown";
  let groupLink = chat.username ? `https://t.me/${chat.username}` : "";
  if (!groupLink) {
    const chatInfo = await getChat(chatId);
    if (chatInfo?.invite_link) {
      groupLink = chatInfo.invite_link;
    } else {
      const inviteLink = await getChatInviteLink(chatId);
      if (inviteLink) groupLink = inviteLink;
    }
  }

  const managedBy = managerFromTelegramUserId(fromUserId);

  if (existing?.disabled) {
    const agg = await prisma.payment.aggregate({
      where: { posterId: existing.id },
      _sum: { amount: true },
    });
    const totalPaid = agg._sum.amount ?? 0;
    await prisma.poster.update({
      where: { id: existing.id },
      data: {
        disabled: false,
        instagramLink: instaLink.trim(),
        channelName,
        groupLink,
        managedBy,
        totalPaid,
      },
    });
    await sendMessage(chatId, "Re-registered.");
    return;
  }

  await prisma.poster.create({
    data: {
      telegramChatId: BigInt(chatId),
      instagramLink: instaLink.trim(),
      channelName,
      groupLink,
      managedBy,
    },
  });

  await sendMessage(chatId, `Done. Manager: ${managedBy}`);
}

async function handlePaid(chatId: number, args: string[]) {
  const amount = parseInt(args[0], 10);
  if (!amount || amount <= 0) {
    await sendMessage(chatId, "<code>/paid 500</code>");
    return;
  }

  const note = args.slice(1).join(" ") || "";
  const poster = await prisma.poster.findFirst({
    where: { telegramChatId: BigInt(chatId), disabled: false },
  });
  if (!poster) {
    await sendMessage(chatId, "Not registered. Use /add first.");
    return;
  }

  await prisma.payment.create({
    data: { posterId: poster.id, amount, note },
  });

  const agg = await prisma.payment.aggregate({
    where: { posterId: poster.id },
    _sum: { amount: true },
  });
  const totalPaid = agg._sum.amount ?? 0;

  await prisma.poster.update({
    where: { id: poster.id },
    data: { totalPaid },
  });

  await sendMessage(
    chatId,
    `+₹${amount.toLocaleString("en-IN")}${note ? ` (${note})` : ""}\nTotal paid: ₹${totalPaid.toLocaleString("en-IN")}`,
  );
}

async function handleRemove(chatId: number) {
  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster) {
    await sendMessage(chatId, "Not registered.");
    return;
  }

  await prisma.poster.update({
    where: { id: poster.id },
    data: { disabled: true },
  });

  await sendMessage(chatId, "Removed from list.");
}
