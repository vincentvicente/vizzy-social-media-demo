import { json } from '@sveltejs/kit';
import {
  TIKTOK_AUTHORIZE_URL,
  TIKTOK_REDIRECT_URI,
  TIKTOK_SCOPES,
  clientCreds,
} from '$lib/server/tiktok';
import { generateOAuthState, setOAuthStateCookie } from '$lib/server/tiktokSession';

/**
 * GET /api/tiktok/auth/url
 *
 * Builds the TikTok OAuth authorize URL with a CSRF state and stashes the
 * state in an HttpOnly cookie. Frontend redirects the browser to the URL;
 * TikTok will redirect back to /api/tiktok/auth/callback after consent.
 */
export async function GET({ cookies }) {
  const state = generateOAuthState();
  setOAuthStateCookie(cookies, state);

  const params = new URLSearchParams({
    client_key: clientCreds.key,
    scope: TIKTOK_SCOPES.join(','),
    response_type: 'code',
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
  });

  return json({
    authorize_url: `${TIKTOK_AUTHORIZE_URL}?${params.toString()}`,
    state,
  });
}
