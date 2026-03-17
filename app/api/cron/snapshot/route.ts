import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchJson } from "@/lib/metaApi";

type MediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type InsightsResponse = {
  data?: { name: string; values: { value: number }[] }[];
};

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let snapshotted = 0;

  for (const account of accounts) {
    try {
      const mediaData = await fetchJson<{ data?: MediaItem[] }>(
        `/${account.id}/media`,
        account.accessToken,
        {
          fields:
            "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp",
          limit: "50",
        },
      );

      const reels = (mediaData.data ?? []).filter((m) => {
        const type = m.media_product_type || m.media_type;
        return type === "REELS" || type === "REEL";
      });

      for (const media of reels) {
        // Upsert the reel record
        await prisma.reel.upsert({
          where: { id: media.id },
          update: {
            caption: media.caption ?? null,
            thumbnailUrl: media.thumbnail_url ?? media.media_url ?? null,
            permalink: media.permalink ?? null,
            publishedAt: media.timestamp ? new Date(media.timestamp) : undefined,
          },
          create: {
            id: media.id,
            accountId: account.id,
            caption: media.caption ?? null,
            thumbnailUrl: media.thumbnail_url ?? media.media_url ?? null,
            permalink: media.permalink ?? null,
            publishedAt: media.timestamp ? new Date(media.timestamp) : null,
          },
        });

        // Fetch insights
        let views = 0;
        let likes = 0;
        let comments = 0;

        try {
          const insights = await fetchJson<InsightsResponse>(
            `/${media.id}/insights`,
            account.accessToken,
            { metric: "views,likes,comments" },
          );

          for (const metric of insights.data ?? []) {
            const value = metric.values?.[0]?.value ?? 0;
            if (metric.name === "views") views = value;
            if (metric.name === "likes") likes = value;
            if (metric.name === "comments") comments = value;
          }
        } catch {
          // Insights may fail for old/unpublished reels — continue with zeros
        }

        // Upsert daily snapshot (idempotent — safe to re-run)
        await prisma.reelDailyStat.upsert({
          where: { reelId_date: { reelId: media.id, date: today } },
          update: { views, likes, comments },
          create: { reelId: media.id, date: today, views, likes, comments },
        });

        snapshotted++;
      }

      // Refresh username
      try {
        const profileRes = await fetch(
          `https://graph.instagram.com/v25.0/${account.id}?fields=id,username&access_token=${account.accessToken}`,
        );
        if (profileRes.ok) {
          const profile = (await profileRes.json()) as { username?: string };
          await prisma.account.update({
            where: { id: account.id },
            data: { lastSeenAt: new Date(), username: profile.username ?? undefined },
          });
        } else {
          await prisma.account.update({ where: { id: account.id }, data: { lastSeenAt: new Date() } });
        }
      } catch {
        await prisma.account.update({ where: { id: account.id }, data: { lastSeenAt: new Date() } });
      }
    } catch (err) {
      console.error(`Snapshot failed for account ${account.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, snapshotted });
}
