import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalAccounts, totalReels, topStats, timeSeries, postedCounts] = await Promise.all([
    prisma.account.count(),
    prisma.reel.count(),

    // Latest vs previous snapshot totals
    prisma.$queryRaw<
      { latestViews: bigint; prevViews: bigint; latestLikes: bigint; latestComments: bigint }[]
    >`
      WITH ranked_dates AS (
        SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) AS rn
        FROM (SELECT DISTINCT date FROM reel_daily_stats) d
      )
      SELECT
        COALESCE(SUM(CASE WHEN rd.rn = 1 THEN s.views    ELSE 0 END), 0) AS "latestViews",
        COALESCE(SUM(CASE WHEN rd.rn = 2 THEN s.views    ELSE 0 END), 0) AS "prevViews",
        COALESCE(SUM(CASE WHEN rd.rn = 1 THEN s.likes    ELSE 0 END), 0) AS "latestLikes",
        COALESCE(SUM(CASE WHEN rd.rn = 1 THEN s.comments ELSE 0 END), 0) AS "latestComments"
      FROM reel_daily_stats s
      JOIN ranked_dates rd ON s.date = rd.date AND rd.rn <= 2
    `,

    // Time series per snapshot date
    prisma.$queryRaw<{ date: Date; views: bigint; likes: bigint; comments: bigint }[]>`
      SELECT
        s.date,
        SUM(s.views)    AS views,
        SUM(s.likes)    AS likes,
        SUM(s.comments) AS comments
      FROM reel_daily_stats s
      GROUP BY s.date
      ORDER BY s.date ASC
    `,

    // Last 24h posted count + views for those reels in latest snapshot
    prisma.$queryRaw<{ last24hPosted: bigint; last24hViews: bigint }[]>`
      WITH latest_date AS (SELECT MAX(date) AS d FROM reel_daily_stats)
      SELECT
        COUNT(DISTINCT r.id)                                    AS "last24hPosted",
        COALESCE(SUM(s.views), 0)                              AS "last24hViews"
      FROM reels r
      LEFT JOIN reel_daily_stats s
        ON s."reelId" = r.id AND s.date = (SELECT d FROM latest_date)
      WHERE r."publishedAt" IS NOT NULL
        AND r."publishedAt" >= NOW() - INTERVAL '24 hours'
    `,
  ]);

  const t = topStats[0] ?? { latestViews: 0n, prevViews: 0n, latestLikes: 0n, latestComments: 0n };
  const p = postedCounts[0] ?? { last24hPosted: 0n, last24hViews: 0n };

  return NextResponse.json({
    totalAccounts,
    totalReels,
    latestViews: Number(t.latestViews),
    prevViews: Number(t.prevViews),
    viewsDelta: Number(t.latestViews) - Number(t.prevViews),
    latestLikes: Number(t.latestLikes),
    latestComments: Number(t.latestComments),
    last24hPosted: Number(p.last24hPosted),
    last24hViews: Number(p.last24hViews),
    timeSeries: timeSeries.map((r: { date: Date; views: bigint; likes: bigint; comments: bigint }) => ({
      date: r.date.toISOString().slice(0, 10),
      views: Number(r.views),
    })),
  });
}
