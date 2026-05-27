import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';

/**
 * Generic encrypted-cookie session, shared by all three platforms.
 *
 * Why a cookie and not a server-side Map: this app deploys to Vercel, where
 * each function invocation can land on a different (stateless) instance. A
 * process-memory Map would lose every session on cold start and disagree
 * across concurrent instances. Putting the encrypted payload directly in an
 * HttpOnly cookie keeps the demo zero-infra while staying secure as long as
 * SESSION_SECRET is kept secret.
 *
 * Crypto: AES-256-GCM. 32-byte key derived from SESSION_SECRET via HKDF-SHA256
 * with a per-platform `hkdfInfo` string, so the three platforms' cookies use
 * independently derived keys. 12-byte random IV per encrypt, 16-byte auth tag
 * appended. On-the-wire format: base64url(iv || ciphertext || tag).
 */

const STATE_TTL_SECONDS = 600; // 10 min — covers the user clicking through consent

export type SessionCodec<T> = {
	writeSession(cookies: Cookies, session: T): void;
	readSession(cookies: Cookies): T | null;
	clearSession(cookies: Cookies): void;
	generateOAuthState(): string;
	setOAuthStateCookie(cookies: Cookies, state: string): void;
	readOAuthStateCookie(cookies: Cookies): string | undefined;
	clearOAuthStateCookie(cookies: Cookies): void;
};

export function createSessionCodec<T>(opts: {
	/** Cookie name holding the encrypted session payload, e.g. 'tt_sid'. */
	sessionCookie: string;
	/** Cookie name holding the OAuth CSRF state, e.g. 'tt_oauth_state'. */
	stateCookie: string;
	/** HKDF info string — make it unique per platform for key separation. */
	hkdfInfo: string;
	/** Session cookie max-age in seconds (match the longest-lived token). */
	sessionTtlSeconds: number;
}): SessionCodec<T> {
	// Derive the AES key once. SESSION_SECRET is a 32+ char random string;
	// HKDF stretches/normalizes it to exactly 32 bytes regardless of length.
	const key = Buffer.from(
		hkdfSync('sha256', Buffer.from(SESSION_SECRET, 'utf8'), Buffer.alloc(0), opts.hkdfInfo, 32)
	);

	function encrypt(plaintext: string): string {
		const iv = randomBytes(12);
		const cipher = createCipheriv('aes-256-gcm', key, iv);
		const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
		const tag = cipher.getAuthTag();
		return Buffer.concat([iv, ct, tag]).toString('base64url');
	}

	function decrypt(token: string): string | null {
		try {
			const buf = Buffer.from(token, 'base64url');
			if (buf.length < 12 + 16) return null;
			const iv = buf.subarray(0, 12);
			const tag = buf.subarray(buf.length - 16);
			const ct = buf.subarray(12, buf.length - 16);
			const decipher = createDecipheriv('aes-256-gcm', key, iv);
			decipher.setAuthTag(tag);
			return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
		} catch {
			// Any tamper / wrong key / corrupted payload — treat as no session.
			return null;
		}
	}

	return {
		writeSession(cookies, session) {
			cookies.set(opts.sessionCookie, encrypt(JSON.stringify(session)), {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: true,
				maxAge: opts.sessionTtlSeconds
			});
		},
		readSession(cookies) {
			const raw = cookies.get(opts.sessionCookie);
			if (!raw) return null;
			const json = decrypt(raw);
			if (!json) return null;
			try {
				return JSON.parse(json) as T;
			} catch {
				return null;
			}
		},
		clearSession(cookies) {
			cookies.delete(opts.sessionCookie, { path: '/' });
		},
		generateOAuthState() {
			return randomBytes(16).toString('hex');
		},
		setOAuthStateCookie(cookies, state) {
			cookies.set(opts.stateCookie, state, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: true,
				maxAge: STATE_TTL_SECONDS
			});
		},
		readOAuthStateCookie(cookies) {
			return cookies.get(opts.stateCookie);
		},
		clearOAuthStateCookie(cookies) {
			cookies.delete(opts.stateCookie, { path: '/' });
		}
	};
}
