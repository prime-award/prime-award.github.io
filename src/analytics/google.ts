type GtagFn = (...args: unknown[]) => void

declare global {
    interface Window {
        dataLayer: unknown[]
        gtag?: GtagFn
    }
}

export type EventParams = Record<string, string | number | boolean | undefined>

export function initAnalytics(id: string | undefined): void {
    if (!id || window.gtag) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []

    // Важно: в dataLayer нужно пушить именно объект arguments, а не массив,
    // поэтому здесь нельзя использовать rest-параметры (...args)
    window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    // В SPA страницы не перезагружаются, поэтому page_view отправляем вручную
    window.gtag('config', id, { send_page_view: false })
}

export function trackPageView(path: string, title: string): void {
    window.gtag?.('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: window.location.href,
    })
}

export function trackEvent(name: string, params: EventParams = {}): void {
    window.gtag?.('event', name, params)
}