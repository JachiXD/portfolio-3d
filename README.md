# Jay Takle — 3D Portfolio

A dark, cinematic personal site for an AI and machine-learning developer. The hero is a live WebGL scene (a polished, slowly distorting form
inside a wire shell, orbit rings and dust, lit by an environment built in the
browser and steered by the pointer). The rest of the site carries that
material: a counted preloader, an oversized name, a craft marquee, a work grid
whose cards tilt in 3D toward the cursor, an about teaser, an expanding
services list, rotating testimonials and a contact form. Every project has a
case-study page with a next-project link, and there is an about page.

Built with React, Vite, Tailwind, Motion and React Three Fiber. The Three.js
bundle is loaded lazily, after the page is already readable, and the scene
respects `prefers-reduced-motion` and machines without WebGL (a CSS halo holds
the composition instead).

The copy and project data were seeded from the previous site
(`jachixd.github.io/portfolio`). The two case studies are now written from the
real repositories: `Chatbot`, `Chatbot_v2`, `Carrot`, `Guns-and-Knife` and
`Security`. Those repos are private, have no READMEs and record no accuracy
figures, so the write-ups describe what the code actually does (Vosk and Google
speech, pyttsx3, Gemini 1.5 Flash; YOLOv4, Ultralytics YOLOv8/ONNX, Haar
cascade, Symlet wavelets) rather than invented metrics. Update the outcomes as
you measure them.

## Run it

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # dist/client (assets) + dist/portfolio/index.js (Worker)
bun run typecheck
```

## Make it yours

- `src/data/site.ts` is the whole site: name, role, location, socials,
  projects, skills, achievements and goals. Location (`India`, `Asia/Kolkata`)
  and availability were assumed from the old site, so adjust them there if they
  are wrong. Images live in `public/images`; each project has one cover and the
  case-study page crops it for detail shots until you add more. The about
  visual is `public/images/about.svg` — swap in a real photo when you have one.
  The two project covers (`saarthi.svg`, `weapon-detection.svg`) are drawn
  plates built from the real terminal output and model pipeline, because the
  repositories contain no screenshots. Replace them with your own captures as
  soon as you have them; keep the same 16:10 ratio.
- `src/app/components/HeroScene.tsx` is the 3D hero. Change `EMBER` and `COOL`
  for the lighting, `distort`/`speed` on `MeshDistortMaterial` for the form's
  behaviour, and the ring radii for the composition.
- `src/app/components/WorkCard.tsx` controls the card tilt; reduce the `11`
  multipliers for a subtler effect or set them to `0` to turn it off.
- `src/app/pages/*` are the three pages; `src/app/components/motion.tsx` holds
  the reusable animation pieces (masked line reveals, parallax, magnetic
  buttons).
- `src/styles.css` holds the tokens: near-black canvas, warm ink text, one
  ember accent, Bricolage Grotesque for display type. Everything rounded is a
  squircle via `corner-shape`; true circles use `.round`.
- `src/worker/index.ts` receives the contact form at `/api/contact`. Forward
  it to your inbox with an email API (key in Sites → Secrets) or save it to D1.

Motion respects `prefers-reduced-motion`, and the preloader runs once per tab.

## Deploy with Freebuff Sites

`deploy.json` points at the build output. After `bun run build`, deploy with
the `sites_deploy` tool from this directory.
