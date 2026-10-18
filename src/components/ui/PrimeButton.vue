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
.prime-button--lg { padding: 14px 30px; font-size: clamp(20px, 2vw, 34px); }

/* как «Проголосовать» в макете: светлая пилюля с мягким градиентом */
.prime-button--light {
  color: var(--bg);
  background: linear-gradient(180deg, #f4f5f7 0%, #c9cdd3 100%);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.18);
}

/* как «Сделать выбор» / «Подтвердить голос»: тёмная полупрозрачная пилюля с тонкой обводкой */
.prime-button--dark {
  color: var(--text);
  background: linear-gradient(180deg, rgba(40, 45, 53, 0.85) 0%, rgba(14, 16, 20, 0.85) 100%);
  border-color: var(--line);
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
  box-shadow: 0 0 24px var(--accent-glow), inset 0 -2px 6px rgba(0, 0, 0, 0.18);
}

.prime-button--dark:hover:not(.is-disabled) {
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
