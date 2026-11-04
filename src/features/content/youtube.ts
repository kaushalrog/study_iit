export interface YoutubeRef { kind: 'video' | 'playlist'; id: string; url: string }

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID = /^(PL|UU|OL|FL|RD|LL)[A-Za-z0-9_-]{10,}$/;
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);

/**
 * Turn a pasted link into a canonical video or playlist reference.
 * Search pages, channels, handles and bare youtube.com links return null: the link must open a specific lesson.
 */
export function parseYoutube(input: string): YoutubeRef | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;
  const segs = u.pathname.split('/').filter(Boolean);
  let video: string | null = null;
  if (host === 'youtu.be') video = segs[0] ?? null;
  else if (u.pathname === '/watch') video = u.searchParams.get('v');
  else if (segs[0] === 'embed' || segs[0] === 'shorts' || segs[0] === 'live') video = segs[1] ?? null;
  if (video && VIDEO_ID.test(video)) return { kind: 'video', id: video, url: `https://www.youtube.com/watch?v=${video}` };
  const list = u.searchParams.get('list');
  if (list && PLAYLIST_ID.test(list) && (u.pathname === '/playlist' || u.pathname === '/watch' || segs[0] === 'embed')) {
    return { kind: 'playlist', id: list, url: `https://www.youtube.com/playlist?list=${list}` };
  }
  return null;
}
