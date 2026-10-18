// Тонкая обёртка над fetch: базовый адрес API, Bearer-токен, JSON и типизированные ошибки.

export const API_URL: string = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

/** Ошибка ответа API. code — поле error из тела ({"error": "already_voted", ...}). */
export class ApiError extends Error {
    readonly status: number
    readonly code: string
    readonly data: unknown

    constructor(status: number, code: string, message: string, data: unknown = null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.data = data
    }
}

/** Сеть недоступна / бэкенд не отвечает. */
export class NetworkError extends Error {
    constructor(cause: unknown) {
        super('Сервер недоступен. Проверьте подключение и попробуйте ещё раз.', {cause})
        this.name = 'NetworkError'
    }
}

type TokenProvider = () => string | null
type UnauthorizedHandler = () => void

let getToken: TokenProvider = () => null
let onUnauthorized: UnauthorizedHandler = () => {}

/** Подключается из useAuth: откуда брать токен и что делать, если сервер ответил 401. */
export function configureApiAuth(tokenProvider: TokenProvider, unauthorized: UnauthorizedHandler) {
    getToken = tokenProvider
    onUnauthorized = unauthorized
}

export interface RequestOptions {
    method?: 'GET' | 'POST'
    body?: unknown
    signal?: AbortSignal
    /** false — не отправлять токен даже если он есть */
    auth?: boolean
}

/** Запрос к API. 204 -> null. Ошибки — ApiError / NetworkError. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {Accept: 'application/json'}
    const token = options.auth === false ? null : getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'

    let response: Response
    try {
        response = await fetch(API_URL + path, {
            method: options.method ?? 'GET',
            headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            signal: options.signal,
        })
    } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e
        throw new NetworkError(e)
    }

    if (response.status === 204) return null as T

    const data = await response.json().catch(() => null)
    if (!response.ok) {
        if (response.status === 401 && token) onUnauthorized()
        const body = (data ?? {}) as { error?: string, message?: string }
        throw new ApiError(response.status, body.error ?? 'http_' + response.status, body.message ?? response.statusText, data)
    }
    return data as T
}
