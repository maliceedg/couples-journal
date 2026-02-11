/**
 * Parse YouTube or Spotify share/watch URLs into embed URLs and type.
 * Used for "Our Song" – embed in app and show on Wrapped card.
 */

export type SongProvider = 'youtube' | 'spotify';

export interface ParsedSong {
  type: SongProvider;
  embedUrl: string;
  /** Original URL for opening in new tab */
  shareUrl: string;
}

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
// Spotify URLs may include locale path e.g. /intl-es/ or /intl-en/
const SPOTIFY_TRACK_REGEX = /open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([a-zA-Z0-9]+)/;
const SPOTIFY_ALBUM_REGEX = /open\.spotify\.com\/(?:intl-[a-z-]+\/)?album\/([a-zA-Z0-9]+)/;
const SPOTIFY_PLAYLIST_REGEX = /open\.spotify\.com\/(?:intl-[a-z-]+\/)?playlist\/([a-zA-Z0-9]+)/;

export function parseSongUrl(input: string | null | undefined): ParsedSong | null {
  const raw = input?.trim();
  if (!raw) return null;

  const yt = raw.match(YOUTUBE_REGEX);
  if (yt) {
    const videoId = yt[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      shareUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  const spotifyTrack = raw.match(SPOTIFY_TRACK_REGEX);
  if (spotifyTrack) {
    const id = spotifyTrack[1];
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/track/${id}`,
      shareUrl: `https://open.spotify.com/track/${id}`,
    };
  }

  const spotifyAlbum = raw.match(SPOTIFY_ALBUM_REGEX);
  if (spotifyAlbum) {
    const id = spotifyAlbum[1];
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/album/${id}`,
      shareUrl: `https://open.spotify.com/album/${id}`,
    };
  }

  const spotifyPlaylist = raw.match(SPOTIFY_PLAYLIST_REGEX);
  if (spotifyPlaylist) {
    const id = spotifyPlaylist[1];
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/playlist/${id}`,
      shareUrl: `https://open.spotify.com/playlist/${id}`,
    };
  }

  return null;
}

export function isValidSongUrl(input: string | null | undefined): boolean {
  return parseSongUrl(input) !== null;
}
