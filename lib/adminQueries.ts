import { prisma } from "@/lib/prisma";

export type GlobalStats = {
  totalAccounts: number;
  totalReels: number;
  latestViews: number;
  prevViews: number;
  viewsDelta: number;
  latestLikes: number;
  latestComments: number;
  last24hPosted: number;
  last24hViews: number;
  timeSeries: { date: string; views: number; dailyViews: number }[];
};

export type AccountRow = {
  id: string;
  username: string | null;
  last24hPosted: number;
  last24hViews: number;
  mvReelId: string | null;
  mvPermalink: string | null;
  mvThumbnail: string | null;
  mvViews: number;
  mvLikes: number;
  totalReels: number;
  totalViews: number;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  const [totalAccounts, totalReels, topStats, timeSeries, postedCounts] = await Promise.all([
    prisma.account.count(),
    prisma.reel.count(),

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

    prisma.$queryRaw<{ last24hPosted: bigint; last24hViews: bigint }[]>`
      WITH latest_date AS (SELECT MAX(date) AS d FROM reel_daily_stats)
      SELECT
        COUNT(DISTINCT r.id)       AS "last24hPosted",
        COALESCE(SUM(s.views), 0)  AS "last24hViews"
      FROM reels r
      LEFT JOIN reel_daily_stats s
        ON s."reelId" = r.id AND s.date = (SELECT d FROM latest_date)
      WHERE r."publishedAt" IS NOT NULL
        AND r."publishedAt" >= NOW() - INTERVAL '24 hours'
    `,
  ]);

  const t = topStats[0] ?? { latestViews: 0n, prevViews: 0n, latestLikes: 0n, latestComments: 0n };
  const p = postedCounts[0] ?? { last24hPosted: 0n, last24hViews: 0n };

  return {
    totalAccounts,
    totalReels,
    latestViews: Number(t.latestViews),
    prevViews: Number(t.prevViews),
    viewsDelta: Number(t.latestViews) - Number(t.prevViews),
    latestLikes: Number(t.latestLikes),
    latestComments: Number(t.latestComments),
    last24hPosted: Number(p.last24hPosted),
    last24hViews: Number(p.last24hViews),
    timeSeries: timeSeries.map(
      (r: { date: Date; views: bigint; likes: bigint; comments: bigint }, i: number) => {
        const totalViews = Number(r.views);
        const prevTotalViews = i > 0 ? Number(timeSeries[i - 1].views) : 0;
        return {
          date: r.date.toISOString().slice(0, 10),
          views: totalViews,
          dailyViews: Math.max(totalViews - prevTotalViews, 0),
        };
      },
    ),
  };
}

export type PosterRow = {
  id: number;
  telegramChatId: string;
  instagramLink: string;
  channelName: string;
  groupLink: string;
  managedBy: string;
  paidStatus: string;
  monthlyRate: number;
  totalPaid: number;
  remaining: number;
  totalViews: number;
  username: string | null;
  accountId: string | null;
  payments: { id: number; amount: number; note: string; paidAt: string }[];
  createdAt: string;
};

export async function getPosterRows(): Promise<PosterRow[]> {
  const posters = await prisma.poster.findMany({
    include: {
      payments: { orderBy: { paidAt: "desc" } },
      account: {
        select: {
          id: true,
          username: true,
          reels: {
            select: { dailyStats: { orderBy: { date: "desc" }, take: 1 } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return posters.map((p) => {
    let totalViews = 0;
    if (p.account) {
      for (const reel of p.account.reels) {
        totalViews += reel.dailyStats[0]?.views ?? 0;
      }
    }
    return {
      id: p.id,
      telegramChatId: p.telegramChatId.toString(),
      instagramLink: p.instagramLink,
      channelName: p.channelName,
      groupLink: p.groupLink,
      managedBy: p.managedBy,
      paidStatus: p.paidStatus,
      monthlyRate: p.monthlyRate,
      totalPaid: p.totalPaid,
      remaining: p.monthlyRate - p.totalPaid,
      totalViews,
      username: p.account?.username ?? null,
      accountId: p.accountId,
      payments: p.payments.map((pay) => ({
        id: pay.id,
        amount: pay.amount,
        note: pay.note,
        paidAt: pay.paidAt.toISOString(),
      })),
      createdAt: p.createdAt.toISOString(),
    };
  });
}

export async function getAccountRows(): Promise<AccountRow[]> {
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
    LEFT JOIN total_reels      tr   ON tr.  "accountId" = a.id
    ORDER BY COALESCE(ls.views, 0) DESC
  `;

  return rows.map((r: Row) => ({
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
  }));
}
