<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'

// Горизонтальная лента карточек с треугольниками: стрелки сдвигают на одну карточку,
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

function step(direction: 1 | -1) {
  const el = track.value
  const card = el?.firstElementChild as HTMLElement | null
  if (!el || !card) return
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  el.scrollBy({left: direction * (card.offsetWidth + gap), behavior: 'smooth'})
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
.strip {
  --per-view: 4;
  --gap: clamp(12px, 2.2vw, 70px);
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 30px;
  align-items: center;
  gap: clamp(8px, 1vw, 20px);
}

.strip__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--per-view) - 1) * var(--gap)) / var(--per-view));
  gap: var(--gap);
  margin: 0;
  padding: 6px 2px;
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

/* треугольники из макета */
.strip__arrow {
  display: grid;
  place-items: center;
  width: 30px;
  height: 60px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.strip__arrow span {
  width: 0;
  height: 0;
  border-block: 9px solid transparent;
}

.strip__arrow--prev span {
  border-right: 14px solid var(--text);
}

.strip__arrow--next span {
  border-left: 14px solid var(--text);
}

.strip__arrow:hover:not(:disabled) {
  transform: scale(1.15);
}

.strip__arrow:disabled {
  opacity: 0.2;
  cursor: default;
}

@media (max-width: 1280px) {
  .strip { --per-view: 3; }
}

@media (max-width: 900px) {
  .strip { --per-view: 2.2; }
}

@media (max-width: 560px) {
  .strip {
    --per-view: 1.35;
    grid-template-columns: minmax(0, 1fr);
  }

  /* на телефоне листаем пальцем, стрелки не нужны */
  .strip__arrow {
    display: none;
  }
}
</style>
