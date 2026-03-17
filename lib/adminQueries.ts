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
  timeSeries: { date: string; views: number; reels: number }[];
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
    prisma.account.count({
      where: { posters: { none: { disabled: true } } },
    }),
    prisma.reel.count({
      where: { account: { posters: { none: { disabled: true } } } },
    }),

    prisma.$queryRaw<
      { latestViews: bigint; prevViews: bigint; latestLikes: bigint; latestComments: bigint }[]
    >`
      WITH disabled_accts AS (
        SELECT "accountId" FROM posters WHERE disabled = true AND "accountId" IS NOT NULL
      ),
      ranked_dates AS (
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
      JOIN reels r ON r.id = s."reelId"
      WHERE r."accountId" NOT IN (SELECT "accountId" FROM disabled_accts)
    `,

    prisma.$queryRaw<{ date: Date; views: bigint; reels: bigint }[]>`
      WITH disabled_accts AS (
        SELECT "accountId" FROM posters WHERE disabled = true AND "accountId" IS NOT NULL
      ),
      latest_snap AS (SELECT MAX(date) AS d FROM reel_daily_stats)
      SELECT
        DATE(r."publishedAt") AS date,
        COALESCE(SUM(s.views), 0) AS views,
        COUNT(DISTINCT r.id) AS reels
      FROM reels r
      LEFT JOIN reel_daily_stats s
        ON s."reelId" = r.id AND s.date = (SELECT d FROM latest_snap)
      WHERE r."publishedAt" IS NOT NULL
        AND r."accountId" NOT IN (SELECT "accountId" FROM disabled_accts)
      GROUP BY DATE(r."publishedAt")
      ORDER BY date ASC
    `,

    prisma.$queryRaw<{ last24hPosted: bigint; last24hViews: bigint }[]>`
      WITH disabled_accts AS (
        SELECT "accountId" FROM posters WHERE disabled = true AND "accountId" IS NOT NULL
      ),
      latest_date AS (SELECT MAX(date) AS d FROM reel_daily_stats)
      SELECT
        COUNT(DISTINCT r.id)       AS "last24hPosted",
        COALESCE(SUM(s.views), 0)  AS "last24hViews"
      FROM reels r
      LEFT JOIN reel_daily_stats s
        ON s."reelId" = r.id AND s.date = (SELECT d FROM latest_date)
      WHERE r."publishedAt" IS NOT NULL
        AND r."publishedAt" >= NOW() - INTERVAL '24 hours'
        AND r."accountId" NOT IN (SELECT "accountId" FROM disabled_accts)
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
      (r: { date: Date; views: bigint; reels: bigint }) => ({
        date: r.date.toISOString().slice(0, 10),
        views: Number(r.views),
        reels: Number(r.reels),
      }),
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
  last24hViews: number;
  username: string | null;
  accountId: string | null;
  payments: { id: number; amount: number; note: string; paidAt: string }[];
  createdAt: string;
};

/**
 * Auto-link posters that have no accountId by matching their Instagram
 * username against Account.username in the DB.
 */
async function autoLinkPosters() {
  const unlinked = await prisma.poster.findMany({
    where: { accountId: null },
    select: { id: true, instagramLink: true },
  });

  if (unlinked.length === 0) return;

  const accounts = await prisma.account.findMany({
    where: { username: { not: null } },
    select: { id: true, username: true },
  });

  const usernameToAccountId = new Map<string, string>();
  for (const a of accounts) {
    if (a.username) usernameToAccountId.set(a.username.toLowerCase(), a.id);
  }

  for (const poster of unlinked) {
    const match = poster.instagramLink.match(/instagram\.com\/([^\/?#]+)/);
    if (!match) continue;
    const handle = match[1].toLowerCase();
    const accountId = usernameToAccountId.get(handle);
    if (accountId) {
      await prisma.poster.update({
        where: { id: poster.id },
        data: { accountId },
      });
    }
  }
}

export async function getPosterRows(): Promise<PosterRow[]> {
  await autoLinkPosters();

  const posters = await prisma.poster.findMany({
    where: { disabled: false },
    include: {
      payments: { orderBy: { paidAt: "desc" } },
      account: {
        select: { id: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  type PosterWithRelations = (typeof posters)[number];

  const linkedAccountIds = posters
    .map((p: PosterWithRelations) => p.accountId)
    .filter((id: string | null): id is string => id !== null);

  // Batch-fetch views per account from the latest snapshot
  const viewsMap = new Map<string, { totalViews: number; last24hViews: number }>();

  if (linkedAccountIds.length > 0) {
    type ViewRow = { accountId: string; totalViews: bigint; last24hViews: bigint };
    const viewRows = await prisma.$queryRaw<ViewRow[]>`
      WITH latest_date AS (SELECT MAX(date) AS d FROM reel_daily_stats)
      SELECT
        r."accountId",
        COALESCE(SUM(s.views), 0) AS "totalViews",
        COALESCE(SUM(
          CASE WHEN r."publishedAt" >= NOW() - INTERVAL '24 hours'
               THEN s.views ELSE 0 END
        ), 0) AS "last24hViews"
      FROM reels r
      JOIN reel_daily_stats s
        ON s."reelId" = r.id AND s.date = (SELECT d FROM latest_date)
      WHERE r."accountId" = ANY(${linkedAccountIds})
      GROUP BY r."accountId"
    `;
    for (const row of viewRows) {
      viewsMap.set(row.accountId, {
        totalViews: Number(row.totalViews),
        last24hViews: Number(row.last24hViews),
      });
    }
  }

  return posters.map((p: PosterWithRelations) => {
    const views = p.accountId ? viewsMap.get(p.accountId) : undefined;
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
      totalViews: views?.totalViews ?? 0,
      last24hViews: views?.last24hViews ?? 0,
      username: p.account?.username ?? null,
      accountId: p.accountId,
      payments: p.payments.map((pay: PosterWithRelations["payments"][number]) => ({
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
      disabled_accts AS (
        SELECT "accountId" FROM posters WHERE disabled = true AND "accountId" IS NOT NULL
      ),
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
    WHERE a.id NOT IN (SELECT "accountId" FROM disabled_accts)
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
