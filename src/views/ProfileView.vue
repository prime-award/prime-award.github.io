<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {useHead} from '@unhead/vue'
import {api, type MyNominations} from '@/api'
import AppLoader from '@/components/AppLoader.vue'
import UserAvatar from '@/components/auth/UserAvatar.vue'
import ProfileSection from '@/components/profile/ProfileSection.vue'
import UnvotedCard from '@/components/profile/UnvotedCard.vue'
import VotedCard from '@/components/profile/VotedCard.vue'
import ShareModal from '@/components/share/ShareModal.vue'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {useAuth} from '@/composable/useAuth.ts'
import {useMyVotes} from '@/composable/useMyVotes.ts'
import {useVoteNavigation} from '@/composable/useVoteNavigation.ts'

useHead({title: 'Профиль — PRIME 2026'})

const PLATFORM_TITLE: Record<string, string> = {TWITCH: 'Twitch', KICK: 'Kick', VK: 'VK Video Live', DEV: 'тестовый аккаунт'}

const route = useRoute()
const {user} = useAuth()
const {record} = useMyVotes()
const {openNextBallot} = useVoteNavigation()

const data = ref<MyNominations | null>(null)
const error = ref<string | null>(null)
const shareOpen = ref(false)

const votedCount = computed(() => data.value?.voted.length ?? 0)
const total = computed(() => data.value?.totalNominations ?? 0)
const percent = computed(() => (total.value ? Math.round((votedCount.value / total.value) * 100) : 0))
const allDone = computed(() => !!data.value && data.value.unvoted.length === 0)

async function load() {
  error.value = null
  try {
    data.value = await api.myNominations()
    // заодно освежаем общий кэш голосов (главная, анкета)
    data.value.voted.forEach((v) => record({nominationId: v.nomination.id, nomineeId: v.nominee.id}))
  } catch {
    error.value = 'Не удалось загрузить профиль.'
  }
}

onMounted(load)
</script>

<template>
  <main class="profile page-container">
    <section v-if="user" class="profile__user">
      <UserAvatar :user="user" :size="64"/>
      <div class="profile__who">
        <h1 class="profile__name" :style="{ color: user.nameColor ?? undefined }">{{ user.displayName }}</h1>
        <p class="profile__platform">@{{ user.login }} · {{ PLATFORM_TITLE[user.platform] ?? user.platform }}</p>
      </div>

      <div v-if="data" class="profile__progress" data-testid="progress">
        <div class="profile__progress-text">Проголосовано <b>{{ votedCount }}</b> из {{ total }}</div>
        <div class="profile__bar" role="progressbar" :aria-valuenow="votedCount" aria-valuemin="0" :aria-valuemax="total">
          <span :style="{ width: `${percent}%` }"/>
        </div>
      </div>

      <div v-if="data" class="profile__actions">
        <PrimeButton v-if="!allDone" variant="light" @click="openNextBallot">Продолжить голосование</PrimeButton>
        <PrimeButton v-if="votedCount > 0" data-testid="share" @click="shareOpen = true">Поделиться</PrimeButton>
      </div>
    </section>

    <p v-if="route.query.done && allDone" class="profile__done" role="status">
      Вы проголосовали во всех номинациях — спасибо! Поделитесь своим выбором.
    </p>

    <div v-if="error" class="profile__error" role="alert">
      {{ error }} <PrimeButton size="sm" @click="load">Повторить</PrimeButton>
    </div>

    <div v-else-if="!data" class="profile__loading"><AppLoader/></div>

    <template v-else>
      <ProfileSection
          title="Ждут вашего голоса:"
          :items="data.unvoted"
          :item-key="(n) => n.id"
          empty-text="Вы проголосовали во всех номинациях."
          test-id="unvoted-section"
      >
        <template #default="{ item }">
          <UnvotedCard :nomination="item"/>
        </template>
      </ProfileSection>

      <ProfileSection
          title="Ваш выбор:"
          :items="data.voted"
          :item-key="(v) => v.nomination.id"
          empty-text="Здесь появятся номинанты, за которых вы проголосуете."
          test-id="voted-section"
      >
        <template #default="{ item }">
          <VotedCard :item="item"/>
        </template>
      </ProfileSection>
    </template>

    <ShareModal
        v-if="user && data"
        :open="shareOpen"
        :user="user"
        :voted="data.voted"
        :total="total"
        @close="shareOpen = false"
    />
  </main>
</template>

<style scoped>
.profile {
  min-height: 100dvh;
  padding-top: calc(var(--header-h) + var(--space-6));
  padding-bottom: var(--space-16);
}

/* карточка пользователя (M3 card): поля 24dp, скругление 16dp */
.profile__user {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
      'avatar who'
      'progress progress'
      'actions actions';
  align-items: center;
  gap: var(--space-4) var(--space-6);
  margin-bottom: var(--space-12);
  padding: var(--space-6);
  border: 1px solid var(--line);
  border-radius: var(--shape-lg);
  background: var(--surface);
}

.profile__user > :first-child {
  grid-area: avatar;
}

.profile__who {
  grid-area: who;
  min-width: 0;
}

.profile__name {
  margin: 0;
  overflow: hidden;
  font: 400 var(--type-headline-m) var(--font-display);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile__platform {
  margin: var(--space-1) 0 0;
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-text);
}

.profile__actions {
  grid-area: actions;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.profile__actions > * {
  flex: 1;
}

.profile__progress {
  grid-area: progress;
}

.profile__progress-text {
  margin-bottom: var(--space-2);
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-text);
}

.profile__progress-text b {
  color: var(--text);
}

/* linear progress M3: 4dp */
.profile__bar {
  height: var(--space-1);
  overflow: hidden;
  border-radius: var(--shape-full);
  background: var(--surface-3);
}

.profile__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--text);
  transition: width 0.4s ease;
}

.profile__done {
  margin: 0 0 var(--space-8);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--shape-md);
  background: var(--surface);
  font: var(--type-body-m) var(--font-text);
}

.profile__error {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--danger);
}

.profile__loading {
  display: grid;
  place-items: center;
  min-height: 40vh;
}

/* medium+: кнопки справа от имени */
@media (min-width: 840px) {
  .profile__user {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
        'avatar who actions'
        'progress progress progress';
  }

  .profile__actions > * {
    flex: none;
  }

  .profile__name {
    font: 400 var(--type-display-s) var(--font-display);
  }
}
</style>
