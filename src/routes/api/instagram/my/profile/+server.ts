import { json } from '@sveltejs/kit';
import { PROFILE_FIELDS, igGraphGet } from '$lib/server/instagram';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/my/profile
 *
 * Returns the connected creator's account info: username, display name,
 * account_type (BUSINESS / MEDIA_CREATOR / PERSONAL), avatar, follower /
 * follows / media counts, biography, website.
 *
 * Underlying call: GET /v23.0/me?fields=...
 */
export async function GET({ cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}

	const res = await igGraphGet('/me', session.access_token, {
		fields: PROFILE_FIELDS.join(',')
	});
	return json(res.body, { status: res.status });
}
