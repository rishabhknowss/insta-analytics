import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SESSION_COOKIE_NAME = "auth_session";

type SessionPayload = {
  accessToken: string;
  igUserId: string;
  expiresAt: number;
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as SessionPayload;
    if (decoded.expiresAt && decoded.expiresAt * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function setSession(payload: SessionPayload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  const token = jwt.sign(payload, secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
