import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      reels: {
        orderBy: { publishedAt: "desc" },
        include: {
          dailyStats: {
            orderBy: { date: "asc" },
          },
        },
      },
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip access token from response
  const { accessToken: _, tokenExpiresAt: __, ...safe } = account;

  return NextResponse.json(safe);
}
