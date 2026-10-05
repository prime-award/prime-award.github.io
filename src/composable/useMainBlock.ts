import {onBeforeUnmount, onMounted, ref} from 'vue'

export function useMainBackground() {
    const videoRef = ref<HTMLVideoElement | null>(null)
    // true, когда видео доиграло до конца: по нему запускается зацикленное мерцание поверх последнего кадра
    const isEnded = ref(false)
    let started = false
    let listeners: AbortController | null = null

    function prefersReducedMotion() {
        return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    }

    async function start() {
        const video = videoRef.value
        if (started || !video || prefersReducedMotion()) return
        started = true

        // Vue не всегда выставляет muted как атрибут, а без него autoplay-политика блокирует play()
        video.muted = true

        try {
            await video.play()
        } catch {
            // Воспроизведение заблокировано или файл не загрузился: остаётся постер, мерцание не запускается
        }
    }

    // animationend всплывает от вложенных элементов, берём только событие самого блока
    function onRevealEnd(event: AnimationEvent) {
        if (event.target !== event.currentTarget) return
        start()
    }

    // Состояние берём из событий самого видео, а не из start():
    // `ended` срабатывает только при естественном окончании (не при pause/error/буферизации),
    // а повторный запуск или смена источника сбрасывают флаг, чтобы мерцание не осталось поверх нового воспроизведения
    onMounted(() => {
        const video = videoRef.value
        if (!video) return

        listeners = new AbortController()
        const {signal} = listeners

        video.addEventListener('ended', () => {
            isEnded.value = true
        }, {signal})
        video.addEventListener('playing', () => {
            isEnded.value = false
        }, {signal})
        video.addEventListener('emptied', () => {
            isEnded.value = false
        }, {signal})
    })

    onBeforeUnmount(() => {
        listeners?.abort()
        isEnded.value = false
        videoRef.value?.pause()
    })

    return {videoRef, onRevealEnd, isEnded}
}