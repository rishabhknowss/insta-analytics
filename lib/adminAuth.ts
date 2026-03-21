import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const ADMIN_COOKIE = "admin_session";

function secret(): string {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET is not set");
  return s;
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

/** Cookie session or `x-admin-secret: ADMIN_SECRET` (for curl / scripts). */
export function isAdminAuthorizedOrSecret(req: NextRequest): boolean {
  if (isAdminAuthorized(req)) return true;
  const secret = process.env.ADMIN_SECRET;
  return !!secret && req.headers.get("x-admin-secret") === secret;
}

/** For server components / layouts */
export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return !!token && verifyAdminToken(token);
}
