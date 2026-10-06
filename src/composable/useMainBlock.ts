import {onBeforeUnmount, onMounted, ref} from 'vue'

export function useMainBackground() {
    const videoRef = ref<HTMLVideoElement | null>(null)
    // true, когда видео доиграло до конца: по нему запускается зацикленное мерцание поверх последнего кадра
    const isEnded = ref(false)

    // Видео стартует, только когда выполнены оба условия: файл полностью загружен И вступительная анимация закончилась
    let isLoaded = false
    let isRevealFinished = false
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

    function tryStart() {
        if (isLoaded && isRevealFinished) start()
    }

    // Файл считаем загруженным, когда браузер уверен, что доиграет без остановок (HAVE_ENOUGH_DATA),
    // либо когда буфер дошёл до конца. Только «полный буфер» ненадёжен: браузеры часто
    // приостанавливают докачку раньше и буфер никогда не доходит до конца
    function checkLoaded() {
        const video = videoRef.value
        if (isLoaded || !video) return

        const {buffered, duration, readyState} = video
        const canPlayThrough = readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA
        const fullyBuffered =
            Number.isFinite(duration) && duration > 0 && buffered.length > 0 &&
            buffered.end(buffered.length - 1) >= duration - 0.05

        if (!canPlayThrough && !fullyBuffered) return

        isLoaded = true
        tryStart()
    }

    // animationend всплывает от вложенных элементов, берём только событие самого блока
    function onRevealEnd(event: AnimationEvent) {
        if (event.target !== event.currentTarget) return
        isRevealFinished = true
        tryStart()
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

        // progress — прогресс буферизации, остальные — страховка для разных браузеров
        for (const eventName of ['progress', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough']) {
            video.addEventListener(eventName, checkLoaded, {signal})
        }

        // Видео могло уже загрузиться из кэша до монтирования слушателей
        checkLoaded()
    })

    onBeforeUnmount(() => {
        listeners?.abort()
        isEnded.value = false
        videoRef.value?.pause()
    })

    return {videoRef, onRevealEnd, isEnded}
}