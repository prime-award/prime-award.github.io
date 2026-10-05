import {inject, onBeforeUnmount, provide, reactive, type InjectionKey, type Ref} from 'vue'

interface LazyImages {
    /** Начать следить за элементом; когда он подойдёт к видимой области, ключ попадёт в «загруженные». */
    observe(el: Element, key: string): void

    unobserve(el: Element): void

    isLoaded(key: string): boolean
}

const LAZY_IMAGES: InjectionKey<LazyImages> = Symbol('lazyImages')


export function provideLazyImages(root: Ref<HTMLElement | null>, rootMargin = '0px 300px') {
    const loaded = reactive(new Set<string>())
    const keys = new WeakMap<Element, string>()
    let observer: IntersectionObserver | null = null

    function getObserver(): IntersectionObserver {
        observer ??= new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    const key = keys.get(entry.target)
                    if (key) loaded.add(key)
                    // картинка запрошена один раз — следить дальше не нужно
                    observer?.unobserve(entry.target)
                }
            },
            {root: root.value, rootMargin}
        )
        return observer
    }

    function observe(el: Element, key: string) {
        if (loaded.has(key)) return
        // старые браузеры без IntersectionObserver: грузим сразу
        if (typeof IntersectionObserver === 'undefined') {
            loaded.add(key)
            return
        }
        keys.set(el, key)
        getObserver().observe(el)
    }

    function unobserve(el: Element) {
        observer?.unobserve(el)
        keys.delete(el)
    }

    onBeforeUnmount(() => observer?.disconnect())

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