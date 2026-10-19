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
  /** показывать таймкод кнопкой «перемотать» (анкета с плеером) */
  seekable?: boolean
  eager?: boolean
}>(), {state: 'idle'})

const emit = defineEmits<{ select: [], action: [event: MouseEvent | KeyboardEvent], seek: [seconds: number] }>()

const loaded = ref(false)
const preview = computed(() => mediaUrl(props.nominee.photoPath))
const timecode = computed(() =>
    props.nominee.timecodeSeconds == null ? null : formatTimecode(props.nominee.timecodeSeconds),
)
</script>

<template>
  <article class="moment-card" :class="[`is-${state}`, { 'has-hover-label': hoverLabel }]" :data-nominee-id="nominee.id" :data-state="state">
    <div class="moment-card__preview">
      <img
          v-if="preview"
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
        :aria-label="hoverLabel ? `${hoverLabel}: ${nominee.name}` : nominee.name"
        :aria-pressed="state === 'active' || state === 'selected'"
        :disabled="state === 'dimmed'"
        @click="emit('select')"
    >
      <span v-if="hoverLabel" class="moment-card__hover-label" aria-hidden="true">{{ hoverLabel }}</span>
    </button>

    <button
        v-if="timecode && seekable"
        type="button"
        class="moment-card__timecode"
        :aria-label="`Смотреть момент с ${timecode}`"
        @click.stop="emit('seek', nominee.timecodeSeconds!)"
    >
      ▶ {{ timecode }}
    </button>
    <span v-else-if="timecode" class="moment-card__timecode is-static">{{ timecode }}</span>

    <div v-if="state === 'active' && actionLabel" class="moment-card__action">
      <button type="button" class="moment-card__action-button" data-testid="confirm-vote" @click.stop="emit('action', $event)">
        {{ actionLabel }}
      </button>
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
  transition: opacity 0.4s ease, filter 0.3s ease, transform 0.4s ease;
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
  padding: var(--space-3) var(--space-2) var(--space-12);
  text-align: center;
  text-wrap: balance;
  transition: filter 0.3s ease;
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

/* таймкод — небольшая text button внизу карточки (зона нажатия 32dp + отступы карточки) */
.moment-card__timecode {
  position: absolute;
  bottom: var(--space-2);
  left: 50%;
  z-index: 1;
  translate: -50% 0;
  display: inline-flex;
  align-items: center;
  min-height: var(--control-h-sm);
  padding: 0 var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--text-subtle);
  font: var(--type-label-l) var(--font-serif);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.moment-card__timecode:hover {
  color: var(--text);
  border-color: var(--line);
  background: var(--state-hover);
}

.moment-card__timecode.is-static {
  cursor: default;
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
.moment-card__action-button {
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

  .moment-card.is-idle:hover .moment-card__preview img {
    transform: scale(1.03);
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

.moment-card__action-button {
  min-height: var(--touch-target);
  pointer-events: auto;
  /* двойной тап не должен масштабировать страницу (iOS) */
  touch-action: manipulation;
  cursor: pointer;
}

.moment-card__action-button:hover {
  border-color: var(--line-strong);
  background: rgba(40, 45, 53, 0.85);
}

.moment-card__action-hint {
  font: var(--type-body-s) var(--font-text);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}

.moment-card.is-selected {
  border: 3px solid var(--text);
}

.moment-card.is-dimmed {
  opacity: 0.38;
  filter: grayscale(0.5);
}

@keyframes action-in {
  from { opacity: 0; transform: scale(0.96); }
}
</style>
