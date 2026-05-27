import { redirect, error } from '@sveltejs/kit';
import {
	IG_REDIRECT_URI,
	clientCreds,
	igGraphTokenGet,
	igOAuthExchange
} from '$lib/server/instagram';
import {
	clearOAuthStateCookie,
	readOAuthStateCookie,
	writeSession
} from '$lib/server/instagramSession';

type ShortLivedTokenResponse = {
	access_token: string;
	user_id: number | string;
	permissions?: string[];
};

type LongLivedTokenResponse = {
	access_token: string;
	token_type: 'bearer';
	expires_in: number; // seconds (~60d)
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
		throw error(400, 'missing code or state in callback');
	}

	const expectedState = readOAuthStateCookie(cookies);
	clearOAuthStateCookie(cookies);
	if (!expectedState || expectedState !== state) {
		throw error(400, 'state mismatch — possible CSRF, abort');
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

	// Step 2: short-lived → long-lived token (lives 60 days, refreshable).
	const longRes = await igGraphTokenGet<LongLivedTokenResponse | { error: unknown }>(
		'/access_token',
		{
			grant_type: 'ig_exchange_token',
			client_secret: clientCreds.secret,
			access_token: short.access_token
		}
	);

	if (!longRes.ok || !('access_token' in (longRes.body as object))) {
		throw redirect(
			303,
			`/?connect_error=long_token_exchange_failed&error_description=${encodeURIComponent(`HTTP ${longRes.status}: ${JSON.stringify(longRes.body).slice(0, 200)}`)}&platform=instagram`
		);
	}

	const long = longRes.body as LongLivedTokenResponse;
	const now = Date.now();

	writeSession(cookies, {
		user_id: String(short.user_id),
		access_token: long.access_token,
		expires_at: now + long.expires_in * 1000,
		issued_at: now,
		scope: (short.permissions ?? []).join(',')
	});

	throw redirect(303, '/');
}
