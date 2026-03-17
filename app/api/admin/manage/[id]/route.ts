import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const posterId = parseInt(id, 10);
  if (isNaN(posterId)) {
    return NextResponse.json({ error: "Invalid poster ID" }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  const VALID_MANAGERS = ["ROHIT", "UJJWAL", "RISHABH"];
  const VALID_STATUS = ["UNPAID", "PARTIAL", "PAID"];

  const updateData: Record<string, unknown> = {};
  if (typeof body.managedBy === "string" && VALID_MANAGERS.includes(body.managedBy))
    updateData.managedBy = body.managedBy;
  if (typeof body.monthlyRate === "number" && body.monthlyRate > 0)
    updateData.monthlyRate = body.monthlyRate;
  if (typeof body.instagramLink === "string") updateData.instagramLink = body.instagramLink;
  if (typeof body.channelName === "string") updateData.channelName = body.channelName;
  if (typeof body.groupLink === "string") updateData.groupLink = body.groupLink;
  if (typeof body.paidStatus === "string" && VALID_STATUS.includes(body.paidStatus))
    updateData.paidStatus = body.paidStatus;

  const poster = await prisma.poster.update({
    where: { id: posterId },
    data: updateData,
  });

  return NextResponse.json(poster);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const posterId = parseInt(id, 10);
  if (isNaN(posterId)) {
    return NextResponse.json({ error: "Invalid poster ID" }, { status: 400 });
  }

  await prisma.poster.delete({ where: { id: posterId } });
  return NextResponse.json({ ok: true });
}
