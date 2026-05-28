import { redirect } from '@sveltejs/kit';
import { ttOAuthFetch, clientCreds, TIKTOK_REDIRECT_URI } from '$lib/server/tiktok';
import {
  clearOAuthStateCookie,
  readOAuthStateCookie,
  writeSession,
} from '$lib/server/tiktokSession';

type TokenResponse = {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

/**
 * GET /api/tiktok/auth/callback?code=...&state=...
 *
 * TikTok redirects here after consent. We:
 *   1. Validate the state cookie matches the state param (CSRF check)
 *   2. Exchange the code for access_token + refresh_token
 *   3. Persist the tokens server-side keyed by a fresh session id
 *   4. Set the session id as an HttpOnly cookie
 *   5. Redirect the browser back to / where the UI hydrates from /me
 */
export async function GET({ url, cookies }) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (oauthError) {
    throw redirect(
      303,
      `/?connect_error=${encodeURIComponent(oauthError)}&error_description=${encodeURIComponent(errorDescription ?? '')}&platform=tiktok`
    );
  }

  if (!code || !state) {
    throw redirect(
      303,
      `/?connect_error=missing_oauth_params&error_description=${encodeURIComponent('Callback hit without code or state — the OAuth flow was interrupted. Start over from Connect TikTok.')}&platform=tiktok`
    );
  }

  const expectedState = readOAuthStateCookie(cookies);
  clearOAuthStateCookie(cookies);
  if (!expectedState || expectedState !== state) {
    throw redirect(
      303,
      `/?connect_error=state_mismatch&error_description=${encodeURIComponent('OAuth state did not match. Likely caused by multiple Connect attempts in different tabs, or refreshing/back during the flow. Close any other tabs and click Connect TikTok once.')}&platform=tiktok`
    );
  }

  const tokenRes = await ttOAuthFetch<TokenResponse | { error: string; error_description: string }>(
    {
      client_key: clientCreds.key,
      client_secret: clientCreds.secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI,
    }
  );

  if (!tokenRes.ok || !('access_token' in (tokenRes.body as object))) {
    const body = tokenRes.body as { error?: string; error_description?: string };
    throw redirect(
      303,
      `/?connect_error=${encodeURIComponent(body?.error ?? 'token_exchange_failed')}&error_description=${encodeURIComponent(body?.error_description ?? `HTTP ${tokenRes.status}`)}&platform=tiktok`
    );
  }

  const t = tokenRes.body as TokenResponse;
  const now = Date.now();

  writeSession(cookies, {
    open_id: t.open_id,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: now + t.expires_in * 1000,
    refresh_expires_at: now + t.refresh_expires_in * 1000,
    scope: t.scope,
  });

  throw redirect(303, '/');
}
