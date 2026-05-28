import { json } from '@sveltejs/kit';
import {
	IG_AUTHORIZE_URL,
	IG_REDIRECT_URI,
	IG_SCOPES,
	clientCreds
} from '$lib/server/instagram';
import { signOAuthState } from '$lib/server/session';

/**
 * GET /api/instagram/auth/url
 *
 * Builds the IG OAuth authorize URL with a CSRF state and stashes the state
 * in an HttpOnly cookie. Frontend redirects the browser to the URL; IG will
 * redirect back to /api/instagram/auth/callback after consent.
 *
 * `enable_fb_login=0` and `force_authentication=1` are the recommended
 * defaults for Instagram Login (vs. Facebook Login) per Meta's docs.
 */
export async function GET() {
	const state = signOAuthState();

	const params = new URLSearchParams({
		client_id: clientCreds.id,
		redirect_uri: IG_REDIRECT_URI,
		response_type: 'code',
		scope: IG_SCOPES.join(','),
		state,
		enable_fb_login: '0',
		force_authentication: '1'
	});

	return json({
		authorize_url: `${IG_AUTHORIZE_URL}?${params.toString()}`,
		state
	});
}
