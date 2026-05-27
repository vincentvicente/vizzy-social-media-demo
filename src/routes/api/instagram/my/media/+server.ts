import { json } from '@sveltejs/kit';
import { MEDIA_FIELDS, igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/my/media?limit=25&after=<cursor>
 *
 * Paginated list of the creator's own posts with engagement counters. IG uses
 * cursor-based paging via `paging.next` / `paging.previous` containing a full
 * URL with an opaque `after`/`before` token. We surface the cursors back to
 * the UI so it can drive prev/next buttons.
 *
 * Underlying call: GET /v23.0/me/media?fields=...&limit=N[&after=...]
 */
export async function GET({ url, cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}

	const limit = Math.min(Number(url.searchParams.get('limit') ?? '25'), 100);
	const after = url.searchParams.get('after');
	const before = url.searchParams.get('before');

	const params: Record<string, string> = {
		fields: MEDIA_FIELDS.join(','),
		limit: String(limit)
	};
	if (after) params.after = after;
	if (before) params.before = before;

	const res = await igGraphGet('/me/media', session.access_token, params);
	return json(res.body, { status: res.status });
}
