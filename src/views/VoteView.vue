<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useHead} from '@unhead/vue'
import {api, ApiError, type Nomination, type Nominee, type Vote} from '@/api'
import AppLoader from '@/components/AppLoader.vue'
import MomentCard from '@/components/nominations/MomentCard.vue'
import NominationTitle from '@/components/nominations/NominationTitle.vue'
import NomineeCard from '@/components/nominations/NomineeCard.vue'
import type {CardState} from '@/components/nominations/cardState.ts'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import NominationPlayer from '@/components/vote/NominationPlayer.vue'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {useCatalog} from '@/composable/useCatalog.ts'
import {useDoubleConfirm} from '@/composable/useDoubleConfirm.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import {useMyVotes} from '@/composable/useMyVotes.ts'

/*
 * Анкета номинации:
 * клик по карточке -> active (фото размыто, «Подтвердить голос») -> двойное нажатие -> POST /votes ->
 * статус «Выбрано» минимум STATUS_MS и пока не загрузится следующая -> следующая непроголосованная справа.
 */
const STATUS_MS = 1200

const route = useRoute()
const router = useRouter()
const {getNomination, loadSummary, summary, remember} = useCatalog()
const {votedNomineeId, votedCount, totalNominations, load: loadVotes, record} = useMyVotes()
const {config, load: loadConfig} = useAppConfig()
const loginModal = useLoginModal()
const confirm = useDoubleConfirm(500)

const nominationId = computed(() => Number(route.params.id))
const nomination = ref<Nomination | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)

const activeId = ref<number | null>(null)
const submitting = ref(false)
const showChosen = ref(false)
const skipping = ref(false)
const notice = ref<{ kind: 'error' | 'info', text: string } | null>(null)
const player = ref<InstanceType<typeof NominationPlayer> | null>(null)
const playerOverride = ref<string | null>(null)

useHead({title: computed(() => (nomination.value ? `${nomination.value.name} — анкета PRIME 2026` : 'Анкета — PRIME 2026'))})

const voted = computed(() => (nomination.value ? votedNomineeId(nomination.value.id) : null))
const votingOpen = computed(() => config.value?.votingOpen ?? true)
const readOnly = computed(() => voted.value !== null || !votingOpen.value)
const isMoment = computed(() => nomination.value?.type === 'MOMENT')
const showPlayer = computed(() => isMoment.value || !!nomination.value?.videoUrl)
const playerUrl = computed(() => playerOverride.value ?? nomination.value?.videoUrl ?? null)

// место в общем списке номинаций: счётчик и стрелки
const index = computed(() => summary.value?.findIndex((n) => n.id === nominationId.value) ?? -1)
const prevId = computed(() => (index.value > 0 ? summary.value![index.value - 1].id : null))
const nextId = computed(() => (summary.value && index.value >= 0 && index.value < summary.value.length - 1 ? summary.value[index.value + 1].id : null))

async function load() {
  const target = nominationId.value
  loading.value = !nomination.value || nomination.value.id !== target
  loadError.value = null
  activeId.value = null
  showChosen.value = false
  notice.value = null
  playerOverride.value = null
  confirm.reset()
  try {
    const [data] = await Promise.all([getNomination(target), loadVotes(), loadSummary(), loadConfig()])
    if (target !== nominationId.value) return
    nomination.value = data

    // «Выбрать» на главной: сразу подсвечиваем выбранного номинанта
    const preselected = Number(route.query.nominee)
    if (!readOnly.value && data.nominees.some((n) => n.id === preselected)) activeId.value = preselected

    // соседние анкеты — заранее, чтобы переход был мгновенным
    if (prevId.value) getNomination(prevId.value).catch(() => {})
    if (nextId.value) getNomination(nextId.value).catch(() => {})
  } catch (e) {
    if (target !== nominationId.value) return
    nomination.value = null
    loadError.value = e instanceof ApiError && e.status === 404 ? 'Такой номинации нет.' : 'Не удалось загрузить анкету.'
  } finally {
    if (target === nominationId.value) loading.value = false
  }
}

watch(nominationId, load, {immediate: true})

function stateOf(nomineeId: number): CardState {
  if (voted.value !== null) return voted.value === nomineeId ? 'selected' : 'dimmed'
  if (!votingOpen.value) return 'dimmed'
  return activeId.value === nomineeId ? 'active' : 'idle'
}

function select(nominee: Nominee) {
  if (isMoment.value) playMoment(nominee)
  if (readOnly.value || submitting.value) return
  activeId.value = activeId.value === nominee.id ? null : nominee.id
  confirm.reset()
  notice.value = null
}

function playMoment(nominee: Nominee) {
  if (nominee.videoUrl) {
    playerOverride.value = nominee.videoUrl
  } else if (nominee.timecodeSeconds != null) {
    playerOverride.value = null
    player.value?.seek(nominee.timecodeSeconds)
  }
}

function seek(nominee: Nominee) {
  playMoment(nominee)
}

/** Кнопка «Подтвердить голос»: голос уходит только со второго нажатия. */
function onConfirmPress() {
  if (submitting.value || activeId.value === null) return
  if (confirm.press()) submit(activeId.value)
}

