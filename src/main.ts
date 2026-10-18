import {createApp, nextTick} from 'vue'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/pt-serif/cyrillic-400.css'
import '@fontsource/pt-serif/latin-400.css'
import '@fontsource/pt-serif/cyrillic-700.css'
import '@fontsource/pt-serif/latin-700.css'
import './styles/global.css'
import App from './App.vue'
import router from './router'
import {createHead} from "@unhead/vue/client";
import {initAnalytics, trackPageView} from "./analytics/google.ts";

const VITE_GA_ID = 'G-F07HNYPWKV'

// аналитику не грузим при локальной разработке
if (import.meta.env.PROD) initAnalytics(VITE_GA_ID)
router.afterEach((to) => {
    nextTick(() => trackPageView(to.fullPath, document.title))
})


const app = createApp(App)
app.use(router)
app.use(createHead())
app.mount('#app')
