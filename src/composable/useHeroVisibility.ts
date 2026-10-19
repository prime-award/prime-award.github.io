import {onBeforeUnmount, onMounted, readonly, ref} from 'vue'

// Виден ли сейчас главный экран (MainBlock). Общий на всё приложение: по нему header прячет свой логотип,
// пока на экране большой логотип PRIME. Когда MainBlock размонтирован (другие страницы) — false.
const heroInView = ref(false)

/** Вызывается в MainBlock: следит за его корневым элементом. */
export function useHeroVisibility() {
    const heroRef = ref<HTMLElement | null>(null)
    let observer: IntersectionObserver | null = null

    onMounted(() => {
        if (!heroRef.value) return
        heroInView.value = true
        observer = new IntersectionObserver(([entry]) => {
            heroInView.value = entry.isIntersecting
        }, {threshold: 0, rootMargin: '0px 0px 0px 0px'})
        observer.observe(heroRef.value)
    })

    onBeforeUnmount(() => {
        observer?.disconnect()
        heroInView.value = false
    })

    return {heroRef}
}

/** Для header: true — главный экран на виду. */
export function useHeroInView() {
    return readonly(heroInView)
}
