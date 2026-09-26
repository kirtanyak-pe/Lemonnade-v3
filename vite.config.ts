import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sub-path when the docs are hosted under a folder (e.g. GitHub Pages serves /<repo>/).
  base: process.env.PAGES_BASE ?? '/',
})
