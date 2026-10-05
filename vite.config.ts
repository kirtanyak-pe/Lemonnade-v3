import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { buildApi } from './server/devApi.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildApi()],
  // Sub-path when the docs are hosted under a folder (e.g. GitHub Pages serves /<repo>/).
  base: process.env.PAGES_BASE ?? '/',
})
