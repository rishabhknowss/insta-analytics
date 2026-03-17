import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const posterId = parseInt(id, 10);
  if (isNaN(posterId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const poster = await prisma.poster.findUnique({ where: { id: posterId } });
  if (!poster) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.poster.update({
    where: { id: posterId },
    data: { disabled: true },
  });

  return NextResponse.json({ ok: true });
}
