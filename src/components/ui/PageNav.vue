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
.page-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: var(--font-serif);
  font-size: clamp(22px, 1.875vw, 36px);
  letter-spacing: -0.03em;
}

.page-nav__arrow {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0 0 2px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  font-size: 1em;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.page-nav__arrow:hover:not(:disabled) {
  background: rgba(229, 231, 234, 0.08);
}

.page-nav__arrow:disabled {
  opacity: 0.25;
  cursor: default;
}

.page-nav__counter {
  min-width: 3.2em;
  text-align: center;
}
</style>
