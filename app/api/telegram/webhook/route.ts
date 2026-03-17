import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMessage,
  getChat,
  getChatInviteLink,
  type TelegramUpdate,
} from "@/lib/telegram";

const VALID_MANAGERS = ["ROHIT", "UJJWAL", "RISHABH"] as const;

const RATE_TIERS: Record<number, number> = {
  300: 1500,
  500: 2000,
};

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
  if (!msg?.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const userId = msg.from?.id;
  const text = msg.text.trim();

  if (!text.startsWith("/")) return NextResponse.json({ ok: true });

  const adminIds = getAdminIds();
  if (!userId || !adminIds.has(userId)) {
    return NextResponse.json({ ok: true });
  }

  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@\w+$/, "");

  // Backfill missing group link on any command from a registered group
  if (!isPrivateChat(chatType)) {
    backfillGroupLink(chatId, msg.chat).catch(() => {});
  }

  try {
    switch (cmd) {
      case "/add":
        await handleAdd(chatId, args, msg.chat);
        break;
      case "/paid":
        await handlePaid(chatId, args);
        break;
      case "/manage":
        await handleManage(chatId, args);
        break;
      case "/info":
        await handleInfo(chatId);
        break;
      case "/stats":
        if (!isPrivateChat(chatType)) {
          await sendMessage(chatId, "DM me for this.");
          break;
        }
        await handleStats(chatId);
        break;
      case "/list":
        if (!isPrivateChat(chatType)) {
          await sendMessage(chatId, "DM me for this.");
          break;
        }
        await handleList(chatId);
        break;
      case "/help":
        await handleHelp(chatId, isPrivateChat(chatType));
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
) {
  const instaLink = args[0];
  if (!instaLink || !instaLink.includes("instagram.com")) {
    await sendMessage(chatId, "<code>/add https://instagram.com/username</code>");
    return;
  }

  const existing = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (existing) {
    await sendMessage(chatId, "Already registered.");
    return;
  }

  const channelName = chat.title ?? "Unknown";
  let groupLink = chat.username ? `https://t.me/${chat.username}` : "";
  if (!groupLink) {
    // Try getChat first — returns existing invite_link without admin rights
    const chatInfo = await getChat(chatId);
    if (chatInfo?.invite_link) {
      groupLink = chatInfo.invite_link;
    } else {
      // Needs bot to be admin with invite perms
      const inviteLink = await getChatInviteLink(chatId);
      if (inviteLink) groupLink = inviteLink;
    }
  }

  await prisma.poster.create({
    data: {
      telegramChatId: BigInt(chatId),
      instagramLink: instaLink.trim(),
      channelName,
      groupLink,
    },
  });

  await sendMessage(chatId, "Done.");
}

async function handlePaid(chatId: number, args: string[]) {
  const amount = parseInt(args[0], 10);
  if (!amount || amount <= 0) {
    await sendMessage(chatId, "<code>/paid 500</code>");
    return;
  }

  const note = args.slice(1).join(" ") || "";
  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster) {
    await sendMessage(chatId, "Not registered. Use /add first.");
    return;
  }

  // First payment auto-detects the rate tier
  let monthlyRate = poster.monthlyRate;
  if (poster.totalPaid === 0 && amount in RATE_TIERS) {
    monthlyRate = RATE_TIERS[amount];
  }

  await prisma.payment.create({
    data: { posterId: poster.id, amount, note },
  });

  const agg = await prisma.payment.aggregate({
    where: { posterId: poster.id },
    _sum: { amount: true },
  });
  const totalPaid = agg._sum.amount ?? 0;

  const paidStatus =
    totalPaid >= monthlyRate ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.poster.update({
    where: { id: poster.id },
    data: { totalPaid, paidStatus, monthlyRate },
  });

  const remaining = Math.max(monthlyRate - totalPaid, 0);

  await sendMessage(
    chatId,
    `+₹${amount}${note ? ` (${note})` : ""}\n₹${totalPaid} / ₹${monthlyRate} — ₹${remaining} left`,
  );
}

async function handleManage(chatId: number, args: string[]) {
  const name = args[0]?.toUpperCase();
  if (!name || !VALID_MANAGERS.includes(name as (typeof VALID_MANAGERS)[number])) {
    await sendMessage(chatId, "<code>/manage rohit|ujjwal|rishabh</code>");
    return;
  }

  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster) {
    await sendMessage(chatId, "Not registered. Use /add first.");
    return;
  }

  await prisma.poster.update({
    where: { id: poster.id },
    data: { managedBy: name as (typeof VALID_MANAGERS)[number] },
  });

  await sendMessage(chatId, `Manager: ${name}`);
}

