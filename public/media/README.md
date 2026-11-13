# Background media

Drop files here and the site picks them up. Nothing else needs changing.

| File | Role |
| --- | --- |
| `hsin-background.jpg` | The still. Used as soon as it exists, and as the video poster. `.webp` also works. |
| `hsin-background.webm` | Optional video, tried first. |
| `hsin-background.mp4` | Optional video, fallback source. |

Notes:

- The still is the primary background; video is only used if a file is present
  and the browser can decode it.
- Both are cropped with `object-fit: cover`, so the aspect ratio is never
  distorted. Move the crop window with `--bg-pos` in `src/styles.css`
  (default `52% 36%`, `52% 26%` on phones).
- Readability overlay strength is `--bg-overlay` in `src/styles.css`, or pass
  `overlay={0.7}` to `<WorldBackground />` in `src/app/App.tsx`.
- On desktop the video is scrubbed by scroll position. On touch devices, or
  with reduced motion enabled, it loops normally (or the still is shown if
  there is no video).
- Keep the still under ~400 KB (1600–2000 px on the long edge, JPEG quality
  ~80) and the video under ~8 MB so first paint stays quick.
