import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// Configuration specifically for compiling the content script as a self-contained file
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  build: {
    emptyOutDir: false, // Keep popup files built in the previous step
    rollupOptions: {
      input: {
        content: 'src/content.jsx'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
