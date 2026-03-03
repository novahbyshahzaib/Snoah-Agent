import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-markdown': ['react-markdown', 'remark-math', 'rehype-mathjax', 'rehype-highlight', 'rehype-raw'],
          'vendor-ui': ['lucide-react', 'uuid'],
        },
      },
    },
  },
})
