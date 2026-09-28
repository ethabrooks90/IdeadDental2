import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves a project site from /<repo-name>/, not the domain
  // root — without this, every built asset URL resolves to /assets/... and
  // 404s. In the Pages workflow GITHUB_REPOSITORY ("owner/repo") gives the
  // repo name, so the build fits whichever repo it's pushed to (currently
  // jt0ms/ideadental2 → /ideadental2/). Locally it stays /IdeaDental/.
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/IdeaDental/',
})
