<script setup lang="ts">
import {computed, ref} from 'vue'
import {useHead} from '@unhead/vue'
import {api, type Nomination} from '@/api'
import MainBlock from '@/components/MainBlock.vue'
import SponsorsSection from '@/components/SponsorsSection.vue'
import ContactAs from '@/components/ContactAs.vue'
import VotingInfo from '@/components/home/VotingInfo.vue'
import NominationRow from '@/components/nominations/NominationRow.vue'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {useMyVotes} from '@/composable/useMyVotes.ts'
import {useVoteNavigation} from '@/composable/useVoteNavigation.ts'

useHead({
  title: 'PRIME 2026 - Народная премия ру-стриминга',
  meta: [{
    name: 'description',
    content: 'Главная народная премия ру-стриминга. Голосуйте за лучших стримеров и моменты года с платформ Twitch, Kick и VK Live.',
  }],
  link: [{rel: 'canonical', href: 'https://prime-award.ru/'}],
})

// номинации подгружаются порциями: сначала 3, «Показать ещё» добавляет по 3 снизу
const CHUNK = 3

const {openNextBallot, openBallot} = useVoteNavigation()
const {votedNomineeId, load: loadVotes} = useMyVotes()

// строки показываем, когда известны голоса пользователя: иначе выбранный номинант на глазах «перескакивает» в начало ленты
const votesReady = ref(false)

const items = ref<Nomination[]>([])
const total = ref<number | null>(null)
const loadedPages = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const hasMore = computed(() => total.value === null || items.value.length < total.value)

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  error.value = null
  try {
    const page = await api.nominationsPage(loadedPages.value + 1, CHUNK)
    // защита от дублей, если каталог поменялся между запросами
    const known = new Set(items.value.map((n) => n.id))
    items.value = [...items.value, ...page.items.filter((n) => !known.has(n.id))]
    total.value = page.totalItems
    loadedPages.value = page.page
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить номинации'
  } finally {
    loading.value = false
  }
}

loadMore()
loadVotes().finally(() => (votesReady.value = true))
</script>

<template>
  <main class="home">
    <MainBlock :title-lines="['Кто станет', 'королём рунета 2026?']">
      <template #actions>
        <PrimeButton variant="light" size="lg" data-testid="vote-cta" @click="openNextBallot">Проголосовать
        </PrimeButton>
      </template>
    </MainBlock>

    <section class="home__partners">
      <SponsorsSection/>
    </section>

    <VotingInfo/>

    <div class="home__list page-container" id="nominations" :aria-busy="loading">
      <h2 class="display home__list-title">Номинации</h2>

      <div v-if="items.length || loading" class="home__rows">
        <template v-if="votesReady">
          <NominationRow
              v-for="nomination in items"
              :key="nomination.id"
              :nomination="nomination"
              :voted-nominee-id="votedNomineeId(nomination.id)"
              @choose="(nomineeId) => openBallot(nomination.id, nomineeId)"
          />
        </template>

        <div v-if="(!items.length && loading) || !votesReady" class="home__skeleton" aria-hidden="true">
          <div v-for="i in 2" :key="i" class="home__skeleton-row"/>
        </div>
      </div>

      <p v-if="error" class="home__error">
        {{ error }}
        <PrimeButton size="sm" @click="loadMore">Повторить</PrimeButton>
      </p>

      <div v-else-if="items.length && hasMore" class="home__more">
        <PrimeButton :disabled="loading" data-testid="show-more" @click="loadMore">
          {{ loading ? 'Загружаем…' : 'Показать ещё' }}
        </PrimeButton>
      </div>
    </div>

    <ContactAs/>
  </main>
</template>

<style scoped>
.home__partners {
  padding-top: var(--space-10);
}


.home__list {
  display: grid;
  gap: var(--space-4);
  padding-block: var(--space-6) var(--space-2);
  scroll-margin-top: calc(var(--header-h) + var(--space-2));
}

/* заголовок раздела — на ступень крупнее названий номинаций */
.home__list-title {
  font: 400 var(--type-page-title) var(--font-display);
  text-align: center;
}

/* строки номинаций: свой зазор между собой, независимый от отступов заголовка и кнопки */
.home__rows {
  display: grid;
  gap: var(--space-8);
}

.home__more {
  display: flex;
  justify-content: center;
}

.home__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: var(--danger);
}

.home__skeleton {
  display: grid;
  gap: var(--space-12);
}

/* заглушка строки номинаций, пока не пришли данные */
.home__skeleton-row {
  aspect-ratio: 3 / 1;
  border-radius: var(--shape-lg);
  background: linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 50%, var(--surface) 100%) 0 0 / 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

@media (max-width: 599px) {
  .home__tagline {
    font: 400 var(--type-label-l) var(--font-serif);
    letter-spacing: 0.16em;
  }
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
