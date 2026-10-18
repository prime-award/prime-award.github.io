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
      <UserAvatar :user="user" :size="88"/>
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
  padding-top: calc(var(--header-h) + clamp(16px, 2vw, 32px));
  padding-bottom: 64px;
}

.profile__user {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas:
      'avatar who actions'
      'progress progress progress';
  align-items: center;
  gap: 16px 24px;
  margin-bottom: clamp(32px, 3vw, 56px);
  padding: clamp(18px, 2vw, 28px);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: radial-gradient(120% 140% at 0% 0%, #161a21 0%, var(--surface) 55%);
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
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(28px, 3vw, 52px);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile__platform {
  margin: 4px 0 0;
  color: var(--muted-2);
}

.profile__actions {
  grid-area: actions;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.profile__progress {
  grid-area: progress;
}

.profile__progress-text {
  margin-bottom: 8px;
  color: var(--muted-2);
}

.profile__progress-text b {
  color: var(--text);
}

.profile__bar {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--surface-2);
}

.profile__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8a96a5, var(--text));
  transition: width 0.4s ease;
}

.profile__done {
  margin: 0 0 32px;
  padding: 14px 18px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: var(--surface);
}

.profile__error {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--danger);
}

.profile__loading {
  display: grid;
  place-items: center;
  min-height: 40vh;
}

@media (max-width: 760px) {
  .profile__user {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
        'avatar who'
        'progress progress'
        'actions actions';
  }

  .profile__actions {
    justify-content: stretch;
  }

  .profile__actions > * {
    flex: 1;
  }
}
</style>
