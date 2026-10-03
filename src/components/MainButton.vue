<script setup>
defineProps({
  href: {type: String, default: ''},
})

// Передаём позицию курсора в CSS — по ней рисуется "прожектор"
function onMove(e) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--x', `${e.clientX - rect.left}px`)
  el.style.setProperty('--y', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <a v-if="href" class="button" :href="href" @mousemove="onMove">
    <slot/>
  </a>
  <button v-else class="button" type="button" @mousemove="onMove">
    <slot/>
  </button>
</template>

<style scoped>
.button {
  position: relative;
  overflow: hidden;
  display: inline-block;
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-display);
  font-size: clamp(22px, 2.5vw, 48px);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s, box-shadow 0.3s;
}

/* Световое пятно под курсором */
.button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  /* мягкое внешнее свечение цвета кнопки */
  box-shadow: 0 0 25px color-mix(in srgb, var(--text) 55%, transparent);
}

.button:hover::before {
  opacity: 1;
}
</style>