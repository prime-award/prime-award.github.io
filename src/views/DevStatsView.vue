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
  padding-top: calc(var(--header-h) + 24px);
  padding-bottom: 64px;
}

.stats__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.stats__title {
  font-size: clamp(30px, 3vw, 52px);
}

.stats__title small {
  color: var(--muted);
  font-size: 0.45em;
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
  gap: 12px;
  margin: 24px 0;
}

.stats__totals div {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
}

.stats__totals dt {
  color: var(--muted-2);
  font-size: 14px;
}

.stats__totals dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: clamp(26px, 2.6vw, 40px);
  font-variant-numeric: tabular-nums;
}

.stats__filter input {
  width: min(420px, 100%);
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
}

.stats__nomination {
  margin-top: 28px;
}

.stats__name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(20px, 1.8vw, 30px);
}

.stats__name small {
  color: var(--muted-2);
  font-family: var(--font-text);
  font-size: 14px;
}

.stats__rows {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stats__row {
  display: grid;
  grid-template-columns: 32px minmax(110px, 220px) minmax(0, 1fr) 110px;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.stats__row img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  object-position: top;
}

.stats__nominee {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats__bar {
  height: 10px;
  overflow: hidden;
  border-radius: 5px;
  background: var(--surface-2);
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

@media (max-width: 560px) {
  .stats__row {
    grid-template-columns: 28px minmax(0, 1fr) 90px;
  }

  .stats__bar {
    grid-column: 2 / -1;
  }
}
</style>
