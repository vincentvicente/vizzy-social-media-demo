import { json } from '@sveltejs/kit';
import { ACCOUNT_INSIGHT_METRICS_DEFAULT, igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/my/insights?metric=reach,profile_views&period=day&days=28
 *
 * Account-level insights for the connected creator. Defaults cover the most
 * commonly-asked-for metrics; the UI exposes them as a checkbox group.
 *
 * IG quirks worth knowing:
 *   - period=day requires both `since` and `until` (Unix seconds).
 *   - Some metrics (reach, profile_views, accounts_engaged, total_interactions)
 *     accept `metric_type=total_value` to return a single aggregated number
 *     across the window; the UI uses this path because it's the most useful
 *     for a quick demo and avoids per-day timeseries noise.
 *   - `follower_count` is daily-only — exclude from total_value calls.
 *
 * Underlying call: GET /v23.0/{ig-user-id}/insights?metric=...&metric_type=total_value&period=day&since=...&until=...
 */
export async function GET({ url, cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}

	const metricParam = url.searchParams.get('metric');
	const metrics = metricParam ? metricParam.split(',') : [...ACCOUNT_INSIGHT_METRICS_DEFAULT];
	const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? '28'), 1), 90);

	const now = Math.floor(Date.now() / 1000);
	const since = now - days * 24 * 60 * 60;

	const res = await igGraphGet(`/${session.user_id}/insights`, session.access_token, {
		metric: metrics.join(','),
		metric_type: 'total_value',
		period: 'day',
		since: String(since),
		until: String(now)
	});
	return json(res.body, { status: res.status });
}
