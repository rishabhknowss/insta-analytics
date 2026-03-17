import { NextRequest, NextResponse } from "next/server";

const INSTAGRAM_OAUTH_AUTHORIZE = "https://api.instagram.com/oauth/authorize";

export async function GET(_req: NextRequest) {
  const clientId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Meta app is not configured on the server." },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ].join(","),
  });

  const authUrl = `${INSTAGRAM_OAUTH_AUTHORIZE}?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}

