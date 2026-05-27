import {
	INSTAGRAM_CLIENT_ID,
	INSTAGRAM_CLIENT_SECRET,
	INSTAGRAM_REDIRECT_ORIGIN
} from '$env/static/private';

/**
 * Instagram API with Instagram Login — endpoints, scopes, fetch helpers.
 *
 * Three different hosts are in play:
 *   - www.instagram.com/oauth/authorize    → user-facing consent screen
 *   - api.instagram.com/oauth/access_token → short-lived token exchange
 *   - graph.instagram.com                  → everything else (long-lived
 *     exchange, refresh, /me, /me/media, insights …)
 *
 * Source of truth:
 * https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 */
export const IG_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize';
export const IG_OAUTH_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
export const IG_GRAPH_BASE = 'https://graph.instagram.com';
export const IG_GRAPH_VERSION = 'v23.0';

export const IG_REDIRECT_URI = `${INSTAGRAM_REDIRECT_ORIGIN}/api/instagram/auth/callback`;

/**
 * Minimum scopes for this demo:
 *   - instagram_business_basic         → /me, /me/media, per-media basic fields
 *   - instagram_business_manage_insights → /{ig-user}/insights, /{media}/insights
 *
 * Other scopes (publish / comments / messages) are not exercised by the demo
 * and would only trigger extra consent prompts.
 */
export const IG_SCOPES = ['instagram_business_basic', 'instagram_business_manage_insights'] as const;

export const clientCreds = {
	id: INSTAGRAM_CLIENT_ID,
	secret: INSTAGRAM_CLIENT_SECRET
};

export type IGResult<T = unknown> = {
	ok: boolean;
	status: number;
	body: T;
};

/**
 * GET against graph.instagram.com with the access_token in the query string.
 * IG accepts `?access_token=...` and `Authorization: Bearer ...` interchangeably;
 * the query-string form matches the official docs verbatim, so we use that.
 */
export async function igGraphGet<T = unknown>(
	path: string,
	accessToken: string,
	params: Record<string, string> = {}
): Promise<IGResult<T>> {
	const url = new URL(`${IG_GRAPH_BASE}/${IG_GRAPH_VERSION}${path}`);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	url.searchParams.set('access_token', accessToken);
	const res = await fetch(url, { method: 'GET' });
	return parseResult<T>(res);
}

/** POST form-urlencoded to api.instagram.com/oauth/access_token. */
export async function igOAuthExchange<T = unknown>(
	body: Record<string, string>
): Promise<IGResult<T>> {
	const res = await fetch(IG_OAUTH_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(body).toString()
	});
	return parseResult<T>(res);
}

/**
 * GET against graph.instagram.com for the *unversioned* token endpoints
 * `/access_token` (ig_exchange_token) and `/refresh_access_token`
 * (ig_refresh_token). These live at the host root, not under /v23.0.
 */
export async function igGraphTokenGet<T = unknown>(
	path: '/access_token' | '/refresh_access_token',
	params: Record<string, string>
): Promise<IGResult<T>> {
	const url = new URL(`${IG_GRAPH_BASE}${path}`);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	const res = await fetch(url, { method: 'GET' });
	return parseResult<T>(res);
}

async function parseResult<T>(res: Response): Promise<IGResult<T>> {
	const text = await res.text();
	let body: unknown = text;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		/* leave as text */
	}
	return { ok: res.ok, status: res.status, body: body as T };
}

// ─── field & metric catalogs (kept here so endpoints stay one-liners) ─

export const PROFILE_FIELDS = [
	'user_id',
	'username',
	'name',
	'account_type',
	'profile_picture_url',
	'followers_count',
	'follows_count',
	'media_count',
	'biography',
	'website'
] as const;

export const MEDIA_FIELDS = [
	'id',
	'caption',
	'media_type',
	'media_url',
	'permalink',
	'thumbnail_url',
	'timestamp',
	'like_count',
	'comments_count',
	'is_shared_to_feed'
] as const;

/**
 * Per-media insight metric names, partitioned by media_type because IG rejects
 * the call if you ask for a metric the media doesn't support. The endpoint
 * picks the right list at request time.
 */
export const MEDIA_INSIGHT_METRICS = {
	IMAGE: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions'],
	CAROUSEL_ALBUM: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions'],
	VIDEO: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions', 'views'],
	REELS: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions', 'views'],
	STORY: ['reach', 'replies', 'shares', 'total_interactions']
} as const;

/**
 * Account-level insights. IG splits these into two groups by required params:
 *   - "metric_type=total_value" for the *_28 / *_30 cumulative metrics
 *   - period=day with since/until for daily time series
 * The endpoint accepts a metric list and forwards it as-is; the UI's default
 * set is below.
 */
export const ACCOUNT_INSIGHT_METRICS_DEFAULT = [
	'reach',
	'profile_views',
	'website_clicks',
	'accounts_engaged',
	'total_interactions'
] as const;
