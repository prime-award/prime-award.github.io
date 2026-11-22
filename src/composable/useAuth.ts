import {computed, readonly, ref, watch} from 'vue'
import {api, ApiError, configureApiAuth, loginUrl, type LoginProviderId, type Session, type User} from '@/api'

const STORAGE_KEY = 'prime.session'

interface StoredSession {
    token: string
    expiresAt: string
    user: User
}

// Сессия живёт в localStorage: токен Bearer, а не cookie — фронтенд и API на разных доменах
const session = ref<StoredSession | null>(readStored())

const seedCookie = 'prime.voteSeed'
const voteSeed = ref<number | null>(null)

function readSeed(value: string | null | undefined): number | null {
    if (!value || !/^\d{1,10}$/.test(value) || Number(value) > 0xffffffff) return null
    return Number(value)
}

function restoreVoteSeed(userId: number) {
    const key = `${seedCookie}.${userId}`
    const cookies = new URLSearchParams(document.cookie.replaceAll('; ', '&'))
    // Переносим seed прежнего формата только владельцу сохранённой сессии.
    const legacy = readStored()?.user.id === userId ? readSeed(cookies.get(seedCookie)) : null
    const seed = readSeed(cookies.get(key)) ?? readSeed(localStorage.getItem(key)) ?? legacy
        ?? crypto.getRandomValues(new Uint32Array(1))[0]
    localStorage.setItem(key, String(seed))
    document.cookie = `${key}=${seed}; Path=/; Max-Age=34560000; SameSite=Lax`
    if (cookies.has(seedCookie)) document.cookie = `${seedCookie}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    return seed
}

watch(() => session.value?.user.id, (userId) => {
    voteSeed.value = userId == null ? null : restoreVoteSeed(userId)
}, {immediate: true, flush: 'sync'})

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

    /** Перейти на вход через провайдера. */
    function login(provider: LoginProviderId, redirectPath = '/') {
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
        const userId = session.value?.user.id
        try {
            if (session.value) await api.logout()
        } catch {
            // сервер недоступен или сессия уже мертва — локально выходим всё равно
        }
        if (userId != null) {
            const key = `${seedCookie}.${userId}`
            document.cookie = `${key}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
            localStorage.removeItem(key)
        }
        store(null)
    }

    return {user, isLoggedIn, voteSeed: readonly(voteSeed), session: readonly(session), login, completeLogin, refresh, logout}
}
