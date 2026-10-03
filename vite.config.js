import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' — относительные пути, работает на GitHub Pages под любым именем репозитория
export default defineConfig({
  base: './',
  plugins: [vue()],
})
