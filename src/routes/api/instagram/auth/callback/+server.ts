import { redirect } from '@sveltejs/kit';
import { IG_REDIRECT_URI, clientCreds, igOAuthExchange } from '$lib/server/instagram';
import { writeSession } from '$lib/server/instagramSession';
import { verifyOAuthState } from '$lib/server/session';

type ShortLivedTokenResponse = {
	access_token: string;
	user_id: number | string;
	permissions?: string[];
};

/**
 * GET /api/instagram/auth/callback?code=...&state=...
 *
 * IG redirects here after consent. We:
 *   1. Validate state (CSRF check)
 *   2. Exchange code → short-lived access_token (1 h)
 *   3. Immediately exchange short-lived → long-lived access_token (60 d)
 *      so we don't have to track a 1-hour expiry
 *   4. Encrypt {user_id, access_token, expires_at} into the session cookie
 *   5. Redirect / where the UI hydrates from /api/instagram/auth/me
 */
export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const oauthError = url.searchParams.get('error');
	const errorReason = url.searchParams.get('error_reason');
	const errorDescription = url.searchParams.get('error_description');

	if (oauthError) {
		throw redirect(
			303,
			`/?connect_error=${encodeURIComponent(oauthError)}&error_description=${encodeURIComponent(errorDescription ?? errorReason ?? '')}&platform=instagram`
		);
	}

	if (!code || !state) {
		throw redirect(
			303,
			`/?connect_error=missing_oauth_params&error_description=${encodeURIComponent('Callback hit without code or state — the OAuth flow was interrupted. Start over from Connect Instagram.')}&platform=instagram`
		);
	}

	if (!verifyOAuthState(state)) {
		throw redirect(
			303,
			`/?connect_error=state_mismatch&error_description=${encodeURIComponent('OAuth state is invalid or expired (>10 min between click and complete). Start over from Connect Instagram.')}&platform=instagram`
		);
	}

	// Step 1: code → short-lived token (lives 1 hour).
	// IG strips fragments off the redirect URI on its side, so anything after
	// `?code=` on the URL we received does NOT need to be echoed here.
	const shortRes = await igOAuthExchange<ShortLivedTokenResponse | { error_message: string }>({
		client_id: clientCreds.id,
		client_secret: clientCreds.secret,
		grant_type: 'authorization_code',
		redirect_uri: IG_REDIRECT_URI,
		code
	});

	if (!shortRes.ok || !('access_token' in (shortRes.body as object))) {
		const b = shortRes.body as { error_message?: string; error_type?: string };
		throw redirect(
			303,
			`/?connect_error=${encodeURIComponent(b?.error_type ?? 'short_token_exchange_failed')}&error_description=${encodeURIComponent(b?.error_message ?? `HTTP ${shortRes.status}`)}&platform=instagram`
		);
	}

	const short = shortRes.body as ShortLivedTokenResponse;
	const now = Date.now();

	// Short-token fallback: Meta currently rejects the long-token exchange at
	// graph.instagram.com/access_token for apps that haven't completed Business
	// Verification + Access Verification (returns IGApiException code 100 with
	// "Object with ID 'access_token' does not exist, ... missing permissions",
	// regardless of GET vs POST). The short token's 1-hour lifespan is fine
	// for the internal demo. When Meta-side verification clears, restore the
	// long-token exchange (see git history for the prior 2-step flow).
	// Refresh is also disabled in this mode — see /api/instagram/auth/refresh.
	writeSession(cookies, {
		user_id: String(short.user_id),
		access_token: short.access_token,
		expires_at: now + 60 * 60 * 1000, // 1h, matches short-token lifespan
		issued_at: now,
		scope: (short.permissions ?? []).join(',')
	});

	throw redirect(303, '/');
}
