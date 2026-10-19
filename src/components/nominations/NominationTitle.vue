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
/* Название (ролевые токены section/page title) + плашка высотой --badge-h + описание (lead). */
.nomination-title__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-4);
}

.nomination-title__name {
  font: 400 var(--type-section-title) var(--font-display);
  color: #fff;
}

.nomination-title--h1 .nomination-title__name {
  font: 400 var(--type-page-title) var(--font-display);
}

/* плашка: высота из токена, ширина — по собственным пропорциям картинки */
.nomination-title__icon {
  width: auto;
  height: var(--badge-h);
}

.nomination-title__description {
  max-width: 72ch;
  margin: var(--space-2) 0 0;
  color: var(--text-muted);
  font: var(--type-body-l) var(--font-serif);
}

.nomination-title--h1 .nomination-title__description {
  color: var(--text);
  font: var(--type-lead) var(--font-serif);
}
</style>
