import { json } from '@sveltejs/kit';
import { ttFetch, VIDEO_FIELDS } from '$lib/server/tiktok';
import { readSession } from '$lib/server/tiktokSession';

/**
 * GET /api/tiktok/video/list?cursor=0&max_count=20
 *
 * Lists the connected user's own videos with engagement counts and the
 * embed_link field needed for in-page playback. TikTok's underlying call is
 * POST /v2/video/list/ with cursor pagination.
 */
export async function GET({ url, cookies }) {
  const session = readSession(cookies);
  if (!session) {
    return json({ error: 'not_connected' }, { status: 401 });
  }

  const cursor = Number(url.searchParams.get('cursor') ?? '0');
  const max_count = Math.min(Number(url.searchParams.get('max_count') ?? '20'), 20);

  const path = `/v2/video/list/?fields=${VIDEO_FIELDS.join(',')}`;
  const res = await ttFetch(path, session.access_token, {
    method: 'POST',
    body: JSON.stringify({ cursor, max_count }),
  });
  return json(res.body, { status: res.status });
}
