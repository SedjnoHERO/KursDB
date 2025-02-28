import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'), 
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@database': path.resolve(__dirname, 'src/database'), 
      '@hooks': path.resolve(__dirname, 'src/hooks'),
  },
},
})
