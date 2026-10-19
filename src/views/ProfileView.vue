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
import primeLogo from '@/assets/prime-logo-2026.webp'

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
    <div class="profile__layout">
      <aside v-if="user" class="profile__side">
        <!-- визитка участника: квадрат, ник — шрифтом названий номинаций -->
        <section class="profile-card" aria-label="Профиль участника" data-testid="profile-card">
          <header class="profile-card__top">
            <img class="profile-card__mark" :src="primeLogo" alt="PRIME 2026"/>
            <span class="profile-card__platform">{{ PLATFORM_TITLE[user.platform] ?? user.platform }}</span>
          </header>

          <div class="profile-card__who">
            <UserAvatar class="profile-card__avatar" :user="user" :size="88"/>
            <h1 class="profile-card__name">{{ user.displayName }}</h1>
            <span class="profile-card__accent" :style="{ background: user.nameColor ?? 'var(--border)' }" aria-hidden="true"/>
            <p class="profile-card__login">@{{ user.login }}</p>
          </div>

          <footer v-if="data" class="profile-card__progress" data-testid="progress">
            <div class="profile-card__progress-row">
              <span>Голоса</span>
              <span class="profile-card__count"><b>{{ votedCount }}</b> / {{ total }}</span>
            </div>
            <div class="profile-card__bar" role="progressbar" :aria-valuenow="votedCount" aria-valuemin="0" :aria-valuemax="total">
              <span :style="{ width: `${percent}%` }"/>
            </div>
          </footer>
        </section>

        <div v-if="data" class="profile__actions">
          <PrimeButton v-if="!allDone" variant="light" @click="openNextBallot">Продолжить голосование</PrimeButton>
          <PrimeButton v-if="votedCount > 0" data-testid="share" @click="shareOpen = true">Поделиться</PrimeButton>
        </div>
      </aside>

      <div class="profile__content">
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
      </div>
    </div>

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

/* compact–expanded: визитка сверху по центру; large+: слева, номинации справа */
.profile__layout {
  display: grid;
  gap: var(--space-12);
}

.profile__side {
  display: grid;
  gap: var(--space-4);
  justify-self: center;
  width: min(100%, 360px);
}

.profile__content {
  min-width: 0;
}

@media (min-width: 1200px) {
  .profile__layout {
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: start;
    gap: var(--space-12);
  }

  .profile__side {
    position: sticky;
    top: calc(var(--header-h) + var(--space-6));
    width: 100%;
  }
}

/* ---- визитка: квадрат, рамка и внутренняя линия, всё по центру ---- */
.profile-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aspect-ratio: 1;
  padding: var(--space-5);
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background:
      radial-gradient(90% 70% at 50% 0%, rgba(104, 119, 137, 0.22) 0%, transparent 70%),
      linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%);
  box-shadow: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.profile-card::before {
  content: '';
  position: absolute;
  inset: var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--shape-md);
  pointer-events: none;
}

.profile-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-card__mark {
  width: auto;
  height: var(--space-5);
  opacity: 0.85;
}

.profile-card__platform {
  color: var(--muted-2);
  font: 500 var(--type-label-s) var(--font-text);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.profile-card__who {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.profile-card__avatar {
  box-shadow: 0 0 0 1px var(--line-strong), 0 0 0 4px var(--bg), 0 0 0 5px var(--line);
}

/* ник — шрифтом названий номинаций (Foglihten, капс) */
.profile-card__name {
  max-width: 100%;
  margin: var(--space-2) 0 0;
  overflow: hidden;
  font: 400 var(--type-headline-m) var(--font-display);
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* цвет ника с платформы — тонкой линией, а не цветом текста */
.profile-card__accent {
  width: var(--space-8);
  height: 2px;
  border-radius: var(--shape-full);
}

.profile-card__login {
  margin: 0;
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-serif);
}

.profile-card__progress {
  display: grid;
  gap: var(--space-2);
  text-align: left;
}

.profile-card__progress-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  color: var(--muted-2);
  font: 500 var(--type-label-s) var(--font-text);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.profile-card__count {
  color: var(--text-muted);
  font: 400 var(--type-title-m) var(--font-serif);
  letter-spacing: 0;
  text-transform: none;
}

.profile-card__count b {
  color: var(--text);
  font-weight: 400;
}

/* linear progress M3: 4dp */
.profile-card__bar {
  height: var(--space-1);
  overflow: hidden;
  border-radius: var(--shape-full);
  background: var(--surface-3);
}

.profile-card__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--text);
  transition: width 0.4s ease;
}

.profile__actions {
  display: grid;
  gap: var(--space-2);
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
</style>
