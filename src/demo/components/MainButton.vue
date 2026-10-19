<script setup>
import {RouterLink} from 'vue-router'

defineProps({
  to: {type: [String, Object], default: '/form'},
})
</script>

<template>
  <RouterLink class="button" :to="to">
    <slot/>
  </RouterLink>
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
  font-family: var(--font-display), serif;
  font-size: clamp(22px, 2.5vw, 36px);
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