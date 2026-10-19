import {createRouter, createWebHistory} from 'vue-router'
import DemoHomeView from './views/DemoHomeView.vue'

// Демо-экран отборочного этапа (продакшен): / и /form — как в master.
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', name: 'home', component: DemoHomeView},
        {path: '/form', name: 'form', component: () => import('./views/DemoFormView.vue')},
        // Любой неизвестный адрес -> главная страница. Должен быть ПОСЛЕДНИМ в списке.
        {path: '/:pathMatch(.*)*', redirect: '/'},
    ],
    scrollBehavior() {
        return {top: 0}
    },
})

export default router
