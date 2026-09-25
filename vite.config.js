import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* The server build (entry-server.jsx, used only by prerender.mjs) needs no public files. */
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: { copyPublicDir: !isSsrBuild },
}))
