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
    return NextResponse.json({ error: "Invalid poster ID" }, { status: 400 });
  }

  const body = (await req.json()) as { amount?: number; note?: string };
  const amount = body.amount;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const [payment, poster] = await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.create({
      data: {
        posterId,
        amount,
        note: body.note ?? "",
      },
    });

    const agg = await tx.payment.aggregate({
      where: { posterId },
      _sum: { amount: true },
    });

    const totalPaid = agg._sum.amount ?? 0;

    const p = await tx.poster.update({
      where: { id: posterId },
      data: {
        totalPaid,
        paidStatus:
          totalPaid >= (await tx.poster.findUnique({ where: { id: posterId } }))!.monthlyRate
            ? "PAID"
            : totalPaid > 0
              ? "PARTIAL"
              : "UNPAID",
      },
    });

    return [pay, p] as const;
  });

  return NextResponse.json({ payment, poster });
}
