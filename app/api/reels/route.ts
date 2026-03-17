import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchJson } from "@/lib/metaApi";

type MediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

type InsightsResponse = {
  data?: {
    name: string;
    values: { value: number }[];
  }[];
};

export async function GET(_req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mediaData = await fetchJson<{ data?: MediaItem[] }>(
      `/${session.igUserId}/media`,
      session.accessToken,
      {
        fields:
          "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,is_shared_to_feed",
        limit: "25",
      },
    );

    const allMedia = mediaData.data ?? [];

    const reels = allMedia.filter((m) => {
      const type = (m as any).media_product_type || m.media_type;
      return type === "REELS" || type === "REEL";
    });

    const results = await Promise.all(
      reels.map(async (media) => {
        try {
          const insights = await fetchJson<InsightsResponse>(
            `/${media.id}/insights`,
            session.accessToken,
            {
              metric: "views,likes,comments,shares,saved,reach",
            },
          );

          let views = 0;
          let likes = 0;
          let comments = 0;

          for (const metric of insights.data ?? []) {
            const value = metric.values?.[0]?.value ?? 0;
            if (metric.name === "views") views = value;
            if (metric.name === "likes") likes = value;
            if (metric.name === "comments") comments = value;
          }

          return {
            id: media.id,
            caption: media.caption ?? "",
            thumbnailUrl: media.thumbnail_url ?? media.media_url ?? "",
            permalink: media.permalink ?? "",
            views,
            likes,
            comments,
          };
        } catch {
          return {
            id: media.id,
            caption: media.caption ?? "",
            thumbnailUrl: media.thumbnail_url ?? media.media_url ?? "",
            permalink: media.permalink ?? "",
            views: 0,
            likes: 0,
            comments: 0,
          };
        }
      }),
    );

    return NextResponse.json({ reels: results });
  } catch {
    return NextResponse.json(
      { error: "Failed to load reels" },
      { status: 500 },
    );
  }
}