async function submit(nomineeId: number) {
  const current = nomination.value
  if (!current) return
  submitting.value = true
  notice.value = null
  try {
    const vote = await api.vote(current.id, nomineeId)
    record(vote)
    activeId.value = null
    showChosen.value = true
    await goToNextAfterVote(current.id)
  } catch (e) {
    handleVoteError(e)
  } finally {
    submitting.value = false
  }
}

function handleVoteError(e: unknown) {
  if (e instanceof ApiError) {
    if (e.status === 409) {
      // переголосовать нельзя: сервер вернул прежний выбор — показываем его
      const existing = (e.data as { vote?: Vote } | null)?.vote
      if (existing) record(existing)
      activeId.value = null
      notice.value = {kind: 'info', text: 'Вы уже голосовали в этой номинации — голос изменить нельзя.'}
      return
    }
    if (e.status === 401) {
      notice.value = {kind: 'error', text: 'Сессия истекла. Войдите снова, чтобы проголосовать.'}
      loginModal.open(route.fullPath)
      return
    }
    if (e.code === 'voting_closed') {
      notice.value = {kind: 'info', text: 'Голосование уже завершено.'}
      loadConfig()
      return
    }
  }
  confirm.reset()
  notice.value = {kind: 'error', text: e instanceof Error ? e.message : 'Не удалось отправить голос. Попробуйте ещё раз.'}
}

/** Статус «Выбрано» висит минимум STATUS_MS и пока не загрузится следующая анкета, затем переход. */
async function goToNextAfterVote(fromId: number) {
  const [next] = await Promise.all([
    api.nextUnvoted(fromId).then((n) => (n ? remember(n) : null, n), () => undefined),
    new Promise((resolve) => setTimeout(resolve, STATUS_MS)),
  ])
  // пока ждали, пользователь ушёл на другую анкету — не уводим его
  if (nominationId.value !== fromId) return
  if (next) await router.push(`/vote/${next.id}`)
  else if (next === null) await router.push({path: '/profile', query: {done: '1'}})
  else showChosen.value = false // сеть: остаёмся, кнопки навигации доступны
}

async function skip() {
  if (!nomination.value || skipping.value) return
  skipping.value = true
  try {
    const next = await api.nextUnvoted(nomination.value.id)
    if (next) {
      remember(next)
      await router.push(`/vote/${next.id}`)
    } else {
      await router.push({path: '/profile', query: {done: '1'}})
    }
  } catch {
    if (nextId.value) await router.push(`/vote/${nextId.value}`)
  } finally {
    skipping.value = false
  }
}

function go(target: number | null) {
  if (target) router.push(`/vote/${target}`)
}

