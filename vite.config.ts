import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
            if (
              id.includes('react-markdown') ||
              id.includes('remark-math') ||
              id.includes('rehype-mathjax') ||
              id.includes('mathjax-full') ||
              id.includes('rehype-highlight') ||
              id.includes('highlight.js') ||
              id.includes('rehype-raw')
            ) {
              return 'vendor-markdown'
            }
            if (id.includes('lucide-react') || id.includes('uuid')) {
              return 'vendor-ui'
            }
          }
        },
      },
    },
  },
})
