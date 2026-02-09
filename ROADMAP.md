# LoveStory roadmap

Planned features and implementation notes so we don’t forget.

---

## Video highlight reel export

**Goal:** Let users export a video of their memories (e.g. for the Anniversary “Highlight Reel”) so they can download and share it.

**Implementation pin:** Use **Backend (Node) + FFmpeg**.

- Build an API (e.g. `POST /api/journal/highlight-reel` or similar) that:
  - Accepts optional params (date range, memory IDs).
  - Fetches memory image URLs for the journal.
  - Uses **FFmpeg** (e.g. via `fluent-ffmpeg` or child process) to generate a video from the image sequence (and optional music/captions).
  - Returns a download URL or streams the file.
- Frontend: add a “Download video” (or “Export reel”) action that calls this API and triggers download.
- Server must have FFmpeg installed (or use a Docker image that includes it).

---

*Other ideas can be added below as needed.*
