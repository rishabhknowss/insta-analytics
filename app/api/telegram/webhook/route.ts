import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMessage,
  getChat,
  getChatInviteLink,
  type TelegramUpdate,
} from "@/lib/telegram";

const VALID_MANAGERS = ["ROHIT", "UJJWAL", "RISHABH"] as const;

function getAdminIds(): Set<number> {
  const raw = process.env.TELEGRAM_ADMIN_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n)),
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  const userId = msg.from?.id;
  const text = msg.text.trim();

  if (!text.startsWith("/")) return NextResponse.json({ ok: true });

  // Only allow admins to run commands
  const adminIds = getAdminIds();
  if (!userId || !adminIds.has(userId)) {
    await sendMessage(chatId, "⛔ You are not authorized to use this bot.");
    return NextResponse.json({ ok: true });
  }

  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@\w+$/, "");

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
      case "/rate":
        await handleRate(chatId, args);
        break;
      case "/stats":
        await handleStats(chatId);
        break;
      case "/info":
        await handleInfo(chatId);
        break;
      case "/list":
        await handleList(chatId);
        break;
      case "/help":
        await handleHelp(chatId);
        break;
      default:
        break;
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    await sendMessage(chatId, `❌ Error: ${escapeHtml(errMsg)}`);
  }

  return NextResponse.json({ ok: true });
}

async function handleAdd(
  chatId: number,
  args: string[],
  chat: { title?: string; username?: string },
) {
  const instaLink = args[0];
  if (!instaLink || !instaLink.includes("instagram.com")) {
    await sendMessage(chatId, "Usage: <code>/add https://instagram.com/username</code>");
    return;
  }

  const existing = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (existing) {
    await sendMessage(chatId, "⚠️ This group already has a poster registered. Use /info to see details.");
    return;
  }

  const channelName = chat.title ?? "Unknown";
  let groupLink = chat.username ? `https://t.me/${chat.username}` : "";
  if (!groupLink) {
    const inviteLink = await getChatInviteLink(chatId);
    if (inviteLink) groupLink = inviteLink;
  }

  await prisma.poster.create({
    data: {
      telegramChatId: BigInt(chatId),
      instagramLink: instaLink.trim(),
      channelName,
      groupLink,
    },
  });

  await sendMessage(
    chatId,
    `✅ <b>Poster registered!</b>\n\n` +
    `📸 Instagram: ${escapeHtml(instaLink)}\n` +
    `💬 Group: ${escapeHtml(channelName)}\n` +
    `🔗 Link: ${groupLink ? escapeHtml(groupLink) : "N/A"}\n\n` +
    `Use /manage to assign a manager, /rate to set monthly rate.`,
  );
}

async function handlePaid(chatId: number, args: string[]) {
  const amount = parseInt(args[0], 10);
  if (!amount || amount <= 0) {
    await sendMessage(chatId, "Usage: <code>/paid 500</code>");
    return;
  }

  const note = args.slice(1).join(" ") || "";
  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster) {
    await sendMessage(chatId, "⚠️ No poster registered in this group. Use /add first.");
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

  const paidStatus =
    totalPaid >= poster.monthlyRate ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.poster.update({
    where: { id: poster.id },
    data: { totalPaid, paidStatus },
  });

  const remaining = Math.max(poster.monthlyRate - totalPaid, 0);

  await sendMessage(
    chatId,
    `💰 <b>Payment recorded: ₹${amount.toLocaleString()}</b>${note ? ` (${escapeHtml(note)})` : ""}\n\n` +
    `Total paid: ₹${totalPaid.toLocaleString()} / ₹${poster.monthlyRate.toLocaleString()}\n` +
    `Remaining: ₹${remaining.toLocaleString()}\n` +
    `Status: <b>${paidStatus}</b>`,
  );
}

async function handleManage(chatId: number, args: string[]) {
  const name = args[0]?.toUpperCase();
  if (!name || !VALID_MANAGERS.includes(name as (typeof VALID_MANAGERS)[number])) {
    await sendMessage(
      chatId,
      `Usage: <code>/manage name</code>\nValid: ${VALID_MANAGERS.join(", ").toLowerCase()}`,
    );
    return;
  }

  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster) {
    await sendMessage(chatId, "⚠️ No poster registered in this group. Use /add first.");
    return;
  }

  await prisma.poster.update({
    where: { id: poster.id },
    data: { managedBy: name as (typeof VALID_MANAGERS)[number] },
  });

  await sendMessage(chatId, `✅ Manager set to <b>${name}</b>`);
}

