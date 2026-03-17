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
    { date: Date; views: bigint; likes: bigint; comments: bigint; reels: bigint }[]
  >`
    WITH latest_snap AS (SELECT MAX(date) AS d FROM reel_daily_stats)
    SELECT
      DATE(r."publishedAt") AS date,
      COALESCE(SUM(s.views), 0)    AS views,
      COALESCE(SUM(s.likes), 0)    AS likes,
      COALESCE(SUM(s.comments), 0) AS comments,
      COUNT(DISTINCT r.id)         AS reels
    FROM reels r
    LEFT JOIN reel_daily_stats s
      ON s."reelId" = r.id AND s.date = (SELECT d FROM latest_snap)
    WHERE r."accountId" = ${id}
      AND r."publishedAt" IS NOT NULL
      AND (${fromDate}::date IS NULL OR DATE(r."publishedAt") >= ${fromDate}::date)
      AND (${toDate}::date IS NULL OR DATE(r."publishedAt") <= ${toDate}::date)
    GROUP BY DATE(r."publishedAt")
    ORDER BY date ASC
  `;

  const series = rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    views: Number(r.views),
    likes: Number(r.likes),
    comments: Number(r.comments),
    reels: Number(r.reels),
  }));

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
