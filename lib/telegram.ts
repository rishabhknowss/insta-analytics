function apiBase() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return `https://api.telegram.org/bot${token}`;
}

/**
 * Clears the bot command menu everywhere, then registers only /add, /paid, /remove for group chats.
 * Run after deploy via POST /api/telegram/setup (admin) so Telegram’s menu matches the webhook.
 */
export async function syncBotCommandMenu(): Promise<{ ok: boolean; details: unknown[] }> {
  const base = apiBase();
  const details: unknown[] = [];

  async function post(method: string, body: Record<string, unknown>) {
    const res = await fetch(`${base}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    details.push({ method, body, data });
    return data as { ok: boolean; description?: string };
  }

  const r1 = await post("deleteMyCommands", {});
  const r2 = await post("deleteMyCommands", { scope: { type: "all_private_chats" } });
  const r3 = await post("setMyCommands", {
    scope: { type: "all_group_chats" },
    commands: [
      { command: "add", description: "Instagram link for this group" },
      { command: "paid", description: "Record payment" },
      { command: "remove", description: "Remove poster from list" },
    ],
  });

  const ok = r1.ok && r2.ok && r3.ok;
  return { ok, details };
}

/** Remove every slash-command from the bot menu (all scopes Telegram supports). */
export async function clearAllBotCommands(): Promise<{ ok: boolean; details: unknown[] }> {
  const base = apiBase();
  const details: unknown[] = [];

  async function post(method: string, body: Record<string, unknown>) {
    const res = await fetch(`${base}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    details.push({ method, body, data });
    return data as { ok: boolean; description?: string };
  }

  const scopes: Record<string, unknown>[] = [
    {},
    { scope: { type: "all_private_chats" } },
    { scope: { type: "all_group_chats" } },
    { scope: { type: "all_chat_administrators" } },
  ];

  let ok = true;
  for (const body of scopes) {
    const r = await post("deleteMyCommands", body);
    if (!r.ok) ok = false;
  }

  return { ok, details };
}

export async function sendMessage(
  chatId: number | string,
  text: string,
  parseMode: "HTML" | "MarkdownV2" = "HTML",
) {
  await fetch(`${apiBase()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  });
}

export async function getChat(chatId: number | string) {
  const res = await fetch(`${apiBase()}/getChat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    ok: boolean;
    result?: {
      id: number;
      title?: string;
      username?: string;
      invite_link?: string;
      type: string;
    };
  };
  return data.result ?? null;
}

export async function getChatInviteLink(chatId: number | string): Promise<string | null> {
  const res = await fetch(`${apiBase()}/exportChatInviteLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { ok: boolean; result?: string };
  return data.result ?? null;
}

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name: string; username?: string };
    chat: {
      id: number;
      title?: string;
      username?: string;
      type: string;
    };
    text?: string;
    entities?: { type: string; offset: number; length: number }[];
  };
};
