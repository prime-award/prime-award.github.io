import {onBeforeUnmount, onMounted, readonly, ref} from 'vue'

/**
 * Порог появления полной шапки (логотипы PRIME и спонсора, фон): доля высоты окна.
 * Шапка появляется, когда нижний край главного экрана поднялся выше этой линии.
 * 0 — только когда главный экран ушёл целиком; 0.1 — на 10% раньше; 0.3 — ещё раньше.
 */
export const HEADER_REVEAL_AT = 0.1

// Виден ли сейчас главный экран (MainBlock). Общий на всё приложение: по нему header прячет свои логотипы,
// пока на экране их крупные версии. Когда MainBlock размонтирован (другие страницы) — false.
const heroInView = ref(false)

/** Вызывается в MainBlock: следит за прокруткой относительно его корневого элемента. */
export function useHeroVisibility() {
    const heroRef = ref<HTMLElement | null>(null)
    let frame = 0

    function update() {
        frame = 0
        const el = heroRef.value
        if (!el) return
        heroInView.value = el.getBoundingClientRect().bottom > window.innerHeight * HEADER_REVEAL_AT
    }

    // не чаще одного раза за кадр
    function schedule() {
        if (!frame) frame = requestAnimationFrame(update)
    }

    onMounted(() => {
        update()
        window.addEventListener('scroll', schedule, {passive: true})
        window.addEventListener('resize', schedule, {passive: true})
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
        if (frame) cancelAnimationFrame(frame)
        heroInView.value = false
    })

    return {heroRef}
}

/** Для header: true — главный экран на виду. */
export function useHeroInView() {
    return readonly(heroInView)
}
