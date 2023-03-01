import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  base: '/vue-reactive-query/',
  build: {
    outDir: '../dist/example/'
  }
})
