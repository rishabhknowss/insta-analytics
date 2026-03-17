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

  console.log("[session] cookie exists:", !!token, "secret exists:", !!secret);

  if (!token || !secret) {
    console.log("[session] missing token or secret, returning null");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as SessionPayload;
    const now = Date.now();
    const expiresMs = decoded.expiresAt * 1000;
    console.log("[session] decoded igUserId:", decoded.igUserId, "expiresAt:", decoded.expiresAt, "now:", Math.floor(now / 1000), "expired:", expiresMs < now);

    if (decoded.expiresAt && expiresMs < now) {
      console.log("[session] token expired");
      return null;
    }
    return decoded;
  } catch (err) {
    console.error("[session] jwt verify failed:", err instanceof Error ? err.message : err);
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
    maxAge: 60 * 60,
    path: "/",
  });
}
