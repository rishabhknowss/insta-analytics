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

  const res = await fetch(`${META_GRAPH_BASE}${path}?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Meta API error on ${path}: ${res.status}`);
  }

  return (await res.json()) as T;
}

