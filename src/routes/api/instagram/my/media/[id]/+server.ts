import { json } from '@sveltejs/kit';
import { MEDIA_FIELDS, igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/my/media/{id}
 *
 * Single-media detail. Same fields as the list endpoint, plus we make this
 * separately addressable so the UI can re-query a row after stats may have
 * changed (e.g. just after liking).
 *
 * Underlying call: GET /v23.0/{media-id}?fields=...
 */
export async function GET({ params, cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}

	const res = await igGraphGet(`/${params.id}`, session.access_token, {
		fields: MEDIA_FIELDS.join(',')
	});
	return json(res.body, { status: res.status });
}
