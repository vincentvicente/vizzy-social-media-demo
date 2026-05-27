import { json } from '@sveltejs/kit';
import { readSession } from '$lib/server/instagramSession';

/**
 * GET /api/instagram/auth/me
 *
 * Reports the current connection state to the frontend so it can render
 * "Connected as @x" without exposing the access_token.
 */
export async function GET({ cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ connected: false });
	}
	return json({
		connected: true,
		user_id: session.user_id,
		scope: session.scope,
		expires_at: new Date(session.expires_at).toISOString(),
		expires_in_seconds: Math.max(0, Math.round((session.expires_at - Date.now()) / 1000)),
		issued_at: new Date(session.issued_at).toISOString()
	});
}
