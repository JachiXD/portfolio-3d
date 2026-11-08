// Strips files the Sites uploader refuses (hidden files and source maps)
// from the build output, so `deploy.json` can point straight at dist/.
import { copyFileSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

function clean(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name.startsWith('.') || name.endsWith('.map')) {
      rmSync(path, { recursive: true, force: true })
      continue
    }
    if (statSync(path).isDirectory()) clean(path)
  }
}

clean(new URL('../dist', import.meta.url).pathname)

// GitHub Pages has no SPA rewrite, so unknown paths (a refreshed case-study
// URL, for example) land on 404.html. Serving the app shell there lets the
// client router take over instead of showing GitHub's 404 page.
const client = new URL('../dist/client', import.meta.url).pathname
if (existsSync(join(client, 'index.html'))) {
  copyFileSync(join(client, 'index.html'), join(client, '404.html'))
}
