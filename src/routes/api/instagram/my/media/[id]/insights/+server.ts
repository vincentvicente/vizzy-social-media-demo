import { json } from '@sveltejs/kit';
import { MEDIA_INSIGHT_METRICS, igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

type MediaTypeKey = keyof typeof MEDIA_INSIGHT_METRICS;

/**
 * GET /api/instagram/my/media/{id}/insights?media_type=REELS
 *
 * Per-media insights (reach, saved, total_interactions, likes, comments,
 * shares, views, …). The set of supported metrics differs by media_type:
 * Reels add `views`, Stories add `replies`, and the legacy `IMAGE` /
 * `CAROUSEL_ALBUM` types share a common subset. The caller passes the
 * media_type it already has from the list response so we don't need to
 * re-fetch it.
 *
 * Underlying call: GET /v23.0/{media-id}/insights?metric=...
 */
export async function GET({ params, url, cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}

	const mediaType = (url.searchParams.get('media_type') ?? 'IMAGE').toUpperCase();
	const metrics =
		MEDIA_INSIGHT_METRICS[mediaType as MediaTypeKey] ?? MEDIA_INSIGHT_METRICS.IMAGE;

	const res = await igGraphGet(`/${params.id}/insights`, session.access_token, {
		metric: metrics.join(',')
	});
	return json(res.body, { status: res.status });
}
