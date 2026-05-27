import { json } from '@sveltejs/kit';
import {
  ttFetch,
  VIDEO_FIELDS,
  expandShortUrl,
  extractVideoId,
  isShortTikTokUrl,
} from '$lib/server/tiktok';
import { readSession } from '$lib/server/tiktokSession';

/**
 * GET /api/tiktok/video/query?url=...   (or ?video_id=...)
 *
 * Pastes-a-TikTok-URL UX. Resolves the URL → video_id (following short links
 * if needed) and forwards to POST /v2/video/query/.
 *
 * Important constraint inherited from TikTok: this can only return videos
 * owned by the currently authenticated user. Querying a URL that belongs to
 * someone else will succeed but return an empty videos array.
 */
export async function GET({ url, cookies }) {
  const session = readSession(cookies);
  if (!session) {
    return json({ error: 'not_connected' }, { status: 401 });
  }

  const explicitId = url.searchParams.get('video_id');
  const inputUrl = url.searchParams.get('url');

  let videoId = explicitId ?? null;
  let resolvedFrom: string | null = null;

  if (!videoId && inputUrl) {
    let candidate = inputUrl;
    if (isShortTikTokUrl(inputUrl)) {
      const expanded = await expandShortUrl(inputUrl);
      if (!expanded) {
        return json(
          { error: 'short_url_expand_failed', input: inputUrl },
          { status: 400 }
        );
      }
      candidate = expanded;
      resolvedFrom = expanded;
    }
    videoId = extractVideoId(candidate);
  }

  if (!videoId) {
    return json(
      {
        error: 'could_not_extract_video_id',
        hint: 'Pass ?url=<tiktok url> or ?video_id=<numeric id>. Supported URL shapes: /@user/video/{id}, /v/{id}.html, vm.tiktok.com short links.',
      },
      { status: 400 }
    );
  }

  const path = `/v2/video/query/?fields=${VIDEO_FIELDS.join(',')}`;
  const res = await ttFetch(path, session.access_token, {
    method: 'POST',
    body: JSON.stringify({ filters: { video_ids: [videoId] } }),
  });

  return json(
    {
      video_id: videoId,
      resolved_from: resolvedFrom,
      ...((res.body as object) ?? {}),
    },
    { status: res.status }
  );
}
