/**
 * Fetch song/video title and artist from YouTube or Spotify oEmbed when saving "Our Song".
 */

const YOUTUBE_OEMBED = 'https://www.youtube.com/oembed?url=';
const SPOTIFY_OEMBED = 'https://open.spotify.com/oembed?url=';

function isYouTube(url: string): boolean {
  return /youtube\.com\/watch\?v=|youtu\.be\//.test(url);
}

function isSpotify(url: string): boolean {
  return /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:track|album|playlist)\//.test(url);
}

/** Parse "Title – Artist" or "Title by Artist" or "Title - Artist" into { title, artist }. */
function parseTitleAndArtist(fullTitle: string): { title: string; artist: string | null } {
  const s = fullTitle.trim();
  if (!s) return { title: '', artist: null };
  // "Song Name – Artist" or "Song Name - Artist" (en/em dash)
  const dashMatch = s.match(/^(.+?)\s+[–-]\s+(.+)$/);
  if (dashMatch) {
    const title = dashMatch[1].trim();
    const artist = dashMatch[2].trim();
    if (title && artist) return { title, artist };
  }
  // "Song Name by Artist"
  const byMatch = s.match(/^(.+?)\s+by\s+(.+)$/i);
  if (byMatch) {
    const title = byMatch[1].trim();
    const artist = byMatch[2].trim();
    if (title && artist) return { title, artist };
  }
  return { title: s, artist: null };
}

/** Optional: fetch artist name for a Spotify track using Web API (requires SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET in env). */
async function fetchSpotifyTrackArtist(trackId: string): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(5000),
    });
    if (!tokenRes.ok) return null;
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    const token = tokenData.access_token;
    if (!token) return null;
    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!trackRes.ok) return null;
    const trackData = (await trackRes.json()) as { artists?: Array<{ name?: string }> };
    const artists = trackData.artists;
    const first = Array.isArray(artists) && artists.length > 0 ? artists[0] : null;
    const name = first?.name;
    return typeof name === 'string' && name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

export interface SongMetadata {
  title: string | null;
  artist: string | null;
}

export async function fetchSongMetadata(songUrl: string | null | undefined): Promise<SongMetadata> {
  const raw = songUrl?.trim();
  if (!raw) return { title: null, artist: null };

  try {
    if (isYouTube(raw)) {
      const res = await fetch(`${YOUTUBE_OEMBED}${encodeURIComponent(raw)}&format=json`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return { title: null, artist: null };
      const data = (await res.json()) as { title?: string; author_name?: string };
      const title = typeof data.title === 'string' && data.title.length > 0 ? data.title : null;
      const artist = typeof data.author_name === 'string' && data.author_name.length > 0 ? data.author_name : null;
      return { title, artist };
    }
    if (isSpotify(raw)) {
      const res = await fetch(`${SPOTIFY_OEMBED}${encodeURIComponent(raw)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return { title: null, artist: null };
      const data = (await res.json()) as { title?: string };
      const fullTitle = typeof data.title === 'string' && data.title.length > 0 ? data.title : null;
      if (!fullTitle) return { title: null, artist: null };
      const { title, artist: parsedArtist } = parseTitleAndArtist(fullTitle);
      const titleStr = title || fullTitle;
      // Try Spotify Web API for artist if oEmbed didn't give us one (optional: set SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET)
      let artistStr = parsedArtist;
      if (!artistStr) {
        const trackId = raw.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([a-zA-Z0-9]+)/)?.[1];
        if (trackId) artistStr = await fetchSpotifyTrackArtist(trackId);
      }
      return { title: titleStr, artist: artistStr };
    }
  } catch {
    // ignore network/timeout errors
  }
  return { title: null, artist: null };
}
