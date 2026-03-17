import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const INSTAGRAM_OAUTH_TOKEN = "https://api.instagram.com/oauth/access_token";

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Meta app is not fully configured.");
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
    throw new Error("Failed to exchange code for access token");
  }

  return (await res.json()) as {
    access_token: string;
    user_id: number;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000`;

  if (error) {
    return NextResponse.redirect(`${base}/`);
  }

  if (!code) {
    return NextResponse.redirect(`${base}/`);
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const igUserId = String(tokenData.user_id);
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

    await setSession({
      accessToken: tokenData.access_token,
      igUserId,
      expiresAt,
    });

    // Fetch username from Instagram
    let username: string | null = null;
    try {
      const profileRes = await fetch(
        `https://graph.instagram.com/v25.0/${igUserId}?fields=id,username&access_token=${tokenData.access_token}`,
      );
      if (profileRes.ok) {
        const profile = (await profileRes.json()) as { username?: string };
        username = profile.username ?? null;
      }
    } catch { /* non-fatal */ }

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

    return NextResponse.redirect(`${base}/dashboard`);
  } catch {
    return NextResponse.redirect(`${base}/`);
  }
}

