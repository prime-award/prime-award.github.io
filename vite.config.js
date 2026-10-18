import {defineConfig} from 'vite'
import {fileURLToPath, URL} from 'node:url'
import vue from '@vitejs/plugin-vue'

// base '/' (а не './'): с history-роутингом глубокие ссылки вида /vote/5 иначе ломают пути к ассетам.
// Для деплоя в подпапку (https://user.github.io/repo/) задайте VITE_BASE=/repo/.
export default defineConfig({
    base: process.env.VITE_BASE ?? '/',
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        port: 5173,
    },
    test: {
        environment: 'happy-dom',
        include: ['tests/**/*.test.ts'],
    },
})
