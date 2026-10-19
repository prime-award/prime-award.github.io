<script setup lang="ts">
import {computed, ref} from 'vue'
import type {Nominee} from '@/api'
import {mediaUrl} from '@/utils/media.ts'
import type {CardState} from './cardState.ts'

const props = withDefaults(defineProps<{
  nominee: Nominee
  state?: CardState
  /** надпись по центру при наведении (главная: «Выбрать») */
  hoverLabel?: string
  /** кнопка поверх размытого фото в состоянии active (анкета: «Подтвердить голос») */
  actionLabel?: string
  /** подпись под кнопкой действия */
  actionHint?: string
  /** плашка сверху (например, «Ваш выбор») */
  badge?: string
  eager?: boolean
}>(), {state: 'idle'})

const emit = defineEmits<{ select: [] }>()

const loaded = ref(false)
const photo = computed(() => mediaUrl(props.nominee.photoPath))
</script>

<template>
  <article
      class="nominee-card"
      :class="[`is-${state}`, { 'has-hover-label': hoverLabel }]"
      :data-nominee-id="nominee.id"
      :data-state="state"
  >
    <div class="nominee-card__media">
      <img
          v-if="photo"
          :src="photo"
          :class="{ 'is-loaded': loaded }"
          alt=""
          draggable="false"
          decoding="async"
          :loading="eager ? 'eager' : 'lazy'"
          @load="loaded = true"
      />
    </div>

    <h3 class="nominee-card__name">{{ nominee.name }}</h3>

    <span v-if="badge" class="nominee-card__badge">{{ badge }}</span>

    <!-- вся карточка кликабельна; кнопка действия лежит поверх и в DOM идёт после -->
    <button
        type="button"
        class="nominee-card__hit"
        :aria-label="state === 'active' && actionLabel ? `${actionLabel}: ${nominee.name}` : hoverLabel ? `${hoverLabel}: ${nominee.name}` : nominee.name"
        :aria-pressed="state === 'active' || state === 'selected'"
        :disabled="state === 'dimmed'"
        @click="emit('select')"
    >
      <span v-if="hoverLabel" class="nominee-card__hover-label" aria-hidden="true">{{ hoverLabel }}</span>
    </button>

    <!-- в состоянии active подпись — только визуальная: подтверждает голос клик по всей карточке -->
    <div v-if="state === 'active' && actionLabel" class="nominee-card__action" aria-hidden="true">
      <span class="nominee-card__action-label" data-testid="confirm-vote">{{ actionLabel }}</span>
      <small v-if="actionHint" class="nominee-card__action-hint">{{ actionHint }}</small>
    </div>
  </article>
</template>

<style scoped>
/*
 * Карточка стримера (M3 card): фото 3:4 + блок с ником под ним; скругление 16dp, обводка 1dp.
 * Состояния: hover — светлая обводка и подпись «Выбрать»; active — фото размыто и кнопка подтверждения;
 * selected — обводка 3dp; dimmed — приглушена.
 */
.nominee-card {
  position: relative;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--bg);
  isolation: isolate;
  aspect-ratio: 3 / 4;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.nominee-card__media {
  position: relative;
  overflow: hidden;
  background: radial-gradient(70% 60% at 50% 45%, rgba(104, 119, 137, 0.9) 0%, rgba(56, 64, 74, 0.45) 50%, transparent 100%);
}

.nominee-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  opacity: 0;
  transition: opacity 0.4s ease, filter 0.3s ease;
}

.nominee-card__media img.is-loaded {
  opacity: 1;
}

/* плавный переход фото в фон карточки под ником */
.nominee-card__media::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 40%;
  background: linear-gradient(to top, var(--bg), transparent);
}

.nominee-card__name {
  margin: 0;
  padding: var(--space-2) var(--space-3) var(--space-4);
  font: 400 var(--type-card-title) var(--font-serif);
  color: #fff;
  text-align: center;
  text-transform: uppercase;
  overflow-wrap: anywhere;
  transition: filter 0.3s ease;
}

.nominee-card__badge {
  position: absolute;
  top: var(--space-3);
  left: 50%;
  translate: -50% 0;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--shape-full);
  background: var(--text);
  color: var(--bg);
  font: 600 var(--type-label-m) var(--font-text);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.nominee-card__hit {
  position: absolute;
  inset: 0;
  touch-action: manipulation;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  cursor: pointer;
}

.nominee-card__hit:disabled {
  cursor: default;
}

.nominee-card__hit:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: -4px;
}

/* подписи-кнопки поверх фото: tonal button M3 (40dp, поля 24dp) */
.nominee-card__hover-label,
.nominee-card__action-label {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-h);
  padding: 0 var(--space-6);
  border: 1px solid var(--line);
  border-radius: var(--shape-full);
  background: rgba(23, 26, 31, 0.72);
  backdrop-filter: blur(4px);
  color: #fff;
  font: 400 var(--type-title-m) var(--font-serif);
  white-space: nowrap;
}

.nominee-card__hover-label {
  opacity: 0;
  transform: translateY(var(--space-2));
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

@media (hover: hover) {
  .nominee-card.is-idle:hover {
    border-color: var(--text);
  }

  .nominee-card.has-hover-label.is-idle:hover .nominee-card__hover-label {
    opacity: 1;
    transform: none;
  }
}

.nominee-card.is-idle:has(.nominee-card__hit:focus-visible) .nominee-card__hover-label {
  opacity: 1;
  transform: none;
}

.nominee-card.is-active {
  border-color: var(--text);
}

.nominee-card.is-active .nominee-card__media img,
.nominee-card.is-active .nominee-card__name {
  filter: blur(5px);
}

.nominee-card__action {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  pointer-events: none;
  animation: action-in 0.2s ease both;
}


.nominee-card__action-label {
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

/* подпись «Подтвердить голос» подсвечивается вместе с карточкой */
.nominee-card.is-active:hover .nominee-card__action-label,
.nominee-card.is-active:has(.nominee-card__hit:focus-visible) .nominee-card__action-label {
  border-color: var(--text);
  background: var(--text);
  color: var(--bg);
}

.nominee-card__action-hint {
  color: var(--text);
  font: var(--type-body-s) var(--font-text);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}

/* selected: толстая рамка — отдельным слоем поверх, чтобы не менялась геометрия карточки (иначе содержимое сдвигается) */
.nominee-card.is-selected {
  border-color: var(--text);
}

.nominee-card.is-selected::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  border: 2px solid var(--text);
  border-radius: inherit;
  pointer-events: none;
}

.nominee-card.is-dimmed {
  opacity: 0.38;
  filter: grayscale(0.5);
}

/* узкая карточка (анкета, до ~240dp): шрифты и поля на ступень меньше */
@container (max-width: 240px) {
  .nominee-card__name {
    font: 400 var(--type-title-m) var(--font-serif);
  }

  .nominee-card__hover-label,
  .nominee-card__action-label {
    min-height: var(--control-h-sm);
    padding: 0 var(--space-3);
    font: 400 var(--type-label-l) var(--font-serif);
  }
}

@keyframes action-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
