import { json } from '@sveltejs/kit';
import { ttFetch, USER_INFO_FIELDS } from '$lib/server/tiktok';
import { readSession } from '$lib/server/tiktokSession';

/**
 * GET /api/tiktok/user/info
 *
 * Forwards to GET /v2/user/info/ with the full set of fields the demo's
 * scopes can request (basic + profile + stats). Requires an active session.
 */
export async function GET({ cookies }) {
  const session = readSession(cookies);
  if (!session) {
    return json({ error: 'not_connected' }, { status: 401 });
  }

  const path = `/v2/user/info/?fields=${USER_INFO_FIELDS.join(',')}`;
  const res = await ttFetch(path, session.access_token);
  return json(res.body, { status: res.status });
}
