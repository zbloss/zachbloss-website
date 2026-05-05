import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Suppress dual-vite Plugin type incompatibility.
// vitest bundles its own copy of vite's types, which conflict with the
// top-level vite dependency used by @vitejs/plugin-react.
export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
