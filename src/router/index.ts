import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {api} from '@/api'
import {useAuth} from '@/composable/useAuth.ts'
import {useCatalog} from '@/composable/useCatalog.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'

declare module 'vue-router' {
    interface RouteMeta {
        /** без входа — главная с окном входа, после входа вернёт сюда */
        requiresAuth?: boolean
        /** страница без общей шапки */
        bare?: boolean
    }
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', name: 'home', component: HomeView},
        {
            // «Анкета» без номера — первая непроголосованная номинация
            path: '/vote',
            name: 'ballot-next',
            meta: {requiresAuth: true},
            component: HomeView,
            beforeEnter: async () => {
                try {
                    const next = await api.nextUnvoted()
                    if (!next) return {path: '/profile', query: {done: '1'}}
                    useCatalog().remember(next)
                    return `/vote/${next.id}`
                } catch {
                    return '/'
                }
            },
        },
        {
            path: '/vote/:id(\\d+)',
            name: 'ballot',
            meta: {requiresAuth: true},
            component: () => import('../views/VoteView.vue'),
        },
        {
            path: '/profile',
            name: 'profile',
            meta: {requiresAuth: true},
            component: () => import('../views/ProfileView.vue'),
        },
        {path: '/auth/callback', name: 'auth-callback', component: () => import('../views/AuthCallbackView.vue')},
        {path: '/admin/stats', name: 'admin-stats', meta: {requiresAuth: true}, component: () => import('../views/DevStatsView.vue'), props: {admin: true}},
        {path: '/dev/stats', name: 'dev-stats', component: () => import('../views/DevStatsView.vue')},

        // демо-экран отборочного этапа
        {path: '/demo', name: 'demo', meta: {bare: true}, component: () => import('../demo/views/DemoHomeView.vue')},
        {path: '/demo/form', name: 'demo-form', meta: {bare: true}, component: () => import('../demo/views/DemoFormView.vue')},
        {path: '/form', redirect: '/demo/form'},

        // Любой неизвестный адрес -> главная страница. Должен быть ПОСЛЕДНИМ в списке.
        {path: '/:pathMatch(.*)*', redirect: '/'},
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        // смена страницы списка на главной — скроллом управляет сама страница
        if (to.name === 'home' && from.name === 'home') return false
        if (to.hash) return {el: to.hash, top: 72}
        return {top: 0}
    },
})

router.beforeEach((to) => {
    if (!to.meta.requiresAuth || useAuth().isLoggedIn.value) return true
    useLoginModal().open(to.fullPath)
    return {path: '/', replace: true}
})

export default router
