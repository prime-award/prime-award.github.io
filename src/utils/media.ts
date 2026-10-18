/**
 * Медиа лежит во фронтенде (public/media), бэкенд хранит только пути от корня сайта: `media/nominees/x.webp`.
 * Абсолютные ссылки (https://…, data:, blob:) возвращаем как есть.
 */
export function mediaUrl(path: string | null | undefined): string | undefined {
    if (!path) return undefined
    if (/^(https?:|data:|blob:)/i.test(path)) return path
    return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}
