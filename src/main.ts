import { createApp } from 'vue'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/latin-500.css'
import './styles/global.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
