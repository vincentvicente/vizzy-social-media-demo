import { json } from '@sveltejs/kit';
import { clearSession } from '$lib/server/instagramSession';

/**
 * POST /api/instagram/auth/logout
 *
 * Drops the encrypted session cookie. We don't call an IG revoke endpoint
 * (Instagram Login doesn't expose one for app-side revocation — the user can
 * revoke from Instagram → Settings → Apps and websites if they want a hard
 * revoke).
 */
export async function POST({ cookies }) {
	clearSession(cookies);
	return json({ ok: true });
}