async function handleRate(chatId: number, args: string[]) {
  const rate = parseInt(args[0], 10);
  if (!rate || rate <= 0) {
    await sendMessage(chatId, "Usage: <code>/rate 2000</code>");
    return;
  }

  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
  });
  if (!poster) {
    await sendMessage(chatId, "⚠️ No poster registered in this group. Use /add first.");
    return;
  }

  const paidStatus =
    poster.totalPaid >= rate ? "PAID" : poster.totalPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.poster.update({
    where: { id: poster.id },
    data: { monthlyRate: rate, paidStatus },
  });

  await sendMessage(chatId, `✅ Monthly rate set to <b>₹${rate.toLocaleString()}</b>`);
}

async function handleStats(chatId: number) {
  const [total, paidCount, totalPaid, totalRate] = await Promise.all([
    prisma.poster.count(),
    prisma.poster.count({ where: { paidStatus: "PAID" } }),
    prisma.poster.aggregate({ _sum: { totalPaid: true } }),
    prisma.poster.aggregate({ _sum: { monthlyRate: true } }),
  ]);

  const paid = totalPaid._sum.totalPaid ?? 0;
  const rate = totalRate._sum.monthlyRate ?? 0;
  const remaining = Math.max(rate - paid, 0);

  await sendMessage(
    chatId,
    `📊 <b>Overall Stats</b>\n\n` +
    `Posters: ${total}\n` +
    `Fully paid: ${paidCount} / ${total}\n` +
    `Total paid: ₹${paid.toLocaleString()}\n` +
    `Total due: ₹${rate.toLocaleString()}\n` +
    `Remaining: ₹${remaining.toLocaleString()}`,
  );
}

async function handleInfo(chatId: number) {
  const poster = await prisma.poster.findUnique({
    where: { telegramChatId: BigInt(chatId) },
    include: { payments: { orderBy: { paidAt: "desc" }, take: 5 } },
  });

  if (!poster) {
    await sendMessage(chatId, "⚠️ No poster registered in this group. Use /add first.");
    return;
  }

  const remaining = Math.max(poster.monthlyRate - poster.totalPaid, 0);
  let text =
    `📋 <b>Poster Info</b>\n\n` +
    `📸 ${escapeHtml(poster.instagramLink)}\n` +
    `💬 ${escapeHtml(poster.channelName)}\n` +
    `👤 Manager: <b>${poster.managedBy}</b>\n` +
    `💰 Rate: ₹${poster.monthlyRate.toLocaleString()}\n` +
    `✅ Paid: ₹${poster.totalPaid.toLocaleString()}\n` +
    `⏳ Remaining: ₹${remaining.toLocaleString()}\n` +
    `📌 Status: <b>${poster.paidStatus}</b>`;

  if (poster.payments.length > 0) {
    text += `\n\n<b>Recent payments:</b>`;
    for (const p of poster.payments) {
      const date = p.paidAt.toISOString().slice(0, 10);
      text += `\n  ₹${p.amount.toLocaleString()} on ${date}${p.note ? ` — ${escapeHtml(p.note)}` : ""}`;
    }
  }

  await sendMessage(chatId, text);
}

async function handleList(chatId: number) {
  const posters = await prisma.poster.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (posters.length === 0) {
    await sendMessage(chatId, "No posters registered yet.");
    return;
  }

  let text = `📋 <b>All Posters (${posters.length})</b>\n`;
  for (const p of posters) {
    const status = p.paidStatus === "PAID" ? "✅" : p.paidStatus === "PARTIAL" ? "🟡" : "🔴";
    const handle = p.instagramLink.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "");
    text += `\n${status} ${escapeHtml(handle)} — ₹${p.totalPaid}/${p.monthlyRate} [${p.managedBy}]`;
  }

  await sendMessage(chatId, text);
}

async function handleHelp(chatId: number) {
  await sendMessage(
    chatId,
    `🤖 <b>Bot Commands</b>\n\n` +
    `<code>/add &lt;insta_link&gt;</code> — Register poster (auto-detects group)\n` +
    `<code>/paid &lt;amount&gt; [note]</code> — Record a payment\n` +
    `<code>/manage &lt;name&gt;</code> — Assign manager (rohit/ujjwal/rishabh)\n` +
    `<code>/rate &lt;amount&gt;</code> — Set monthly rate\n` +
    `<code>/info</code> — Show this group's poster details\n` +
    `<code>/stats</code> — Overall payment stats\n` +
    `<code>/list</code> — List all posters\n` +
    `<code>/help</code> — Show this message`,
  );
}
