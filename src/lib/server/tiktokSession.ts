import { createSessionCodec } from './session';

/**
 * TikTok session — encrypted-cookie payload. See ./session.ts for the shared
 * AES-256-GCM codec. (OAuth state is now a signed stateless token — see
 * signOAuthState/verifyOAuthState in session.ts.)
 */
export type TikTokSession = {
	open_id: string;
	access_token: string;
	refresh_token: string;
	/** Absolute ms epoch when access_token expires. */
	expires_at: number;
	/** Absolute ms epoch when refresh_token expires. */
	refresh_expires_at: number;
	scope: string;
};

const codec = createSessionCodec<TikTokSession>({
	sessionCookie: 'tt_sid',
	hkdfInfo: 'tt-sess-v1',
	sessionTtlSeconds: 60 * 60 * 24 * 30 // 30 d; underlying refresh_token lasts 365 d
});

export const { writeSession, readSession, clearSession } = codec;
