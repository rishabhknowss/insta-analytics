import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const ADMIN_COOKIE = "admin_session";

function secret() {
  return process.env.ADMIN_JWT_SECRET ?? process.env.SESSION_SECRET ?? "admin-fallback-secret";
}

export function signAdminToken(): string {
  return jwt.sign({ admin: true }, secret(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    jwt.verify(token, secret());
    return true;
  } catch {
    return false;
  }
}

/** For API route handlers (NextRequest) */
export function isAdminAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!cookie && verifyAdminToken(cookie);
}

/** For server components / layouts */
export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return !!token && verifyAdminToken(token);
}
