import {defineConfig, loadEnv} from 'vite'
import {fileURLToPath, URL} from 'node:url'
import vue from '@vitejs/plugin-vue'

// base '/' (а не './'): с history-роутингом глубокие ссылки вида /vote/5 иначе ломают пути к ассетам.
// Для деплоя в подпапку (https://user.github.io/repo/) задайте VITE_BASE=/repo/ в .env.production.
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    return {
        base: env.VITE_BASE || '/',
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
    }
})
