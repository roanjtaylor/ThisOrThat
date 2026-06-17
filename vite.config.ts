import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// Dev-only API so the curator Review UI can write items.json back (a browser can't
// touch the filesystem). Only mounted by the dev server, never in a production build.
function reviewApiPlugin(): Plugin {
  return {
    name: 'review-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || !req.url?.startsWith('/__review/')) return next()
        const [, , branch, id, action] = req.url.split('?')[0].split('/')
        const itemsPath = path.resolve('public/branches', branch, 'items.json')
        try {
          const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))
          const idx = items.findIndex((i: { id: string }) => i.id === id)
          if (idx < 0) { res.statusCode = 404; return res.end('not found') }

          if (action === 'accept') {
            items[idx].curation.flagged = false
            items[idx].curation.reviewedBy = 'human'
            items[idx].curation.reviewedAt = new Date().toISOString()
          } else if (action === 'recurate') {
            // Drop the image + record so report.ts marks the item "pending" again;
            // the curator then re-runs /curate-branch <branch> --only <id>.
            for (const f of [
              path.resolve('public/branches', branch, 'images', `${id}.jpg`),
              path.resolve('public/branches', branch, 'thumbs', `${id}.webp`),
            ]) {
              if (fs.existsSync(f)) fs.rmSync(f)
            }
            items.splice(idx, 1)
          } else {
            res.statusCode = 400; return res.end('bad action')
          }

          fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2) + '\n')
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        } catch (e) {
          res.statusCode = 500
          res.end(String(e))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), reviewApiPlugin()],
})
