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
}

.nomination-title--h1 .nomination-title__name {
  font-size: clamp(34px, 4.6vw, 88px);
}

.nomination-title__icon {
  width: auto;
  height: clamp(40px, 4.2vw, 80px);
  aspect-ratio: 380 / 185;
  object-fit: contain;
}

.nomination-title__description {
  max-width: 70ch;
  margin: clamp(6px, 0.8vw, 12px) 0 0;
  color: var(--muted-2);
  font-size: clamp(15px, 1.15vw, 20px);
  line-height: 1.4;
}

.nomination-title--h1 .nomination-title__description {
  color: var(--text);
  font-size: clamp(16px, 1.5vw, 28px);
}
</style>