function onKey(event: KeyboardEvent) {
  const el = event.target as HTMLElement | null
  if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
  if (event.key === 'ArrowLeft') go(prevId.value)
  else if (event.key === 'ArrowRight') go(nextId.value)
  else if (event.key === 'Escape') {
    activeId.value = null
    confirm.reset()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const actionHint = computed(() =>
    submitting.value ? 'Отправляем…' : confirm.armed.value ? 'Ещё раз — и голос засчитан' : 'Нажмите дважды',
)
</script>

<template>
  <main class="vote">
    <div v-if="loading && !nomination" class="vote__loading"><AppLoader/></div>

    <div v-else-if="loadError" class="vote__error page-container" role="alert">
      <h1 class="display">{{ loadError }}</h1>
      <div class="vote__error-actions">
        <PrimeButton variant="light" @click="load">Повторить</PrimeButton>
        <PrimeButton to="/">На главную</PrimeButton>
      </div>
    </div>

    <Transition v-else-if="nomination" name="ballot" mode="out-in">
      <div :key="nomination.id" class="vote__ballot page-container" :data-nomination-id="nomination.id">
        <header class="vote__head">
          <NominationTitle :nomination="nomination" level="h1" year="2026"/>
          <p v-if="totalNominations" class="vote__progress">
            Проголосовано {{ votedCount }} из {{ totalNominations }}
          </p>
        </header>

        <NominationPlayer
            v-if="showPlayer"
            ref="player"
            class="vote__player"
            :url="playerUrl"
            :poster="nomination.videoPosterPath"
            :title="nomination.name"
        />

        <h2 class="vote__subtitle">
          <template v-if="voted !== null">Ваш выбор:</template>
          <template v-else-if="!votingOpen">Голосование завершено</template>
          <template v-else>Отдать голос:</template>
        </h2>

        <p v-if="notice" class="vote__notice" :class="`is-${notice.kind}`" role="status">{{ notice.text }}</p>
        <p v-else-if="voted !== null && !showChosen" class="vote__notice is-info">
          Голос в этой номинации учтён.
          <button type="button" class="vote__link" @click="skip">Следующая анкета →</button>
        </p>

        <ul
            class="vote__grid"
            :class="isMoment ? 'vote__grid--moments' : 'vote__grid--people'"
            :aria-label="`Номинанты: ${nomination.name}`"
            @click.self="activeId = null"
        >
          <li v-for="nominee in nomination.nominees" :key="nominee.id">
            <MomentCard
                v-if="isMoment"
                :nominee="nominee"
                :state="stateOf(nominee.id)"
                :badge="voted === nominee.id ? (showChosen ? 'Выбрано' : 'Ваш выбор') : undefined"
                action-label="Подтвердить голос"
                :action-hint="actionHint"
                seekable
                eager
                @select="select(nominee)"
                @action="onConfirmPress"
                @seek="seek(nominee)"
            />
            <NomineeCard
                v-else
                :nominee="nominee"
                :state="stateOf(nominee.id)"
                :badge="voted === nominee.id ? (showChosen ? 'Выбрано' : 'Ваш выбор') : undefined"
                action-label="Подтвердить голос"
                :action-hint="actionHint"
                eager
                @select="select(nominee)"
                @action="onConfirmPress"
            />
          </li>
        </ul>
      </div>
    </Transition>

    <nav v-if="nomination && summary" class="vote__nav" aria-label="Анкеты">
      <button type="button" class="vote__arrow" :disabled="!prevId" aria-label="Предыдущая номинация" data-testid="prev-nomination" @click="go(prevId)">&lt;</button>
      <span class="vote__counter" data-testid="nomination-counter">{{ index + 1 }}/{{ summary.length }}</span>
      <button type="button" class="vote__arrow" :disabled="!nextId" aria-label="Следующая номинация" data-testid="next-nomination" @click="go(nextId)">&gt;</button>
    </nav>

    <PrimeButton
        v-if="nomination && !showChosen"
        class="vote__skip"
        size="sm"
        :disabled="skipping"
        data-testid="skip"
        @click="skip"
    >
      Пропустить →
    </PrimeButton>

    <Transition name="chosen">
      <div v-if="showChosen" class="vote__chosen" role="status" data-testid="vote-status">
        <span aria-hidden="true">✓</span> Выбрано
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.vote {
  min-height: 100dvh;
  padding-top: calc(var(--header-h) + clamp(8px, 1.5vw, 24px));
  padding-bottom: 120px;
}

.vote__loading {
  display: grid;
  place-items: center;
  min-height: 60vh;
}

.vote__error {
  padding-block: 10vh;
  text-align: center;
}

.vote__error h1 {
  font-size: clamp(28px, 3vw, 52px);
}

.vote__error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.vote__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 32px;
}

.vote__progress {
  margin: 0;
  color: var(--muted-2);
  font-size: 15px;
  white-space: nowrap;
}

.vote__player {
  margin-top: clamp(20px, 2vw, 32px);
}

.vote__subtitle {
  margin: clamp(24px, 2.6vw, 44px) 0 clamp(14px, 1.4vw, 24px);
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(22px, 2.1vw, 40px);
  letter-spacing: -0.03em;
}

.vote__notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  font-size: 15px;
}

.vote__notice.is-error {
  border-color: color-mix(in srgb, var(--danger) 50%, transparent);
  color: var(--danger);
}

.vote__link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--text);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.vote__grid {
  display: grid;
  gap: clamp(16px, 2.4vw, 60px) clamp(14px, 2.6vw, 90px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.vote__grid--people {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-inline: clamp(0px, 1.5vw, 30px);
}

.vote__grid--moments {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(14px, 2vw, 56px);
}

.vote__nav {
  position: fixed;
  bottom: 16px;
  left: 50%;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 6px;
  translate: -50% 0;
  padding: 4px 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: rgba(8, 9, 11, 0.85);
  backdrop-filter: blur(10px);
  font-family: var(--font-serif);
  font-size: clamp(22px, 1.875vw, 36px);
  letter-spacing: -0.03em;
}

.vote__arrow {
  width: 40px;
  height: 40px;
  padding: 0 0 2px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  font-size: 1em;
  line-height: 1;
  cursor: pointer;
}

.vote__arrow:hover:not(:disabled) {
  background: rgba(229, 231, 234, 0.1);
}

.vote__arrow:disabled {
  opacity: 0.25;
  cursor: default;
}

.vote__counter {
  min-width: 3.6em;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.vote__skip {
  position: fixed;
  right: var(--page-pad);
  bottom: 20px;
  z-index: 50;
}

.vote__chosen {
  position: fixed;
  left: 50%;
  bottom: 84px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 10px;
  translate: -50% 0;
  padding: 14px 28px;
  border-radius: var(--radius-pill);
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-display);
  font-size: clamp(22px, 2vw, 32px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(229, 231, 234, 0.3);
}

.ballot-enter-active,
.ballot-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.ballot-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.ballot-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.chosen-enter-active,
.chosen-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.chosen-enter-from,
.chosen-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1200px) {
  .vote__grid--people,
  .vote__grid--moments {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .vote__grid--people,
  .vote__grid--moments {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vote__nav {
    left: var(--page-pad);
    translate: none;
  }
}

@media (max-width: 520px) {
  .vote__grid--moments {
    grid-template-columns: minmax(0, 1fr);
  }

  .vote__grid {
    gap: 12px;
  }
}
</style>
