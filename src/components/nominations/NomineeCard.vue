<script setup lang="ts">
import {computed, ref} from 'vue'
import type {Nominee} from '@/api'
import {mediaUrl} from '@/utils/media.ts'
import type {CardState} from './cardState.ts'

// Карточка стримера (370×524 в макете): фото, ник внизу на градиенте.
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

const emit = defineEmits<{ select: [], action: [event: MouseEvent | KeyboardEvent] }>()

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
        :aria-label="hoverLabel ? `${hoverLabel}: ${nominee.name}` : nominee.name"
        :aria-pressed="state === 'active' || state === 'selected'"
        :disabled="state === 'dimmed'"
        @click="emit('select')"
    >
      <span v-if="hoverLabel" class="nominee-card__hover-label" aria-hidden="true">{{ hoverLabel }}</span>
    </button>

    <div v-if="state === 'active' && actionLabel" class="nominee-card__action">
      <button
          type="button"
          class="nominee-card__action-button"
          data-testid="confirm-vote"
          @click.stop="emit('action', $event)"
      >
        {{ actionLabel }}
      </button>
      <small v-if="actionHint" class="nominee-card__action-hint">{{ actionHint }}</small>
    </div>
  </article>
</template>

<style scoped>
.nominee-card {
  position: relative;
  aspect-ratio: 370 / 524;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: radial-gradient(circle at 50% 35%, #687789 0%, #1a1e24 45%, var(--bg) 100%);
  isolation: isolate;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
}

.nominee-card__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.nominee-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  opacity: 0;
  transition: opacity 0.4s ease, filter 0.3s ease, transform 0.4s ease;
}

.nominee-card__media img.is-loaded {
  opacity: 1;
}

/* затемнение снизу под ник и мягкая внутренняя тень, как в макете */
.nominee-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 9, 11, 0.95) 0%, rgba(8, 9, 11, 0.55) 18%, transparent 42%);
  box-shadow: inset 0 6px 60px rgba(0, 0, 0, 0.55);
}

.nominee-card__name {
  position: absolute;
  inset: auto 8px 6%;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(18px, 1.5vw, 30px);
  line-height: 1.05;
  text-align: center;
  text-transform: uppercase;
  overflow-wrap: anywhere;
  transition: filter 0.3s ease;
}

.nominee-card__badge {
  position: absolute;
  top: 12px;
  left: 50%;
  translate: -50% 0;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--text);
  color: var(--bg);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.nominee-card__hit {
  position: absolute;
  inset: 0;
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

.nominee-card__hover-label,
.nominee-card__action-button {
  padding: 12px 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: linear-gradient(180deg, rgba(40, 45, 53, 0.82) 0%, rgba(14, 16, 20, 0.82) 100%);
  backdrop-filter: blur(6px);
  font-family: var(--font-display);
  font-size: clamp(16px, 1.15vw, 22px);
  line-height: 1;
  white-space: nowrap;
}

.nominee-card__hover-label {
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

/* ---- hover (desktop) ---- */
@media (hover: hover) {
  .nominee-card.is-idle:hover {
    border-color: var(--line-strong);
    box-shadow: 0 0 22px rgba(229, 231, 234, 0.12);
  }

  .nominee-card.is-idle:hover .nominee-card__media img {
    transform: scale(1.03);
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

/* ---- active: фото размыто, кнопка подтверждения поверх ---- */
.nominee-card.is-active {
  border-color: var(--line-strong);
}

.nominee-card.is-active .nominee-card__media img,
.nominee-card.is-active .nominee-card__name {
  filter: blur(6px) brightness(0.65);
}

.nominee-card__action {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  pointer-events: none;
  animation: action-in 0.2s ease both;
}

.nominee-card__action-button {
  pointer-events: auto;
  /* двойной тап не должен масштабировать страницу (iOS) */
  touch-action: manipulation;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.nominee-card__action-button:hover {
  border-color: var(--line-strong);
  box-shadow: 0 0 18px rgba(229, 231, 234, 0.2);
}

.nominee-card__action-button:active {
  transform: scale(0.97);
}

.nominee-card__action-hint {
  color: var(--text);
  font-size: 13px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}

/* ---- selected: белая обводка ---- */
.nominee-card.is-selected {
  border: 2px solid var(--text);
  box-shadow: 0 0 26px rgba(229, 231, 234, 0.25);
}

/* ---- dimmed: голос отдан за другого ---- */
.nominee-card.is-dimmed {
  opacity: 0.4;
  filter: grayscale(0.5);
}

@keyframes action-in {
  from { opacity: 0; transform: scale(0.96); }
}
</style>
