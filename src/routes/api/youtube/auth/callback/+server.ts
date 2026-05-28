import { redirect } from '@sveltejs/kit';
import { googleOAuthFetch, clientCreds, GOOGLE_REDIRECT_URI } from '$lib/server/youtube';
import { decodeIdTokenPayload, writeSession } from '$lib/server/youtubeSession';
import { verifyOAuthState } from '$lib/server/session';

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
};

/**
 * GET /api/youtube/auth/callback?code=...&state=...
 *
 * Google redirects here after consent. We:
 *   1. Validate the state cookie matches the state param (CSRF check)
 *   2. Exchange the code for access_token + refresh_token + id_token
 *   3. Persist the tokens server-side keyed by a fresh session id
 *   4. Set the session id as an HttpOnly cookie
 *   5. Redirect the browser back to /
 */
export async function GET({ url, cookies }) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (oauthError) {
    throw redirect(
      303,
      `/?connect_error=${encodeURIComponent(oauthError)}&error_description=${encodeURIComponent(errorDescription ?? '')}&platform=youtube`
    );
  }

  if (!code || !state) {
    throw redirect(
      303,
      `/?connect_error=missing_oauth_params&error_description=${encodeURIComponent('Callback hit without code or state — the OAuth flow was interrupted. Start over from Connect YouTube.')}&platform=youtube`
    );
  }

  if (!verifyOAuthState(state)) {
    throw redirect(
      303,
      `/?connect_error=state_mismatch&error_description=${encodeURIComponent('OAuth state is invalid or expired (>10 min between click and complete). Start over from Connect YouTube.')}&platform=youtube`
    );
  }

  const tokenRes = await googleOAuthFetch<TokenResponse | { error: string; error_description?: string }>(
    {
      client_id: clientCreds.id,
      client_secret: clientCreds.secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }
  );

  if (!tokenRes.ok || !('access_token' in (tokenRes.body as object))) {
    const body = tokenRes.body as { error?: string; error_description?: string };
    throw redirect(
      303,
      `/?connect_error=${encodeURIComponent(body?.error ?? 'token_exchange_failed')}&error_description=${encodeURIComponent(body?.error_description ?? `HTTP ${tokenRes.status}`)}&platform=youtube`
    );
  }

  const t = tokenRes.body as TokenResponse;
  const now = Date.now();

  const idPayload = t.id_token ? decodeIdTokenPayload(t.id_token) : null;
  const email = (idPayload?.email as string | undefined) ?? 'unknown';

  writeSession(cookies, {
    email,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: now + t.expires_in * 1000,
    scope: t.scope,
  });

  throw redirect(303, '/');
}
