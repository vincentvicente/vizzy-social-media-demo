import { json } from '@sveltejs/kit';
import { igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/my/growth?days=30
 *
 * Returns `follower_count` day-by-day time series over the last N days
 * (capped at 30 by Meta).
 *
 * Meta constraint: returns empty unless the account has ≥ 100 followers.
 * Docs: developers.facebook.com/docs/instagram-platform/api-reference/instagram-user/insights
 */
export async function GET({ cookies, url }) {
	const session = readSession(cookies);
	if (!session) return json({ error: 'not_connected' }, { status: 401 });

	const requested = parseInt(url.searchParams.get('days') ?? '30', 10) || 30;
	const days = Math.min(Math.max(requested, 1), 30);
	const until = Math.floor(Date.now() / 1000);
	const since = until - days * 24 * 60 * 60;

	const res = await igGraphGet('/me/insights', session.access_token, {
		metric: 'follower_count',
		period: 'day',
		since: String(since),
		until: String(until)
	});
	return json(res.body, { status: res.status });
}
