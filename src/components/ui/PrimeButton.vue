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
      v-bind="to ? {} : {href}"
      :type="tag === 'button' ? type : undefined"
      :disabled="tag === 'button' ? disabled : undefined"
      :aria-disabled="disabled || undefined"
  >
    <slot/>
  </component>
</template>

<style scoped>
/* Кнопки по M3: высота 40dp (lg — 56dp), горизонтальные поля 24dp, скругление full, текст — label-l. */
.prime-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--control-h);
  padding: 0 var(--space-6);
  border: 1px solid transparent;
  border-radius: var(--shape-full);
  font: 400 var(--type-label-l) var(--font-serif);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.prime-button--sm {
  min-height: var(--control-h-sm);
  padding: 0 var(--space-4);
  font: 400 var(--type-label-m) var(--font-serif);
}

/* крупная кнопка главного действия (на главном экране) */
.prime-button--lg {
  min-height: var(--control-h-lg);
  padding: 0 var(--space-8);
  font: 400 var(--type-headline-s) var(--font-display);
  letter-spacing: 0;
  /* у Foglihten в капсе есть декоративные лигатуры (ОСО и т.п.) — на кнопках они мешают читать */
  font-variant-ligatures: none;
  font-feature-settings: 'liga' 0, 'dlig' 0;
}

/* filled: светлая, главное действие */
.prime-button--light {
  color: var(--bg);
  background: var(--text);
}

.prime-button--light:hover:not(.is-disabled) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15);
  background: #fff;
}

/* outlined: тёмная с обводкой */
.prime-button--dark {
  color: var(--text);
  background: transparent;
  border-color: var(--border);
}

.prime-button--dark:hover:not(.is-disabled) {
  background: var(--state-hover);
  border-color: var(--line-strong);
}

/* text: без фона */
.prime-button--ghost {
  color: var(--text-muted);
  background: transparent;
  padding: 0 var(--space-3);
}

.prime-button--ghost:hover:not(.is-disabled) {
  color: var(--text);
  background: var(--state-hover);
}

.prime-button:active:not(.is-disabled) {
  background-image: linear-gradient(var(--state-pressed), var(--state-pressed));
}

.prime-button.is-disabled {
  opacity: 0.38; /* M3: disabled content 38% */
  cursor: default;
}
</style>
