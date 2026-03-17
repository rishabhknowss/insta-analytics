import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const INSTAGRAM_OAUTH_TOKEN = "https://api.instagram.com/oauth/access_token";
const SESSION_COOKIE_NAME = "auth_session";

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  console.log("[callback] env check — APP_ID:", !!clientId, "SECRET:", !!clientSecret, "REDIRECT:", redirectUri);

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(`Meta app not configured. APP_ID:${!!clientId} SECRET:${!!clientSecret} REDIRECT:${!!redirectUri}`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    grant_type: "authorization_code",
  });

  const res = await fetch(INSTAGRAM_OAUTH_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[callback] token exchange failed:", res.status, text);
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; user_id: number };
  console.log("[callback] token exchange OK, user_id:", data.user_id);
  return data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  console.log("[callback] hit — code:", !!code, "error:", error, "base:", base);

  if (error || !code) {
    console.log("[callback] no code or error param, redirecting home");
    return NextResponse.redirect(`${base}/`);
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const igUserId = String(tokenData.user_id);
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

    // Fetch username
    let username: string | null = null;
    try {
      const profileRes = await fetch(
        `https://graph.instagram.com/v25.0/${igUserId}?fields=id,username&access_token=${tokenData.access_token}`,
      );
      const profileText = await profileRes.text();
      console.log("[callback] profile fetch:", profileRes.status, profileText.slice(0, 200));
      if (profileRes.ok) {
        const profile = JSON.parse(profileText) as { username?: string };
        username = profile.username ?? null;
      }
    } catch (e) {
      console.error("[callback] profile fetch error:", e instanceof Error ? e.message : e);
    }

    console.log("[callback] upserting account:", igUserId, "username:", username);

    await prisma.account.upsert({
      where: { id: igUserId },
      update: {
        accessToken: tokenData.access_token,
        tokenExpiresAt: expiresAt,
        lastSeenAt: new Date(),
        ...(username ? { username } : {}),
      },
      create: {
        id: igUserId,
        accessToken: tokenData.access_token,
        tokenExpiresAt: expiresAt,
        username,
      },
    });

    const secret = process.env.SESSION_SECRET;
    console.log("[callback] SESSION_SECRET exists:", !!secret);
    if (!secret) throw new Error("SESSION_SECRET not set");

    const token = jwt.sign(
      { accessToken: tokenData.access_token, igUserId, expiresAt },
      secret,
    );

    console.log("[callback] JWT created, length:", token.length, "redirecting to:", `${base}/dashboard`);

    const response = NextResponse.redirect(`${base}/dashboard`);
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60,
      path: "/",
    });

    console.log("[callback] cookie set on response, returning redirect");
    return response;
  } catch (err) {
    console.error("[callback] FATAL:", err instanceof Error ? err.stack : err);
    return NextResponse.redirect(`${base}/?error=auth_failed`);
  }
}
