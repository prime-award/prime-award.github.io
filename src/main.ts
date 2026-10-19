import {createApp, nextTick, type Component} from 'vue'
import type {Router} from 'vue-router'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/latin-500.css'
import {createHead} from "@unhead/vue/client";
import {initAnalytics, trackPageView} from "./analytics/google.ts";
import {isAppPath} from './appBase.ts'

const VITE_GA_ID = 'G-F07HNYPWKV'

// Одна сборка — два сайта: / и /form — демо отборочного этапа (как в master), /test/… — сайт голосования.
// У каждого свои роутер и глобальные стили, поэтому дизайн голосования не задевает демо.
let root: Component
let router: Router
if (isAppPath(window.location.pathname)) {
    await import('./styles/global.css')
    await Promise.all([
        import('@fontsource/pt-serif/cyrillic-400.css'),
        import('@fontsource/pt-serif/latin-400.css'),
        import('@fontsource/pt-serif/cyrillic-700.css'),
        import('@fontsource/pt-serif/latin-700.css'),
    ])
    root = (await import('./App.vue')).default
    router = (await import('./router')).default
} else {
    await import('./demo/demo.css')
    root = (await import('./demo/DemoApp.vue')).default
    router = (await import('./demo/router.ts')).default
}

// аналитику не грузим при локальной разработке
if (import.meta.env.PROD) initAnalytics(VITE_GA_ID)
router.afterEach((to) => {
    nextTick(() => trackPageView(to.fullPath, document.title))
})

const app = createApp(root)
app.use(router)
app.use(createHead())
app.mount('#app')
