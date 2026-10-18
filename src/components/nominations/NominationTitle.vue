<script setup lang="ts">
import {computed} from 'vue'
import type {NominationBrief} from '@/api'
import {mediaUrl} from '@/utils/media.ts'

// Название номинации (Foglihten, капс) + плашка-иконка справа + описание.
const props = withDefaults(defineProps<{
  nomination: NominationBrief
  level?: 'h1' | 'h2'
  /** дописать год к названию, как в макете («Король рунета 2026»); к «… года» год не дописывается */
  year?: string
}>(), {level: 'h2'})

const icon = computed(() => mediaUrl(props.nomination.iconPath))
const suffix = computed(() => (props.year && !/года$/i.test(props.nomination.name) ? ` ${props.year}` : ''))
</script>

<template>
  <div class="nomination-title" :class="`nomination-title--${level}`">
    <div class="nomination-title__row">
      <component :is="level" class="display nomination-title__name">
        {{ nomination.name }}{{ suffix }}
      </component>
      <img v-if="icon" class="nomination-title__icon" :src="icon" alt="" loading="lazy" decoding="async"/>
    </div>
    <p class="nomination-title__description">{{ nomination.description }}</p>
  </div>
</template>

<style scoped>
.nomination-title__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px clamp(12px, 1.2vw, 20px);
}

.nomination-title__name {
  font-size: clamp(30px, 4.2vw, 80px);
  color: #fff;
}

.nomination-title--h1 .nomination-title__name {
  font-size: clamp(34px, 5vw, 96px);
}

.nomination-title__icon {
  width: auto;
  height: clamp(40px, 4.4vw, 84px);
  aspect-ratio: 380 / 185;
  object-fit: contain;
}

.nomination-title__description {
  max-width: 70ch;
  margin: clamp(4px, 0.6vw, 10px) 0 0;
  color: rgba(229, 231, 234, 0.7);
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.4vw, 28px);
  line-height: 1.3;
}

.nomination-title--h1 .nomination-title__description {
  color: #fff;
  font-size: clamp(18px, 2.5vw, 48px);
  letter-spacing: -0.025em;
}
</style>
