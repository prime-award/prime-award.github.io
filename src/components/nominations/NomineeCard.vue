<script setup lang="ts">
import NomineePortrait from './NomineePortrait.vue'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {computed} from 'vue'
import {channelPlatform} from '@/utils/platforms'
import {formatTimecode, type NomineeCardProps} from './cardState.ts'

const props = withDefaults(defineProps<NomineeCardProps>(), {state: 'idle'})

const emit = defineEmits<{ select: [], seek: [seconds: number] }>()

const channel = computed(() => channelPlatform(props.nominee.link))
</script>

<template>
  <article
      class="nominee-card"
      :class="[`is-${state}`, { 'has-hover-label': hoverLabel, 'nominee-card--plain': $slots.content }]"
      :data-nominee-id="nominee.id"
      :data-state="state"
  >
    <div class="nominee-card__content">
      <slot v-if="$slots.content" name="content"/>
      <template v-else>
        <NomineePortrait :name="nominee.name" :photo-path="nominee.photoPath" :eager="eager"
                         :participants="nominee.participants">
          <template v-if="$slots.media" #default><slot name="media"/></template>
        </NomineePortrait>

        <a v-if="channel && nominee.type !== 'PAIR'" class="nominee-card__channel" :href="channel.href"
           :inert="state === 'active'" target="_blank" rel="noopener noreferrer"
           :aria-label="`Открыть канал ${nominee.name} на ${channel.name} в новой вкладке`">
          <svg v-if="channel.mark" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path :d="channel.mark" fill-rule="evenodd"/>
          </svg>
          <span v-else>{{ channel.name }}</span>
          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M9 2h5v5M14 2 7 9M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"/>
          </svg>
        </a>
      </template>
    </div>

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
  <PrimeButton v-if="timing != null" class="nominee-card__timing" size="sm" variant="ghost"
               :aria-label="`Смотреть момент с ${formatTimecode(timing)}`" @click="emit('seek', timing)">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5 10 6l-7 4.5z"/>
    </svg>
    <span>{{ formatTimecode(timing) }}</span>
  </PrimeButton>
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
  min-height: min-content;
  aspect-ratio: 3 / 4;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.nominee-card__timing {
  display: flex;
  width: fit-content;
  margin: var(--space-1) auto 0;
  font-variant-numeric: tabular-nums;
}

.nominee-card__content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.nominee-card--plain {
  height: 100%;
  min-height: 7.5rem;
  aspect-ratio: auto;
}

.nominee-card--plain .nominee-card__content {
  justify-content: center;
  padding: var(--space-5) var(--space-3);
}

.nominee-card--plain:has(.nominee-card__badge) .nominee-card__content {
  padding-top: var(--space-12);
}

.nominee-card.is-active .nominee-card__content {
  filter: blur(5px);
}

.nominee-card__channel {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  justify-content: center;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-height: var(--control-h-sm);
  max-width: 100%;
  padding-inline: var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--shape-full);
  color: var(--text);
  background: var(--bg);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.nominee-card__channel:hover,
.nominee-card__channel:focus-visible {
  background: var(--text);
  color: var(--bg);
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
  max-width: 100%;
  text-align: center;
  overflow-wrap: anywhere;
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

  .nominee-card.has-hover-label.is-idle:has(.nominee-card__hit:hover) .nominee-card__hover-label {
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
.nominee-card.is-active:has(.nominee-card__hit:hover) .nominee-card__action-label,
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
  .nominee-card__content:has(.nominee-card__channel) + .nominee-card__badge {
    left: var(--space-2);
    translate: none;
    padding-inline: var(--space-2);
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
