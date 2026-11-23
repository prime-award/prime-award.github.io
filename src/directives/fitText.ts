import type {ObjectDirective} from 'vue'

function fitText(el: HTMLElement) {
  el.style.removeProperty('font-size')
  if (!el.clientWidth || el.scrollWidth <= el.clientWidth) return

  let upper = parseFloat(getComputedStyle(el).fontSize)
  let lower = 0
  while (upper - lower > 0.1) {
    const size = (lower + upper) / 2
    el.style.fontSize = `${size}px`
    if (el.scrollWidth <= el.clientWidth) lower = size
    else upper = size
  }
  el.style.fontSize = `${lower}px`
}

const cleanups = new WeakMap<HTMLElement, () => void>()

export const vFitText: ObjectDirective<HTMLElement, string | undefined> = {
  mounted(el) {
    const fit = () => fitText(el)
    let lastWidth = -1
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width !== lastWidth) {
        lastWidth = entry.contentRect.width
        fit()
      }
    })
    observer.observe(el)
    document.fonts?.addEventListener('loadingdone', fit)
    fit()
    cleanups.set(el, () => {
      observer.disconnect()
      document.fonts?.removeEventListener('loadingdone', fit)
    })
  },
  updated(el, {value, oldValue}) {
    if (value !== oldValue) fitText(el)
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  },
}
