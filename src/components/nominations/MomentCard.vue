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
/* Из макета (415:367): карточка 405×363, обводка 1px #687789, скругление 20; превью 10px от краёв, высота 228,
   скругление 10, картинка с opacity .7 и градиентом вниз в #08090b; название Palatino 36 (трекинг -3%),
   участники/таймкод — 16px, rgba(229,231,234,.5). */
.moment-card {
  position: relative;
  display: flex;
  flex-direction: column;
  aspect-ratio: 405 / 363;
  overflow: hidden;
  padding: calc(10 / 405 * 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  background: var(--bg);
  isolation: isolate;
  container-type: inline-size;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}

.moment-card__preview {
  position: relative;
  flex: none;
  height: calc(228 / 405 * 100cqi);
  overflow: hidden;
  border-radius: 10px;
  background: var(--bg);
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
  opacity: 0.7;
}

.moment-card__preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(8, 9, 11, 0) 0%, var(--bg) 100%);
}

.moment-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0 calc(11 / 405 * 100cqi) calc(30 / 405 * 100cqi);
  font-family: var(--font-serif);
  text-align: center;
  text-wrap: balance;
  transition: filter 0.3s ease;
}

.moment-card__title {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(15px, 8.9cqi, 36px);
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #fff;
  overflow-wrap: anywhere;
}

.moment-card__participants,
.moment-card__timecode {
  font-family: var(--font-serif);
  font-size: clamp(11px, 4cqi, 16px);
  letter-spacing: -0.03em;
  color: rgba(229, 231, 234, 0.5);
}

.moment-card__participants {
  margin: 0;
  line-height: 1.3;
}

.moment-card__timecode {
  position: absolute;
  bottom: calc(10 / 405 * 100cqi);
  left: 50%;
  z-index: 1;
  translate: -50% 0;
  padding: 3px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
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
  padding: 0.47em 0.94em;
  border: 1px solid rgba(229, 231, 234, 0.25);
  border-radius: 40px;
  background: rgba(23, 26, 31, 0.55);
  backdrop-filter: blur(4px);
  color: #fff;
  font-family: var(--font-serif);
  font-size: clamp(14px, 7.4cqi, 30px);
  line-height: 1.15;
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
  gap: 10px;
  pointer-events: none;
  animation: action-in 0.2s ease both;
}

.moment-card__action-button {
  pointer-events: auto;
  /* двойной тап не должен масштабировать страницу (iOS) */
  touch-action: manipulation;
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
  border: 3px solid var(--text);
}

.moment-card.is-dimmed {
  opacity: 0.4;
  filter: grayscale(0.5);
}

@keyframes action-in {
  from { opacity: 0; transform: scale(0.96); }
}
</style>
