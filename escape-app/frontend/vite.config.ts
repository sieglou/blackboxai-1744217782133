import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'electron/main.ts',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        electron: resolve(__dirname, 'electron/main.ts')
      }
    }
  }
})
