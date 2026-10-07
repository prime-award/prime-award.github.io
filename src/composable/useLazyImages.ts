import {inject, onBeforeUnmount, provide, reactive, type InjectionKey, type Ref} from 'vue'

interface LazyImages {
    /** Начать следить за элементом; когда он окажется в видимой области, ключ попадёт в «загруженные». */
    observe(el: Element, key: string): void

    unobserve(el: Element): void

    isLoaded(key: string): boolean
}

const LAZY_IMAGES: InjectionKey<LazyImages> = Symbol('lazyImages')

/** Как часто проверять положение карточек, мс. */
const CHECK_INTERVAL = 150

/**
 * IntersectionObserver здесь не подходит: карусель двигается CSS-анимацией transform,
 * которая живёт в композиторе, и observer пересчитывается только когда главный поток
 * получает повод отрисовать кадр (движение мыши, touch, скролл).
 * Поэтому позиции ещё не загруженных карточек проверяем сами через requestAnimationFrame:
 * getBoundingClientRect() отдаёт актуальное положение с учётом анимации.
 *
 * @param root   контейнер карусели (с overflow: hidden)
 * @param margin    сколько px вокруг видимой области считать «почти видимым» (подгрузка с запасом)
 * @param testDelay ТОЛЬКО ДЛЯ ТЕСТА: задержка в мс между «карточка стала видна» и «картинка запрошена».
 *                  Эмулирует медленную загрузку (например, 1000). 0 — выключено.
 */
export function provideLazyImages(root: Ref<HTMLElement | null>, margin = 300, testDelay = 0) {
    const loaded = reactive(new Set<string>())
    // ключи, чья «загрузка» уже запланирована (используется только с testDelay)
    const delayed = new Set<string>()
    const timers = new Set<number>()

    function markLoaded(key: string) {
        if (!testDelay) {
            loaded.add(key)
            return
        }
        if (delayed.has(key)) return
        delayed.add(key)
        const id = window.setTimeout(() => {
            timers.delete(id)
            loaded.add(key)
        }, testDelay)
        timers.add(id)
    }

    // карточки, которые ещё не были видны: элемент -> ключ картинки
    const pending = new Map<Element, string>()
    let rafId = 0
    let lastCheck = -Infinity

    function checkPending() {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const rootRect = root.value?.getBoundingClientRect()

        // видимая область = пересечение карусели с окном браузера + запас
        const left = Math.max(rootRect?.left ?? 0, 0) - margin
        const right = Math.min(rootRect?.right ?? vw, vw) + margin
        const top = Math.max(rootRect?.top ?? 0, 0) - margin
        const bottom = Math.min(rootRect?.bottom ?? vh, vh) + margin

        for (const [el, key] of pending) {
            // вторая копия карточки с тем же ключом уже могла загрузиться (или ждёт testDelay)
            if (loaded.has(key) || delayed.has(key)) {
                pending.delete(el)
                continue
            }

            const rect = el.getBoundingClientRect()
            // элемент без размеров (display: none и т.п.) видимым не считаем
            if (rect.width === 0 && rect.height === 0) continue

            if (rect.right > left && rect.left < right && rect.bottom > top && rect.top < bottom) {
                markLoaded(key)
                pending.delete(el)
            }
        }
    }

    function tick(now: number) {
        rafId = 0
        if (now - lastCheck >= CHECK_INTERVAL) {
            lastCheck = now
            checkPending()
        }
        // пока есть кого ждать — продолжаем; rAF сам встаёт на паузу в фоновой вкладке
        if (pending.size) schedule()
    }

    function schedule() {
        if (!rafId) rafId = requestAnimationFrame(tick)
    }

    function observe(el: Element, key: string) {
        if (loaded.has(key) || delayed.has(key)) return
        pending.set(el, key)
        schedule()
    }

    function unobserve(el: Element) {
        pending.delete(el)
    }

    onBeforeUnmount(() => {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
        pending.clear()
        timers.forEach((id) => clearTimeout(id))
        timers.clear()
    })

    provide(LAZY_IMAGES, {observe, unobserve, isLoaded: (key) => loaded.has(key)})
}

/** Вызывается в карточке. Если родитель не вызвал provideLazyImages, картинка грузится сразу. */
export function injectLazyImages(): LazyImages {
    return inject(LAZY_IMAGES, {
        observe: () => {
        },
        unobserve: () => {
        },
        isLoaded: () => true
    })
}