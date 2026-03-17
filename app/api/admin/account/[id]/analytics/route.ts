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
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const fromDate = from && ISO_DATE.test(from) ? new Date(from) : null;
  const toDate   = to   && ISO_DATE.test(to)   ? new Date(to)   : null;

  const rows = await prisma.$queryRaw<
    { date: Date; views: bigint; likes: bigint; comments: bigint }[]
  >`
    SELECT
      s.date,
      SUM(s.views)    AS views,
      SUM(s.likes)    AS likes,
      SUM(s.comments) AS comments
    FROM reel_daily_stats s
    JOIN reels r ON r.id = s."reelId"
    WHERE r."accountId" = ${id}
      AND (${fromDate}::date IS NULL OR s.date >= ${fromDate}::date)
      AND (${toDate}::date IS NULL OR s.date <= ${toDate}::date)
    GROUP BY s.date
    ORDER BY s.date ASC
  `;

  const series = rows.map((r: { date: Date; views: bigint; likes: bigint; comments: bigint }) => ({
    date: r.date.toISOString().slice(0, 10),
    views: Number(r.views),
    likes: Number(r.likes),
    comments: Number(r.comments),
  }));

  // Latest vs previous day comparison
  const last2 = series.slice(-2);
  const latest = last2[1] ?? null;
  const previous = last2[0] ?? null;

  const comparison =
    latest && previous
      ? {
          views: latest.views - previous.views,
          likes: latest.likes - previous.likes,
          comments: latest.comments - previous.comments,
        }
      : null;

  return NextResponse.json({ series, comparison });
}
