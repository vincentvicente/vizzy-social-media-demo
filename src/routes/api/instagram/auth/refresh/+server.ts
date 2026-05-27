import { json } from '@sveltejs/kit';
import { igGraphTokenGet } from '$lib/server/instagram';
import { readSession, writeSession } from '$lib/server/instagramSession';

type RefreshResponse = {
	access_token: string;
	token_type: 'bearer';
	expires_in: number;
};

/**
 * POST /api/instagram/auth/refresh
 *
 * Calls GET /refresh_access_token to swap the long-lived token for a fresh
 * one with another ~60-day window.
 *
 * IG constraint: the token must be at least 24 hours old. If a freshly issued
 * token is refreshed, IG returns an error and the existing token is unchanged.
 * The server enforces this client-side too (returns 400) so the UI can show a
 * clear message instead of an opaque IG error.
 */
export async function POST({ cookies }) {
	const session = readSession(cookies);
	if (!session) {
		return json({ error: 'not_connected' }, { status: 401 });
	}

	const ageMs = Date.now() - session.issued_at;
	if (ageMs < 24 * 60 * 60 * 1000) {
		const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - ageMs) / (60 * 60 * 1000));
		return json(
			{
				error: 'token_too_fresh',
				message: `IG requires the long-lived token to be at least 24h old before refresh. Try again in ~${hoursLeft}h.`
			},
			{ status: 400 }
		);
	}

	const res = await igGraphTokenGet<RefreshResponse | { error: unknown }>(
		'/refresh_access_token',
		{
			grant_type: 'ig_refresh_token',
			access_token: session.access_token
		}
	);

	if (!res.ok || !('access_token' in (res.body as object))) {
		return json({ step: 'refresh', status: res.status, body: res.body }, { status: res.status });
	}

	const t = res.body as RefreshResponse;
	const now = Date.now();
	writeSession(cookies, {
		...session,
		access_token: t.access_token,
		expires_at: now + t.expires_in * 1000,
		issued_at: now
	});

	return json({
		refreshed: true,
		expires_at: new Date(now + t.expires_in * 1000).toISOString(),
		expires_in_seconds: t.expires_in
	});
}
