import {onBeforeUnmount, onMounted, ref} from 'vue'

// Минимальное время показа лоадера, чтобы он не мигал, когда видео уже в кэше (0 — отключить)
const MIN_LOADER_MS = 100
// Страховка: если видео не загрузилось за это время (медленная сеть, ошибка) — всё равно открываем страницу
const LOAD_TIMEOUT_MS = 15000

// Искусственная задержка лоадера для тестов (мс). Для прода оставляем 0.
// Можно переопределить без пересборки через URL: ?loaderDelay=5000
const DEBUG_LOADER_DELAY_MS = 0

function getDebugDelay() {
    const param = new URLSearchParams(window.location.search).get('loaderDelay')
    const fromQuery = param === null ? NaN : Number(param)
    return Number.isFinite(fromQuery) && fromQuery >= 0 ? fromQuery : DEBUG_LOADER_DELAY_MS
}

/*
 * Последовательность:
 * 1. Висит AppLoader, пока видео не загрузится (isLoaded = false)
 * 2. Видео загрузилось -> лоадер уходит (isLoaded = true)
 * 3. Лоадер полностью исчез -> стартует вступительная анимация (isRevealStarted = true)
 * 4. Анимация закончилась -> стартует видео
 * 5. Видео доиграло -> стартует мерцание (isEnded = true)
 */
export function useMainBackground() {
    const videoRef = ref<HTMLVideoElement | null>(null)
    // true, когда видео полностью загрузилось (и прошло минимальное время лоадера): по нему прячем AppLoader
    const isLoaded = ref(false)
    // true, когда лоадер полностью исчез: по нему запускается вступительная анимация
    const isRevealStarted = ref(false)
    // true, когда видео доиграло до конца: по нему запускается зацикленное мерцание поверх последнего кадра
    const isEnded = ref(false)

    let isRevealFinished = false
    let started = false
    let loadHandled = false
    let listeners: AbortController | null = null
    let minTimer: ReturnType<typeof setTimeout> | undefined
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined
    const createdAt = performance.now()

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

    // Видео стартует, когда файл загружен И вступительная анимация закончилась
    function tryStart() {
        if (isLoaded.value && isRevealFinished) start()
    }

    // Загрузка завершена (успешно, с ошибкой или по таймауту): выдерживаем минимальное время лоадера и прячем его
    function finishLoading() {
        if (loadHandled) return
        loadHandled = true
        clearTimeout(timeoutTimer)

        // Лоадер висит минимум max(MIN_LOADER_MS, debugDelay) от создания компонента
        const minTime = Math.max(MIN_LOADER_MS, getDebugDelay())
        const wait = Math.max(0, minTime - (performance.now() - createdAt))
        minTimer = setTimeout(() => {
            isLoaded.value = true
            tryStart()
        }, wait)
    }

    // Файл считаем загруженным, когда браузер уверен, что доиграет без остановок (HAVE_ENOUGH_DATA),
    // либо когда буфер дошёл до конца. Только «полный буфер» ненадёжен: браузеры часто
    // приостанавливают докачку раньше и буфер никогда не доходит до конца
    function checkLoaded() {
        const video = videoRef.value
        if (loadHandled || !video) return

        const {buffered, duration, readyState} = video
        const canPlayThrough = readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA
        const fullyBuffered =
            Number.isFinite(duration) && duration > 0 && buffered.length > 0 &&
            buffered.end(buffered.length - 1) >= duration - 0.05

        if (!canPlayThrough && !fullyBuffered) return

        finishLoading()
    }

    // Вызывается Transition-ом, когда AppLoader полностью исчез: теперь можно запускать вступительную анимацию
    function onLoaderLeave() {
        isRevealStarted.value = true
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

        // Файл не загрузился — не держим пользователя на лоадере вечно
        video.addEventListener('error', finishLoading, {signal})

        // progress — прогресс буферизации, остальные — страховка для разных браузеров
        for (const eventName of ['progress', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough']) {
            video.addEventListener(eventName, checkLoaded, {signal})
        }

        timeoutTimer = setTimeout(finishLoading, LOAD_TIMEOUT_MS)

        // Видео могло уже загрузиться из кэша до монтирования слушателей
        checkLoaded()
    })

    onBeforeUnmount(() => {
        listeners?.abort()
        clearTimeout(minTimer)
        clearTimeout(timeoutTimer)
        isEnded.value = false
        videoRef.value?.pause()
    })

    return {videoRef, onRevealEnd, isEnded, isLoaded, isRevealStarted, onLoaderLeave}
}