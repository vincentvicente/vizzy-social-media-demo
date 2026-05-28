import { json } from '@sveltejs/kit';
import { igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/my/audience?breakdown=age|country|gender|city&timeframe=last_30_days|this_month|last_90_days|prior_month|prior_90_days
 *
 * Returns `follower_demographics` — the connected account's followers broken
 * down by the requested dimension over the given timeframe.
 *
 * Meta constraint: returns empty unless the account has ≥ 100 followers.
 * Docs: developers.facebook.com/docs/instagram-platform/api-reference/instagram-user/insights
 */
export async function GET({ cookies, url }) {
	const session = readSession(cookies);
	if (!session) return json({ error: 'not_connected' }, { status: 401 });

	const breakdown = url.searchParams.get('breakdown') ?? 'age';
	const timeframe = url.searchParams.get('timeframe') ?? 'last_30_days';

	const res = await igGraphGet('/me/insights', session.access_token, {
		metric: 'follower_demographics',
		period: 'lifetime',
		timeframe,
		breakdown,
		metric_type: 'total_value'
	});
	return json(res.body, { status: res.status });
}
