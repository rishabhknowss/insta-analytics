import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  type Row = {
    id: string;
    username: string | null;
    last24hPosted: bigint;
    last24hViews: bigint;
    mvReelId: string | null;
    mvPermalink: string | null;
    mvThumbnail: string | null;
    mvViews: bigint;
    mvLikes: bigint;
    totalReels: bigint;
    totalViews: bigint;
  };

  const rows = await prisma.$queryRaw<Row[]>`
    WITH
      latest_date AS (
        SELECT MAX(date) AS d FROM reel_daily_stats
      ),
      latest_snap AS (
        SELECT r."accountId",
          SUM(s.views)    AS views,
          SUM(s.likes)    AS likes,
          SUM(s.comments) AS comments
        FROM reel_daily_stats s
        JOIN reels r ON r.id = s."reelId"
        WHERE s.date = (SELECT d FROM latest_date)
        GROUP BY r."accountId"
      ),
      most_viewed AS (
        SELECT DISTINCT ON (r."accountId")
          r."accountId",
          r.id          AS "mvReelId",
          r.permalink   AS "mvPermalink",
          r."thumbnailUrl" AS "mvThumbnail",
          s.views       AS "mvViews",
          s.likes       AS "mvLikes"
        FROM reel_daily_stats s
        JOIN reels r ON r.id = s."reelId"
        WHERE s.date = (SELECT d FROM latest_date)
        ORDER BY r."accountId", s.views DESC
      ),
      last_24h_posted AS (
        SELECT "accountId", COUNT(*) AS cnt
        FROM reels
        WHERE "publishedAt" IS NOT NULL
          AND "publishedAt" >= NOW() - INTERVAL '24 hours'
        GROUP BY "accountId"
      ),
      last_24h_views AS (
        SELECT r."accountId", SUM(s.views) AS views
        FROM reel_daily_stats s
        JOIN reels r ON r.id = s."reelId"
        WHERE s.date = (SELECT d FROM latest_date)
          AND r."publishedAt" >= NOW() - INTERVAL '24 hours'
        GROUP BY r."accountId"
      ),
      total_reels AS (
        SELECT "accountId", COUNT(*) AS cnt FROM reels GROUP BY "accountId"
      )
    SELECT
      a.id,
      a.username,
      COALESCE(l24p.cnt,   0) AS "last24hPosted",
      COALESCE(l24v.views, 0) AS "last24hViews",
      mv."mvReelId",
      mv."mvPermalink",
      mv."mvThumbnail",
      COALESCE(mv."mvViews", 0) AS "mvViews",
      COALESCE(mv."mvLikes", 0) AS "mvLikes",
      COALESCE(tr.cnt,  0) AS "totalReels",
      COALESCE(ls.views, 0) AS "totalViews"
    FROM accounts a
    LEFT JOIN latest_snap      ls   ON ls."accountId"   = a.id
    LEFT JOIN most_viewed      mv   ON mv."accountId"   = a.id
    LEFT JOIN last_24h_posted  l24p ON l24p."accountId" = a.id
    LEFT JOIN last_24h_views   l24v ON l24v."accountId" = a.id
    LEFT JOIN total_reels      tr   ON tr."accountId"   = a.id
    ORDER BY COALESCE(ls.views, 0) DESC
  `;

  return NextResponse.json(
    rows.map((r: Row) => ({
      id: r.id,
      username: r.username,
      last24hPosted: Number(r.last24hPosted),
      last24hViews: Number(r.last24hViews),
      mvReelId: r.mvReelId,
      mvPermalink: r.mvPermalink,
      mvThumbnail: r.mvThumbnail,
      mvViews: Number(r.mvViews),
      mvLikes: Number(r.mvLikes),
      totalReels: Number(r.totalReels),
      totalViews: Number(r.totalViews),
    })),
  );
}
