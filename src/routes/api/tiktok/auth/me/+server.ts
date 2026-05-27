import { json } from '@sveltejs/kit';
import { readSession } from '$lib/server/tiktokSession';

/**
 * GET /api/tiktok/auth/me
 *
 * Reports the current connection state to the frontend so it can render
 * "Connected as @x" without exposing tokens.
 */
export async function GET({ cookies }) {
  const session = readSession(cookies);
  if (!session) {
    return json({ connected: false });
  }
  return json({
    connected: true,
    open_id: session.open_id,
    scope: session.scope,
    expires_at: new Date(session.expires_at).toISOString(),
    expires_in_seconds: Math.max(0, Math.round((session.expires_at - Date.now()) / 1000)),
    refresh_expires_at: new Date(session.refresh_expires_at).toISOString(),
  });
}
