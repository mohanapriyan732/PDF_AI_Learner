import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/upload': 'http://127.0.0.1:5000',
      '/generate-summary': 'http://127.0.0.1:5000',
      '/generate-notes': 'http://127.0.0.1:5000',
      '/generate-flashcards': 'http://127.0.0.1:5000',
      '/generate-quiz': 'http://127.0.0.1:5000',
      '/generate-interview': 'http://127.0.0.1:5000',
      '/generate-plan': 'http://127.0.0.1:5000',
      '/translate': 'http://127.0.0.1:5000',
      '/export': 'http://127.0.0.1:5000',
    },
  },
})
