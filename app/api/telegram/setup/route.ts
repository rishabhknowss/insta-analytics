import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorizedOrSecret } from "@/lib/adminAuth";
import { syncBotCommandMenu } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorizedOrSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!botToken || !baseUrl) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_BASE_URL not set" },
      { status: 500 },
    );
  }

  const webhookUrl = `${baseUrl}/api/telegram/webhook`;

  const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
      drop_pending_updates: true,
      ...(webhookSecret ? { secret_token: webhookSecret } : {}),
    }),
  });

  const data = await res.json();

  let commands: { ok: boolean; details?: unknown[] } = { ok: false };
  try {
    commands = await syncBotCommandMenu();
  } catch (e) {
    commands = {
      ok: false,
      details: [{ error: e instanceof Error ? e.message : String(e) }],
    };
  }

  return NextResponse.json({ webhookUrl, telegram: data, botCommands: commands });
}
