import { json } from '@sveltejs/kit';
import { ttOAuthFetch, clientCreds } from '$lib/server/tiktok';
import { readSession, writeSession } from '$lib/server/tiktokSession';

type RefreshResponse = {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

/**
 * POST /api/tiktok/auth/refresh
 *
 * Manually exchange the stored refresh_token for a new access_token. Returns
 * the new expiry. The access_token never leaves the server.
 */
export async function POST({ cookies }) {
  const session = readSession(cookies);
  if (!session) {
    return json({ error: 'not_connected' }, { status: 401 });
  }

  const res = await ttOAuthFetch<RefreshResponse | { error: string; error_description: string }>(
    {
      client_key: clientCreds.key,
      client_secret: clientCreds.secret,
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token,
    }
  );

  if (!res.ok || !('access_token' in (res.body as object))) {
    return json({ step: 'refresh', ...res }, { status: res.status });
  }

  const t = res.body as RefreshResponse;
  const now = Date.now();
  writeSession(cookies, {
    ...session,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: now + t.expires_in * 1000,
    refresh_expires_at: now + t.refresh_expires_in * 1000,
    scope: t.scope,
  });

  return json({
    refreshed: true,
    expires_at: new Date(now + t.expires_in * 1000).toISOString(),
    expires_in_seconds: t.expires_in,
  });
}
