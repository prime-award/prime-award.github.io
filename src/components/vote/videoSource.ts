import {mediaUrl} from '@/utils/media.ts'

export type VideoSource =
    | { kind: 'file', src: string }
    | { kind: 'youtube', id: string }
    | { kind: 'twitch-clip', slug: string }
    | { kind: 'twitch-video', id: string }

/** Разбор ссылки на видео: файл (в т.ч. из public/media), YouTube или Twitch (клип / запись). */
export function parseVideoSource(url: string | null | undefined): VideoSource | null {
    if (!url) return null
    let parsed: URL | null = null
    try {
        parsed = new URL(url)
    } catch {
        // относительный путь — файл во фронтенде
        return {kind: 'file', src: mediaUrl(url)!}
    }
    const host = parsed.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return {kind: 'youtube', id: parsed.pathname.slice(1)}
    if (host === 'youtube.com') {
        const id = parsed.searchParams.get('v') ?? parsed.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1]
        if (id) return {kind: 'youtube', id}
    }
    if (host === 'clips.twitch.tv') return {kind: 'twitch-clip', slug: parsed.pathname.slice(1)}
    if (host === 'twitch.tv') {
        const clip = parsed.pathname.match(/\/clip\/([\w-]+)/)?.[1]
        if (clip) return {kind: 'twitch-clip', slug: clip}
        const video = parsed.pathname.match(/\/videos\/(\d+)/)?.[1]
        if (video) return {kind: 'twitch-video', id: video}
    }
    return {kind: 'file', src: url}
}

/** URL для iframe с началом воспроизведения с [start] секунд. */
export function embedUrl(source: Exclude<VideoSource, { kind: 'file' }>, start = 0, autoplay = false): string {
    const parent = window.location.hostname
    switch (source.kind) {
        case 'youtube':
            return `https://www.youtube.com/embed/${source.id}?start=${Math.floor(start)}&autoplay=${autoplay ? 1 : 0}&rel=0`
        case 'twitch-clip':
            return `https://clips.twitch.tv/embed?clip=${source.slug}&parent=${parent}&autoplay=${autoplay}`
        case 'twitch-video': {
            const h = Math.floor(start / 3600), m = Math.floor((start % 3600) / 60), s = Math.floor(start % 60)
            return `https://player.twitch.tv/?video=${source.id}&parent=${parent}&time=${h}h${m}m${s}s&autoplay=${autoplay}`
        }
    }
}
