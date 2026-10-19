<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useHead} from '@unhead/vue'
import {api, ApiError, type Stats} from '@/api'
import AppLoader from '@/components/AppLoader.vue'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {mediaUrl} from '@/utils/media.ts'

// Статистика голосов — только в dev-режиме бэкенда (auth.devLogin). В проде эндпоинта нет (404).
useHead({title: 'Статистика голосов (dev) — PRIME 2026'})

const stats = ref<Stats | null>(null)
const error = ref<string | null>(null)
const filter = ref('')

async function load() {
  error.value = null
  try {
    stats.value = await api.devStats()
  } catch (e) {
    error.value = e instanceof ApiError && e.status === 404
        ? 'Статистика доступна только в режиме разработки (auth.devLogin на бэкенде).'
        : 'Не удалось загрузить статистику.'
  }
}

function visible(name: string) {
  return !filter.value || name.toLowerCase().includes(filter.value.toLowerCase())
}

onMounted(load)
</script>

<template>
  <main class="stats page-container">
    <header class="stats__head">
      <h1 class="display stats__title">Статистика <small>dev</small></h1>
      <PrimeButton size="sm" @click="load">Обновить</PrimeButton>
    </header>

    <p v-if="error" class="stats__error" role="alert">{{ error }}</p>
    <div v-else-if="!stats" class="stats__loading"><AppLoader/></div>

    <template v-else>
      <dl class="stats__totals" data-testid="stats-total">
        <div><dt>Пользователей</dt><dd>{{ stats.users }}</dd></div>
        <div><dt>Проголосовали</dt><dd>{{ stats.voters }}</dd></div>
        <div><dt>Голосов</dt><dd>{{ stats.votes }}</dd></div>
      </dl>

      <label class="stats__filter">
        <span class="visually-hidden">Фильтр номинаций</span>
        <input v-model="filter" type="search" placeholder="Найти номинацию…"/>
      </label>

      <section
          v-for="item in stats.nominations"
          v-show="visible(item.nomination.name)"
          :key="item.nomination.id"
          class="stats__nomination"
      >
        <h2 class="stats__name">
          <span>{{ item.nomination.position }}. {{ item.nomination.name }}</span>
          <small>{{ item.votes }} голосов · явка {{ stats.voters ? Math.round(item.votes / stats.voters * 100) : 0 }}%</small>
        </h2>
        <ol class="stats__rows">
          <li
              v-for="(row, i) in item.nominees"
              :key="row.nominee.id"
              class="stats__row"
              :class="{ 'is-leader': i === 0 && row.votes > 0 }"
              :data-stats-nominee="`${item.nomination.id}-${row.nominee.id}`"
              :data-votes="row.votes"
          >
            <img v-if="row.nominee.photoPath" :src="mediaUrl(row.nominee.photoPath)" alt="" loading="lazy"/>
            <span class="stats__nominee">{{ row.nominee.name }}</span>
            <span class="stats__bar"><span :style="{ width: `${row.percent}%` }"/></span>
            <span class="stats__num">{{ row.votes }} · {{ row.percent }}%</span>
          </li>
        </ol>
      </section>
    </template>
  </main>
</template>

<style scoped>
.stats {
  padding-top: calc(var(--header-h) + var(--space-6));
  padding-bottom: var(--space-16);
}

.stats__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.stats__title {
  font: 400 var(--type-headline-l) var(--font-display);
}

.stats__title small {
  color: var(--muted);
  font: var(--type-label-l) var(--font-text);
  text-transform: none;
}

.stats__error {
  color: var(--danger);
}

.stats__loading {
  display: grid;
  place-items: center;
  min-height: 40vh;
}

.stats__totals {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  margin: var(--space-6) 0;
}

.stats__totals div {
  padding: var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--shape-md);
  background: var(--surface);
}

.stats__totals dt {
  color: var(--muted-2);
  font: var(--type-label-l) var(--font-text);
}

.stats__totals dd {
  margin: var(--space-1) 0 0;
  font: 400 var(--type-headline-m) var(--font-display);
  font-variant-numeric: tabular-nums;
}

/* текстовое поле M3 (outlined): 56dp, скругление 4dp */
.stats__filter input {
  width: min(var(--field-max-w), 100%);
  min-height: var(--control-h-lg);
  padding: 0 var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--shape-xs);
  background: transparent;
  color: var(--text);
  font: var(--type-body-l) var(--font-text);
}

.stats__filter input:focus {
  outline: 2px solid var(--text);
  outline-offset: -1px;
}

.stats__nomination {
  margin-top: var(--space-8);
}

.stats__name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
  margin: 0 0 var(--space-2);
  font: 400 var(--type-title-l) var(--font-display);
}

.stats__name small {
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-text);
}

.stats__rows {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* строка списка M3: 48dp, аватар 32dp */
.stats__row {
  display: grid;
  grid-template-columns: var(--avatar-sm) minmax(0, 12rem) minmax(0, 1fr) 7rem;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--touch-target);
  font: var(--type-body-m) var(--font-text);
}

.stats__row img {
  width: var(--avatar-sm);
  height: var(--avatar-sm);
  border-radius: var(--shape-full);
  object-fit: cover;
  object-position: top;
}

.stats__nominee {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats__bar {
  height: var(--space-2);
  overflow: hidden;
  border-radius: var(--shape-full);
  background: var(--surface-3);
}

.stats__bar span {
  display: block;
  height: 100%;
  background: var(--muted);
}

.stats__row.is-leader .stats__bar span {
  background: var(--text);
}

.stats__num {
  color: var(--muted-2);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

@media (max-width: 599px) {
  .stats__row {
    grid-template-columns: var(--avatar-sm) minmax(0, 1fr) 6rem;
    padding-block: var(--space-1);
  }

  .stats__bar {
    grid-column: 2 / -1;
  }

  .stats__totals dd {
    font: 400 var(--type-headline-s) var(--font-display);
  }
}
</style>
