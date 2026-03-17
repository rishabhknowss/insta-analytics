import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
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

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let snapshotted = 0;
  const errors: string[] = [];

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
          // insights may fail for old reels — continue with zeros
        }

        await prisma.reelDailyStat.upsert({
          where: { reelId_date: { reelId: media.id, date: today } },
          update: { views, likes, comments },
          create: { reelId: media.id, date: today, views, likes, comments },
        });

        snapshotted++;
      }

      await prisma.account.update({
        where: { id: account.id },
        data: { lastSeenAt: new Date() },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${account.id}: ${msg}`);
    }
  }

  return NextResponse.json({ ok: true, snapshotted, errors });
}
