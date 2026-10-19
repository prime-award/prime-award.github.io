<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'

// Горизонтальная лента карточек с треугольниками: стрелки листают по страницам (сколько карточек видно),
// на тач-устройствах лента листается пальцем (нативный скролл со scroll-snap).
const props = defineProps<{ count: number, label: string }>()

const track = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)
let resizeObserver: ResizeObserver | null = null

function update() {
  const el = track.value
  if (!el) return
  canPrev.value = el.scrollLeft > 2
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

/** Листаем страницами: на ширину видимой области; scroll-snap выравнивает по началу карточки. */
function step(direction: 1 | -1) {
  const el = track.value
  if (!el) return
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  el.scrollBy({left: direction * (el.clientWidth + gap), behavior: 'smooth'})
}

onMounted(() => {
  update()
  resizeObserver = new ResizeObserver(update)
  if (track.value) resizeObserver.observe(track.value)
})

watch(() => props.count, () => nextTick(update))

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="strip">
    <button type="button" class="strip__arrow strip__arrow--prev" :disabled="!canPrev" aria-label="Предыдущие номинанты" @click="step(-1)">
      <span aria-hidden="true"/>
    </button>

    <ul ref="track" class="strip__track" :aria-label="label" @scroll.passive="update">
      <slot/>
    </ul>

    <button type="button" class="strip__arrow strip__arrow--next" :disabled="!canNext" aria-label="Следующие номинанты" @click="step(1)">
      <span aria-hidden="true"/>
    </button>
  </div>
</template>

<style scoped>
/*
 * Лента карточек: число видимых карточек зависит от класса окна M3
 * (compact — 1 с «подглядыванием» следующей, medium — 2, expanded — 3, large+ — 4).
 */
.strip {
  --per-view: 1.25;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: var(--space-2);
}

.strip__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--per-view) - 1) * var(--layout-gutter)) / var(--per-view));
  gap: var(--space-4);
  margin: 0;
  padding: var(--space-1) 0;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.strip__track::-webkit-scrollbar {
  display: none;
}

.strip__track > :slotted(li) {
  scroll-snap-align: start;
  min-width: 0;
}

/* треугольники — иконочные кнопки с зоной нажатия 48dp */
.strip__arrow {
  display: none;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  padding: 0;
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  cursor: pointer;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.strip__arrow span {
  width: 0;
  height: 0;
  border-block: var(--space-2) solid transparent;
}

.strip__arrow--prev span {
  border-right: var(--space-3) solid var(--text);
}

.strip__arrow--next span {
  border-left: var(--space-3) solid var(--text);
}

.strip__arrow:hover:not(:disabled) {
  background: var(--state-hover);
}

.strip__arrow:disabled {
  opacity: 0.2;
  cursor: default;
}

/* medium: 2 карточки, появляются стрелки */
@media (min-width: 600px) {
  .strip {
    --per-view: 2;
    grid-template-columns: var(--touch-target) minmax(0, 1fr) var(--touch-target);
  }

  .strip__arrow {
    display: grid;
  }
}

@media (min-width: 840px) {
  .strip { --per-view: 3; }
}

@media (min-width: 1200px) {
  .strip { --per-view: 4; }
}
</style>
