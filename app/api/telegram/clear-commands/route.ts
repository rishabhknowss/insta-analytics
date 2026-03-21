import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorizedOrSecret } from "@/lib/adminAuth";
import { clearAllBotCommands } from "@/lib/telegram";

/**
 * Clears the bot’s / command menu via Telegram Bot API (uses TELEGRAM_BOT_TOKEN from env).
 *
 * Auth: admin session cookie OR header `x-admin-secret: <ADMIN_SECRET>`
 *
 * Example:
 *   curl -X POST "$BASE/api/telegram/clear-commands" -H "x-admin-secret: $ADMIN_SECRET"
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthorizedOrSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  try {
    const result = await clearAllBotCommands();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
