import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_REDIRECT_ORIGIN,
} from '$env/static/private';

export const TIKTOK_API_BASE = 'https://open.tiktokapis.com';
export const TIKTOK_AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/';

export const TIKTOK_REDIRECT_URI = `${TIKTOK_REDIRECT_ORIGIN}/api/tiktok/auth/callback`;

export const TIKTOK_SCOPES = [
  'user.info.basic',
  'user.info.profile',
  'user.info.stats',
  'video.list',
] as const;

export const USER_INFO_FIELDS = [
  'open_id',
  'union_id',
  'avatar_url',
  'avatar_url_100',
  'avatar_large_url',
  'display_name',
  'username',
  'bio_description',
  'profile_deep_link',
  'is_verified',
  'follower_count',
  'following_count',
  'likes_count',
  'video_count',
] as const;

export const VIDEO_FIELDS = [
  'id',
  'title',
  'video_description',
  'duration',
  'height',
  'width',
  'cover_image_url',
  'embed_link',
  'embed_html',
  'share_url',
  'view_count',
  'like_count',
  'comment_count',
  'share_count',
  'create_time',
] as const;

export type TTResult<T = unknown> = {
  ok: boolean;
  status: number;
  body: T;
};

export const clientCreds = {
  key: TIKTOK_CLIENT_KEY,
  secret: TIKTOK_CLIENT_SECRET,
};

/** Bearer-authed fetch against the TikTok Open API. */
export async function ttFetch<T = unknown>(
  path: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<TTResult<T>> {
  const url = `${TIKTOK_API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  return parseResult<T>(res);
}

/** Form-urlencoded POST to /v2/oauth/token/ — used for code-exchange and refresh. */
export async function ttOAuthFetch<T = unknown>(
  body: Record<string, string>
): Promise<TTResult<T>> {
  const res = await fetch(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body: new URLSearchParams(body).toString(),
  });
  return parseResult<T>(res);
}

async function parseResult<T>(res: Response): Promise<TTResult<T>> {
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* leave as text */
  }
  return { ok: res.ok, status: res.status, body: body as T };
}

/**
 * Extract a TikTok video_id from a variety of URL shapes:
 *   https://www.tiktok.com/@user/video/7234567890123456789
 *   https://www.tiktok.com/@user/video/7234567890123456789?...
 *   https://m.tiktok.com/v/7234567890123456789.html
 *   7234567890123456789  (raw id passed through)
 *
 * Short URLs (vm.tiktok.com/xxx, www.tiktok.com/t/xxx) need to be expanded
 * via expandShortUrl() first — they don't contain the numeric id directly.
 */
export function extractVideoId(input: string): string | null {
  const s = input.trim();

  // Already a raw id.
  if (/^\d{15,25}$/.test(s)) return s;

  // /@user/video/{id} or /v/{id}.html
  const m = s.match(/\/(?:video|v)\/(\d{15,25})/);
  if (m) return m[1];

  return null;
}

/** Detect short-link shapes that need expansion before extractVideoId can work. */
export function isShortTikTokUrl(input: string): boolean {
  return /^https?:\/\/(vm\.tiktok\.com|www\.tiktok\.com\/t)\//.test(input.trim());
}

/** HEAD-follow a TikTok short URL and return the final canonical URL. */
export async function expandShortUrl(shortUrl: string): Promise<string | null> {
  try {
    const res = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
    return res.url || null;
  } catch {
    return null;
  }
}
