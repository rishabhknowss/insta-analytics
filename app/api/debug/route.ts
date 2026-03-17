import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => c.name);
  const sessionCookie = cookieStore.get("auth_session")?.value;
  const secret = process.env.SESSION_SECRET;

  const debug: Record<string, unknown> = {
    allCookieNames: allCookies,
    hasSessionCookie: !!sessionCookie,
    sessionCookieLength: sessionCookie?.length ?? 0,
    hasSessionSecret: !!secret,
    env: {
      META_APP_ID: !!process.env.META_APP_ID,
      META_APP_SECRET: !!process.env.META_APP_SECRET,
      META_REDIRECT_URI: process.env.META_REDIRECT_URI,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
    },
  };

  if (sessionCookie && secret) {
    try {
      const decoded = jwt.verify(sessionCookie, secret) as Record<string, unknown>;
      debug.jwtValid = true;
      debug.jwtPayload = {
        igUserId: decoded.igUserId,
        expiresAt: decoded.expiresAt,
        nowSeconds: Math.floor(Date.now() / 1000),
        expired: typeof decoded.expiresAt === "number" && decoded.expiresAt * 1000 < Date.now(),
        hasAccessToken: !!decoded.accessToken,
      };
    } catch (err) {
      debug.jwtValid = false;
      debug.jwtError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json(debug, { status: 200 });
}
