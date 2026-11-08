import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `--mode pages` builds for GitHub Pages, which serves a project site from a
// subpath. The default build and the dev server stay at the root.
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/portfolio-3d/' : '/',
  plugins: [react(), tailwindcss(), cloudflare()],
  server: { port: 5173, strictPort: false },
}))
