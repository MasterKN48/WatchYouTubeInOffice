import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// Configuration for compiling the popup UI
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
