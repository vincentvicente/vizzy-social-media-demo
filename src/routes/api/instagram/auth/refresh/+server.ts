import { json } from '@sveltejs/kit';
import { readSession } from '$lib/server/instagramSession';

/**
 * POST /api/instagram/auth/refresh
 *
 * Currently disabled. The IG callback is running in short-token mode (the
 * long-token / refresh_access_token endpoint requires Business Verification +
 * Access Verification on the Meta app, which we haven't completed — see the
 * callback handler for context). Testers should just re-Connect Instagram to
 * renew the 1-hour short token.
 *
 * When Meta-side verification clears, restore the previous refresh flow from
 * git history.
 */
export async function POST({ cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}
	return json(
		{
			error: 'refresh_disabled',
			message:
				'IG token refresh is disabled while the app is in short-token mode (1h sessions, pending Meta Business + Access Verification). Click Connect Instagram again to renew.'
		},
		{ status: 400 }
	);
}
