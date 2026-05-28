import { createSessionCodec } from './session';

/**
 * YouTube/Google session — encrypted-cookie payload. See ./session.ts for the
 * shared AES-256-GCM codec. (OAuth state is now a signed stateless token — see
 * signOAuthState/verifyOAuthState in session.ts.)
 */
export type YouTubeSession = {
	/** Google account email (from id_token). Display-only. */
	email: string;
	access_token: string;
	/** Google refresh tokens are long-lived (no fixed expiry) but only issued
	 *  on first consent unless we force `prompt=consent`. May be undefined if
	 *  the user authorized this app before and we forgot to force consent. */
	refresh_token: string | undefined;
	/** Absolute ms epoch when access_token expires. */
	expires_at: number;
	scope: string;
};

const codec = createSessionCodec<YouTubeSession>({
	sessionCookie: 'yt_sid',
	hkdfInfo: 'yt-sess-v1',
	sessionTtlSeconds: 60 * 60 * 24 * 30
});

export const { writeSession, readSession, clearSession } = codec;

/**
 * Decode a JWT id_token payload without verifying the signature.
 * We only use this to display the connected email in the UI — never to make
 * trust decisions. (Google already verified the signature server-side when
 * it minted the token.)
 */
export function decodeIdTokenPayload(idToken: string): Record<string, unknown> | null {
	try {
		const parts = idToken.split('.');
		if (parts.length !== 3) return null;
		const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = Buffer.from(padded, 'base64').toString('utf8');
		return JSON.parse(json);
	} catch {
		return null;
	}
}
