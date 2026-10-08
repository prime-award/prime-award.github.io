import {createApp, nextTick} from 'vue'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/latin-500.css'
import './styles/global.css'
import App from './App.vue'
import router from './router'
import {createHead} from "@unhead/vue/client";
import {initAnalytics, trackPageView} from "./analytics/google.ts";

const VITE_GA_ID = 'G-F07HNYPWKV'

initAnalytics(VITE_GA_ID)
router.afterEach((to) => {
    nextTick(() => trackPageView(to.fullPath, document.title))
})


const app = createApp(App)
app.use(router)
app.use(createHead())
app.mount('#app')
