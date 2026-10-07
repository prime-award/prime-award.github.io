<script setup>
defineProps({
  // 'primary' — залитая, 'ghost' — прозрачная с обводкой
  variant: {type: String, default: 'primary'},
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
      type="button"
      class="form-button"
      :class="`form-button--${variant}`"
      @click="emit('click', $event)"
  >
    <slot/>
  </button>
</template>

<style scoped>
.form-button {
  display: inline-block;
  padding: 14px 29px;
  border: 1px solid var(--text);
  border-radius: 25px;
  font-family: var(--font-display), serif;
  font-size: clamp(22px, 2.5vw, 36px);
  line-height: normal;
  cursor: pointer;
  appearance: none;
  transition: transform 0.2s, opacity 0.2s, box-shadow 0.3s, background-color 0.2s;
}

.form-button--primary {
  background: var(--text);
  color: var(--bg);
}

.form-button--ghost {
  background: transparent;
  border-color: color-mix(in srgb, var(--text) 40%, transparent);
  color: var(--text);
}

.form-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 5px color-mix(in srgb, var(--text) 55%, transparent);
}

.form-button--primary:hover {
  opacity: 0.9;
}

.form-button--ghost:hover {
  background: color-mix(in srgb, var(--text) 12%, transparent);
}

.form-button:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
</style>