async function handleInfo(chatId: number) {
  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
    include: { payments: { orderBy: { paidAt: "desc" }, take: 3 } },
  });

  if (!poster) {
    await sendMessage(chatId, "Not registered. Use /add first.");
    return;
  }

  const remaining = Math.max(poster.monthlyRate - poster.totalPaid, 0);
  let text =
    `₹${poster.totalPaid} / ₹${poster.monthlyRate}` +
    ` — ₹${remaining} left` +
    `\n${poster.paidStatus} · ${poster.managedBy}`;

  if (poster.payments.length > 0) {
    for (const p of poster.payments) {
      const date = p.paidAt.toISOString().slice(0, 10);
      text += `\n  ₹${p.amount} ${date}${p.note ? ` ${p.note}` : ""}`;
    }
  }

  await sendMessage(chatId, text);
}

// DM-only commands below

async function handleStats(chatId: number) {
  const active = { disabled: false };
  const removed = { disabled: true };

  const [
    activeCount, activePaid, activePartial,
    activeTotalPaid, activeTotalRate,
    removedCount, removedTotalPaid, removedTotalRate,
  ] = await Promise.all([
    prisma.poster.count({ where: active }),
    prisma.poster.count({ where: { ...active, paidStatus: "PAID" } }),
    prisma.poster.count({ where: { ...active, paidStatus: "PARTIAL" } }),
    prisma.poster.aggregate({ where: active, _sum: { totalPaid: true } }),
    prisma.poster.aggregate({ where: active, _sum: { monthlyRate: true } }),
    prisma.poster.count({ where: removed }),
    prisma.poster.aggregate({ where: removed, _sum: { totalPaid: true } }),
    prisma.poster.aggregate({ where: removed, _sum: { monthlyRate: true } }),
  ]);

  const paid = activeTotalPaid._sum.totalPaid ?? 0;
  const rate = activeTotalRate._sum.monthlyRate ?? 0;
  const remaining = Math.max(rate - paid, 0);
  const unpaid = activeCount - activePaid - activePartial;

  let text =
    `<b>Active — ${activeCount} posters</b>\n` +
    `${activePaid} paid · ${activePartial} partial · ${unpaid} unpaid\n` +
    `₹${paid.toLocaleString()} / ₹${rate.toLocaleString()} — ₹${remaining.toLocaleString()} left`;

  if (removedCount > 0) {
    const rPaid = removedTotalPaid._sum.totalPaid ?? 0;
    const rRate = removedTotalRate._sum.monthlyRate ?? 0;
    text +=
      `\n\n<b>Removed — ${removedCount}</b>\n` +
      `₹${rPaid.toLocaleString()} / ₹${rRate.toLocaleString()} collected`;
  }

  await sendMessage(chatId, text);
}

async function handleList(chatId: number) {
  const posters = await prisma.poster.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (posters.length === 0) {
    await sendMessage(chatId, "No posters yet.");
    return;
  }

  const active = posters.filter((p) => !p.disabled);
  const removed = posters.filter((p) => p.disabled);

  function formatLine(p: (typeof posters)[number]) {
    const dot = p.paidStatus === "PAID" ? "+" : p.paidStatus === "PARTIAL" ? "~" : "-";
    const handle = p.instagramLink.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "");
    return `${dot} ${handle} ₹${p.totalPaid}/${p.monthlyRate} [${p.managedBy}]`;
  }

  let text = `<b>Active — ${active.length}</b>\n`;
  for (const p of active) text += `\n${formatLine(p)}`;

  if (removed.length > 0) {
    text += `\n\n<b>Removed — ${removed.length}</b>\n`;
    for (const p of removed) {
      const handle = p.instagramLink.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "");
      text += `\nx ${handle} ₹${p.totalPaid}/${p.monthlyRate}`;
    }
  }

  await sendMessage(chatId, text);
}

async function handleHelp(chatId: number, isDm: boolean) {
  let text =
    `/add &lt;link&gt; — register\n` +
    `/paid &lt;amt&gt; — payment\n` +
    `/manage &lt;name&gt; — assign\n` +
    `/info — details`;

  if (isDm) {
    text += `\n/stats — overview\n/list — all posters`;
  }

  await sendMessage(chatId, text);
}
