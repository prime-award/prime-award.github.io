<script setup lang="ts">
import {computed} from 'vue'
import type {RouteLocationRaw} from 'vue-router'

const props = withDefaults(defineProps<{
  /** light — светлая пилюля (главное действие), dark — тёмная с обводкой, ghost — только текст */
  variant?: 'light' | 'dark' | 'ghost'
  size?: 'md' | 'lg' | 'sm'
  to?: RouteLocationRaw
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {variant: 'dark', size: 'md', type: 'button'})

const tag = computed(() => (props.to ? 'RouterLink' : props.href ? 'a' : 'button'))
</script>

<template>
  <component
      :is="tag"
      class="prime-button"
      :class="[`prime-button--${variant}`, `prime-button--${size}`, {'is-disabled': disabled}]"
      :to="to"
      :href="href"
      :type="tag === 'button' ? type : undefined"
      :disabled="tag === 'button' ? disabled : undefined"
      :aria-disabled="disabled || undefined"
  >
    <slot/>
  </component>
</template>

<style scoped>
.prime-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  text-transform: uppercase;
  text-decoration: none;
  line-height: 1;
  white-space: nowrap;
  /* у Foglihten в капсе есть декоративные лигатуры (ОСО и т.п.) — на кнопках они мешают читать */
  font-variant-ligatures: none;
  font-feature-settings: 'liga' 0, 'dlig' 0;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.25s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s;
}

.prime-button--sm { padding: 9px 16px; font-size: 15px; }
.prime-button--md { padding: 12px 22px; font-size: clamp(16px, 1.25vw, 22px); }
.prime-button--lg { padding: 0.31em 0.62em; font-size: clamp(22px, 2.5vw, 48px); }

/* «Проголосовать» (макет 74:174): сплошная #e5e7ea, скругление 25, Foglihten */
.prime-button--light {
  color: var(--bg);
  background: var(--text);
  border-radius: 25px;
}

/* «Сделать выбор» (макет 367:500): полупрозрачная тёмная пилюля, Palatino капсом */
.prime-button--dark {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(23, 26, 31, 0.6);
  border-color: rgba(229, 231, 234, 0.18);
  font-family: var(--font-serif);
  backdrop-filter: blur(6px);
}

.prime-button--ghost {
  color: var(--muted-2);
  background: transparent;
  padding-inline: 6px;
}

.prime-button:hover:not(.is-disabled) {
  transform: translateY(-1px);
}

.prime-button--light:hover:not(.is-disabled) {
  opacity: 0.92;
  box-shadow: 0 0 25px var(--accent-glow);
}

.prime-button--dark:hover:not(.is-disabled) {
  color: #fff;
  border-color: var(--line-strong);
  box-shadow: 0 0 14px rgba(229, 231, 234, 0.15);
}

.prime-button--ghost:hover:not(.is-disabled) {
  color: var(--text);
}

.prime-button.is-disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
