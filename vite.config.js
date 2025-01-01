import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If you are deploying to https://<USERNAME>.github.io/, set base to '/'
  // If you are deploying to https://<USERNAME>.github.io/<REPO>/, set base to '/<REPO>/'
  base: '/',  // Since you're using maxghenis.com as the domain, we use '/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})