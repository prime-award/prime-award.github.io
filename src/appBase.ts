/**
 * Сайт голосования живёт под /test/ (на / — демо-экран отборочного этапа).
 * APP_ROOT учитывает base сборки, если сайт выложен в подпапку (VITE_BASE).
 */
export const APP_BASE = '/test'
export const APP_ROOT = import.meta.env.BASE_URL.replace(/\/+$/, '') + APP_BASE

/** Адрес относится к сайту голосования (/test, /test/…), а не к демо. */
export function isAppPath(pathname: string): boolean {
    return pathname === APP_ROOT || pathname.startsWith(APP_ROOT + '/')
}

/** Путь из адресной строки -> путь внутри роутера голосования (без /test). */
export function toAppRoute(pathname: string): string {
    return isAppPath(pathname) ? pathname.slice(APP_ROOT.length) || '/' : pathname
}
