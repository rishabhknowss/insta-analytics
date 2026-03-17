import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function parseSignedRequest(signedRequest: string, secret: string) {
  const [encodedSig, payload] = signedRequest.split(".");
  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const data = JSON.parse(
    Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"),
  );
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) return null;
  return data as { user_id: string };
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const signedRequest = form.get("signed_request") as string | null;

  if (!signedRequest || !process.env.META_APP_SECRET) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const data = parseSignedRequest(signedRequest, process.env.META_APP_SECRET);
  if (!data) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const userId = data.user_id;

  await prisma.account.deleteMany({ where: { id: userId } });

  const confirmationCode = crypto.randomBytes(10).toString("hex");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reelanalytics.vercel.app";

  return NextResponse.json({
    url: `${baseUrl}/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
