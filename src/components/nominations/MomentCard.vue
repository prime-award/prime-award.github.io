<script setup lang="ts">
import {computed, ref} from 'vue'
import type {Nominee} from '@/api'
import {mediaUrl} from '@/utils/media.ts'
import {type CardState, formatTimecode} from './cardState.ts'

// Карточка момента (405×363 в макете): превью 16:9, название, участники и таймкод.
const props = withDefaults(defineProps<{
  nominee: Nominee
  state?: CardState
  hoverLabel?: string
  actionLabel?: string
  actionHint?: string
  badge?: string
  /** таймкод показывается снаружи, кнопкой под карточкой (анкета с плеером) — внутри его не рисуем */
  seekable?: boolean
  eager?: boolean
}>(), {state: 'idle'})

const emit = defineEmits<{ select: [] }>()

const loaded = ref(false)
const preview = computed(() => mediaUrl(props.nominee.photoPath))
const timecode = computed(() =>
    props.nominee.timecodeSeconds == null ? null : formatTimecode(props.nominee.timecodeSeconds),
)
</script>

<template>
  <article class="moment-card" :class="[`is-${state}`, { 'without-preview': !preview, 'has-hover-label': hoverLabel, 'has-timecode': timecode && !seekable }]" :data-nominee-id="nominee.id" :data-state="state">
    <div v-if="preview" class="moment-card__preview">
      <img
          :src="preview"
          :class="{ 'is-loaded': loaded }"
          alt=""
          draggable="false"
          decoding="async"
          :loading="eager ? 'eager' : 'lazy'"
          @load="loaded = true"
      />
    </div>

    <div class="moment-card__body">
      <h3 class="moment-card__title">{{ nominee.name }}</h3>
      <p v-if="nominee.participants" class="moment-card__participants">{{ nominee.participants }}</p>
    </div>

    <span v-if="badge" class="moment-card__badge">{{ badge }}</span>

    <button
        type="button"
        class="moment-card__hit"
        :aria-label="state === 'active' && actionLabel ? `${actionLabel}: ${nominee.name}` : hoverLabel ? `${hoverLabel}: ${nominee.name}` : nominee.name"
        :aria-pressed="state === 'active' || state === 'selected'"
        :disabled="state === 'dimmed'"
        @click="emit('select')"
    >
      <span v-if="hoverLabel" class="moment-card__hover-label" aria-hidden="true">{{ hoverLabel }}</span>
    </button>

    <!-- в анкете (seekable) таймкод — отдельная кнопка под карточкой, здесь только подпись -->
    <span v-if="timecode && !seekable" class="moment-card__timecode">{{ timecode }}</span>

    <!-- в состоянии active подпись — только визуальная: подтверждает голос клик по всей карточке -->
    <div v-if="state === 'active' && actionLabel" class="moment-card__action" aria-hidden="true">
      <span class="moment-card__action-label" data-testid="confirm-vote">{{ actionLabel }}</span>
      <small v-if="actionHint" class="moment-card__action-hint">{{ actionHint }}</small>
    </div>
  </article>
</template>

<style scoped>
/*
 * Карточка момента (M3 card): превью 16:9 + название, участники и таймкод под ним.
 * Высоту задаёт содержимое; скругление 16dp, у превью — 12dp, поля 8/16dp.
 */
.moment-card {
  position: relative;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  height: 100%;
  overflow: hidden;
  padding: var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--bg);
  isolation: isolate;
  transition: border-color 0.2s ease, opacity 0.2s ease;
}

.moment-card__preview {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--shape-md);
  background: var(--surface-2);
}

.moment-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 20%;
  opacity: 0;
  transition: opacity 0.4s ease, filter 0.3s ease;
}

.moment-card__preview img.is-loaded {
  opacity: 0.8;
}

.moment-card__preview::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 50%;
  background: linear-gradient(to top, var(--bg), transparent);
}

.moment-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2) var(--space-4);
  text-align: center;
  text-wrap: balance;
  transition: filter 0.3s ease;
}

.moment-card.without-preview .moment-card__body {
  justify-content: center;
  min-height: 8rem;
  padding-block: var(--space-4);
}

.moment-card.without-preview:has(.moment-card__badge) .moment-card__body {
  padding-top: var(--space-12);
}

.moment-card.has-timecode .moment-card__body {
  padding-bottom: var(--space-12);
}

.moment-card__title {
  margin: 0;
  font: 400 var(--type-card-title) var(--font-serif);
  color: #fff;
  overflow-wrap: anywhere;
}

.moment-card__participants {
  margin: 0;
  color: var(--text-subtle);
  font: var(--type-body-m) var(--font-serif);
}

.moment-card__timecode {
  position: absolute;
  bottom: var(--space-3);
  left: 50%;
  z-index: 1;
  translate: -50% 0;
  color: var(--text-subtle);
  font: var(--type-label-l) var(--font-serif);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.moment-card__badge {
  position: absolute;
  top: var(--space-4);
  left: 50%;
  z-index: 1;
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

.moment-card__hit {
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

.moment-card__hit:disabled {
  cursor: default;
}

.moment-card__hit:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: -4px;
}

.moment-card__hover-label,
.moment-card__action-label {
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

.moment-card__hover-label {
  opacity: 0;
  transform: translateY(var(--space-2));
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

@media (hover: hover) {
  .moment-card.is-idle:hover {
    border-color: var(--text);
  }

  .moment-card.has-hover-label.is-idle:hover .moment-card__hover-label {
    opacity: 1;
    transform: none;
  }
}

.moment-card.is-active {
  border-color: var(--text);
}

.moment-card.is-active .moment-card__preview img,
.moment-card.is-active .moment-card__body {
  filter: blur(5px);
}

.moment-card__action {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  pointer-events: none;
  animation: action-in 0.2s ease both;
}


.moment-card__action-label {
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

/* подпись «Подтвердить голос» подсвечивается вместе с карточкой */
.moment-card.is-active:hover .moment-card__action-label,
.moment-card.is-active:has(.moment-card__hit:focus-visible) .moment-card__action-label {
  border-color: var(--text);
  background: var(--text);
  color: var(--bg);
}

.moment-card__action-hint {
  font: var(--type-body-s) var(--font-text);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}

/* selected: толстая рамка — отдельным слоем поверх, чтобы не менялась геометрия карточки (иначе содержимое сдвигается) */
.moment-card.is-selected {
  border-color: var(--text);
}

.moment-card.is-selected::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  border: 2px solid var(--text);
  border-radius: inherit;
  pointer-events: none;
}

.moment-card.is-dimmed {
  opacity: 0.38;
  filter: grayscale(0.5);
}

/* узкая карточка (анкета, до ~240dp): шрифты и поля на ступень меньше */
@container (max-width: 240px) {
  .moment-card__title {
    font: 400 var(--type-title-m) var(--font-serif);
  }

  .moment-card__hover-label,
  .moment-card__action-label {
    min-height: var(--control-h-sm);
    padding: 0 var(--space-3);
    font: 400 var(--type-label-l) var(--font-serif);
  }
}

@keyframes action-in {
  from { opacity: 0; transform: scale(0.96); }
}
</style>
