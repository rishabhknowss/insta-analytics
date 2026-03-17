import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // Buffers must be same length for timingSafeEqual; pad to avoid short-circuit
  const len = Math.max(ab.length, bb.length);
  const ba2 = Buffer.alloc(len);
  const bb2 = Buffer.alloc(len);
  ab.copy(ba2);
  bb.copy(bb2);
  return timingSafeEqual(ba2, bb2) && ab.length === bb.length;
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json() as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
  }

  const emailOk = typeof body.email === "string" && safeEqual(body.email, adminEmail);
  const passOk = typeof body.password === "string" && safeEqual(body.password, adminPassword);

  if (!emailOk || !passOk) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return res;
}
