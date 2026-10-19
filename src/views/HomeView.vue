<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useHead} from '@unhead/vue'
import {api, type Page, type Nomination} from '@/api'
import MainBlock from '@/components/MainBlock.vue'
import SponsorsSection from '@/components/SponsorsSection.vue'
import ContactAs from '@/components/ContactAs.vue'
import VotingInfo from '@/components/home/VotingInfo.vue'
import NominationRow from '@/components/nominations/NominationRow.vue'
import PageNav from '@/components/ui/PageNav.vue'
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

const PAGE_SIZE = 4

const route = useRoute()
const router = useRouter()
const {openNextBallot, openBallot} = useVoteNavigation()
const {votedNomineeId, load: loadVotes} = useMyVotes()

const page = computed(() => {
  const n = Number(route.query.page)
  return Number.isInteger(n) && n >= 1 ? n : 1
})

const data = ref<Page<Nomination> | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const listTop = ref<HTMLElement | null>(null)
let requestId = 0

async function load() {
  const id = ++requestId
  loading.value = true
  error.value = null
  try {
    const result = await api.nominationsPage(page.value, PAGE_SIZE)
    if (id === requestId) data.value = result
  } catch (e) {
    if (id === requestId) error.value = e instanceof Error ? e.message : 'Не удалось загрузить номинации'
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(page, load, {immediate: true})
loadVotes()

function changePage(next: number) {
  router.push({query: {...route.query, page: next === 1 ? undefined : String(next)}})
  listTop.value?.scrollIntoView({behavior: 'smooth', block: 'start'})
}
</script>

<template>
  <main class="home">
    <MainBlock :title-lines="['Кто станет', 'королём рунета 2026?']">
      <template #actions>
        <PrimeButton variant="light" size="lg" data-testid="vote-cta" @click="openNextBallot">Проголосовать</PrimeButton>
      </template>
    </MainBlock>

    <section class="home__intro page-container">
      <h2 class="display home__intro-title">Главная народная премия ру-&nbsp;стриминга</h2>
    </section>

    <SponsorsSection/>

    <VotingInfo/>

    <div ref="listTop" class="home__list-anchor" id="nominations"/>

    <div class="home__list page-container" :class="{ 'is-loading': loading && data }" :aria-busy="loading">
      <p v-if="error" class="home__error">
        {{ error }}
        <PrimeButton size="sm" @click="load">Повторить</PrimeButton>
      </p>

      <template v-else-if="data">
        <NominationRow
            v-for="nomination in data.items"
            :key="nomination.id"
            :nomination="nomination"
            :voted-nominee-id="votedNomineeId(nomination.id)"
            @choose="(nomineeId) => openBallot(nomination.id, nomineeId)"
        />
      </template>

      <div v-else class="home__skeleton" aria-hidden="true">
        <div v-for="i in 2" :key="i" class="home__skeleton-row"/>
      </div>
    </div>

    <PageNav
        v-if="data"
        class="home__pages"
        :page="page"
        :total="data.totalPages"
        label="Страницы номинаций"
        @change="changePage"
    />

    <ContactAs/>
  </main>
</template>

<style scoped>
.home__intro {
  padding-block: var(--space-6) var(--space-8);
  text-align: center;
}

.home__intro-title {
  font: 400 var(--type-display-s) var(--font-display);
}

.home__list-anchor {
  scroll-margin-top: calc(var(--header-h) + var(--space-2));
}

.home__list {
  display: grid;
  gap: var(--section-gap);
  padding-block: var(--space-8) var(--space-10);
  transition: opacity 0.2s ease;
}

.home__list.is-loading {
  opacity: 0.5;
}

.home__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  color: var(--danger);
}

.home__skeleton {
  display: grid;
  gap: var(--space-12);
}

/* заглушка строки номинаций: высота карточки 3:4 при 4 колонках */
.home__skeleton-row {
  aspect-ratio: 3 / 1;
  border-radius: var(--shape-lg);
  background: linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 50%, var(--surface) 100%) 0 0 / 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

.home__pages {
  padding-bottom: var(--space-12);
}

@media (min-width: 840px) {
  .home__intro {
    padding-block: var(--space-8) var(--space-10);
  }

  .home__intro-title {
    font: 400 var(--type-display-m) var(--font-display);
  }
}

@media (min-width: 1200px) {
  .home__intro-title {
    font: 400 var(--type-display-l) var(--font-display);
  }
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}
</style>
