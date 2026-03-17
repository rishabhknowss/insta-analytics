function apiBase() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return `https://api.telegram.org/bot${token}`;
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
