<script setup lang="ts">
// Пагинация в стиле макета: «‹ 1/13 ›»
const props = defineProps<{
  page: number
  total: number
  label?: string
}>()

const emit = defineEmits<{ change: [page: number] }>()

function go(page: number) {
  if (page >= 1 && page <= props.total && page !== props.page) emit('change', page)
}
</script>

<template>
  <nav v-if="total > 1" class="page-nav" :aria-label="label ?? 'Страницы'">
    <button type="button" class="page-nav__arrow" :disabled="page <= 1" aria-label="Предыдущая страница" @click="go(page - 1)">
      &lt;
    </button>
    <span class="page-nav__counter" aria-live="polite">{{ page }}/{{ total }}</span>
    <button type="button" class="page-nav__arrow" :disabled="page >= total" aria-label="Следующая страница" @click="go(page + 1)">
      &gt;
    </button>
  </nav>
</template>

<style scoped>
/* Пагинация «< 1/13 >»: иконочные кнопки 48dp (зона нажатия M3), счётчик — title-l. */
.page-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font: 400 var(--type-title-l) var(--font-serif);
}

.page-nav__arrow {
  display: grid;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  padding: 0;
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.page-nav__arrow:hover:not(:disabled) {
  background: var(--state-hover);
}

.page-nav__arrow:disabled {
  opacity: 0.38;
  cursor: default;
}

.page-nav__counter {
  min-width: 4em;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
