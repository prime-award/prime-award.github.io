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
.moment-card {
  position: relative;
  display: flex;
  flex-direction: column;
  aspect-ratio: 405 / 363;
  overflow: hidden;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--surface);
  isolation: isolate;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}

.moment-card__preview {
  position: relative;
  flex: none;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #1b2028, #0b0d10);
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
  opacity: 1;
}

.moment-card__preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--surface) 0%, transparent 45%);
}

.moment-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 6px 30px;
  text-align: center;
  transition: filter 0.3s ease;
}

.moment-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(17px, 1.35vw, 26px);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.moment-card__participants {
  margin: 0;
  color: var(--muted-2);
  font-size: 12px;
  line-height: 1.3;
}

.moment-card__timecode {
  position: absolute;
  bottom: 10px;
  left: 50%;
  z-index: 1;
  translate: -50% 0;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.moment-card__timecode:hover {
  color: var(--text);
  border-color: var(--line);
}

.moment-card__timecode.is-static {
  cursor: default;
  pointer-events: none;
}

.moment-card__badge {
  position: absolute;
  top: 18px;
  left: 50%;
  z-index: 1;
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
  padding: 12px 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: linear-gradient(180deg, rgba(40, 45, 53, 0.85) 0%, rgba(14, 16, 20, 0.85) 100%);
  backdrop-filter: blur(6px);
  font-family: var(--font-display);
  font-size: clamp(16px, 1.15vw, 22px);
  line-height: 1;
  white-space: nowrap;
}

.moment-card__hover-label {
  margin-bottom: 18%;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

@media (hover: hover) {
  .moment-card.is-idle:hover {
    border-color: var(--line-strong);
    box-shadow: 0 0 22px rgba(229, 231, 234, 0.12);
  }

  .moment-card.is-idle:hover .moment-card__preview img {
    transform: scale(1.04);
  }

  .moment-card.has-hover-label.is-idle:hover .moment-card__hover-label {
    opacity: 1;
    transform: none;
  }
}

.moment-card.is-active {
  border-color: var(--line-strong);
}

.moment-card.is-active .moment-card__preview img,
.moment-card.is-active .moment-card__body {
  filter: blur(5px) brightness(0.6);
}

.moment-card__action {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  pointer-events: none;
  animation: action-in 0.2s ease both;
}

.moment-card__action-button {
  pointer-events: auto;
  /* двойной тап не должен масштабировать страницу (iOS) */
  touch-action: manipulation;
  color: var(--text);
  cursor: pointer;
}

.moment-card__action-button:hover {
  border-color: var(--line-strong);
  box-shadow: 0 0 18px rgba(229, 231, 234, 0.2);
}

.moment-card__action-hint {
  font-size: 13px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}

.moment-card.is-selected {
  border: 2px solid var(--text);
  box-shadow: 0 0 26px rgba(229, 231, 234, 0.25);
}

.moment-card.is-dimmed {
  opacity: 0.4;
  filter: grayscale(0.5);
}

@keyframes action-in {
  from { opacity: 0; transform: scale(0.96); }
}
</style>
