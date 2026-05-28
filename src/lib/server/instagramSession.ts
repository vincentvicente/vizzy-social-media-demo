import { createSessionCodec } from './session';

/**
 * Instagram session — encrypted-cookie payload. See ./session.ts for the
 * shared AES-256-GCM codec backing all three platforms. (OAuth state is now
 * a signed stateless token — see signOAuthState/verifyOAuthState in session.ts.)
 */
export type InstagramSession = {
	user_id: string;
	access_token: string;
	/** ms epoch when the long-lived access_token expires (60 days from issue). */
	expires_at: number;
	/** ms epoch when the short-lived token was originally issued — used to compute refresh eligibility (>24h old). */
	issued_at: number;
	/** Comma-separated scopes IG returned with the token. */
	scope: string;
};

const codec = createSessionCodec<InstagramSession>({
	sessionCookie: 'ig_sess',
	hkdfInfo: 'ig-sess-v1',
	sessionTtlSeconds: 60 * 60 * 24 * 60 // 60 d, matches long-lived token max
});

export const { writeSession, readSession, clearSession } = codec;
