import { json } from '@sveltejs/kit';
import { clearSession } from '$lib/server/tiktokSession';

/**
 * POST /api/tiktok/auth/logout
 *
 * Drops the in-memory session and clears the cookie. We don't call TikTok's
 * /v2/oauth/revoke/ — for a demo this is fine; production should revoke too.
 */
export async function POST({ cookies }) {
  clearSession(cookies);
  return json({ ok: true });
}
