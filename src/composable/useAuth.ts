import {computed, readonly, ref} from 'vue'
import {api, ApiError, configureApiAuth, loginUrl, type Session, type User} from '@/api'

const STORAGE_KEY = 'prime.session'

interface StoredSession {
    token: string
    expiresAt: string
    user: User
}

// Сессия живёт в localStorage: токен Bearer, а не cookie — фронтенд и API на разных доменах
const session = ref<StoredSession | null>(readStored())

function readStored(): StoredSession | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as StoredSession
        if (!parsed.token || new Date(parsed.expiresAt).getTime() <= Date.now()) return null
        return parsed
    } catch {
        return null
    }
}

function store(value: StoredSession | null) {
    session.value = value
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
}

// сервер ответил 401 на запрос с токеном: сессия протухла или удалена — забываем её
configureApiAuth(() => session.value?.token ?? null, () => store(null))

// другие вкладки: вход/выход синхронизируются
window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) session.value = readStored()
})

let refreshPromise: Promise<void> | null = null

/** Состояние входа. Модульный singleton: одно на всё приложение. */
export function useAuth() {
    const user = computed(() => session.value?.user ?? null)
    const isLoggedIn = computed(() => session.value !== null)

    /** Перейти на вход через провайдера (twitch | kick | vk | dev). */
    function login(provider: string, redirectPath = '/') {
        window.location.assign(loginUrl(provider, redirectPath))
    }

    /** Завершение входа на /auth/callback: одноразовый код -> токен сессии. */
    async function completeLogin(code: string): Promise<Session> {
        const result = await api.exchange(code)
        store({token: result.token, expiresAt: result.expiresAt, user: result.user})
        return result
    }

    /** Свериться с сервером (ник/аватар могли поменяться, сессия — протухнуть). */
    function refresh(): Promise<void> {
        if (!session.value) return Promise.resolve()
        refreshPromise ??= api.me()
            .then((fresh) => {
                if (session.value) store({...session.value, user: fresh})
            })
            .catch((e) => {
                if (!(e instanceof ApiError)) return // сеть: оставляем как есть
            })
            .finally(() => {
                refreshPromise = null
            })
        return refreshPromise
    }

    async function logout() {
        try {
            if (session.value) await api.logout()
        } catch {
            // сервер недоступен или сессия уже мертва — локально выходим всё равно
        }
        store(null)
    }

    return {user, isLoggedIn, session: readonly(session), login, completeLogin, refresh, logout}
}
