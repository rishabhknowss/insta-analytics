#!/usr/bin/env node
/**
 * Clears all bot slash-commands via Telegram API (reads TELEGRAM_BOT_TOKEN from .env).
 * Same as POST /api/telegram/clear-commands but runs locally without the Next server.
 */
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN missing in .env");
  process.exit(1);
}

const base = `https://api.telegram.org/bot${token}`;

const scopes = [
  {},
  { scope: { type: "all_private_chats" } },
  { scope: { type: "all_group_chats" } },
  { scope: { type: "all_chat_administrators" } },
];

for (const body of scopes) {
  const res = await fetch(`${base}/deleteMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(JSON.stringify({ body, ok: data.ok, description: data.description }));
  if (!data.ok) process.exitCode = 1;
}
