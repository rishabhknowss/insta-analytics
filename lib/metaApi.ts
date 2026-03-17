const META_GRAPH_BASE = "https://graph.instagram.com/v25.0";

export async function fetchJson<T>(
  path: string,
  accessToken: string,
  searchParams?: Record<string, string>,
): Promise<T> {
  const params = new URLSearchParams({
    access_token: accessToken,
    ...(searchParams ?? {}),
  });

  const url = `${META_GRAPH_BASE}${path}?${params.toString()}`;
  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    console.error(`[metaApi] ${path} failed (${res.status}):`, text.slice(0, 500));
    throw new Error(`Instagram API error on ${path}: ${res.status} — ${text.slice(0, 200)}`);
  }

  return JSON.parse(text) as T;
}

