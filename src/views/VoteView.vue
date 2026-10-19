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
import {votedFirst} from '@/components/nominations/votedFirst.ts'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import NominationPlayer from '@/components/vote/NominationPlayer.vue'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {useCatalog} from '@/composable/useCatalog.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import {useMyVotes} from '@/composable/useMyVotes.ts'

/*
 * Анкета номинации:
 * нажатие на карточку -> active (фото размыто, надпись «Подтвердить голос») -> ещё одно нажатие по ней же -> POST /votes ->
 * карточка «Выбрано» минимум STATUS_MS и пока не загрузится следующая -> следующая непроголосованная справа.
 */
const STATUS_MS = 1200

const route = useRoute()
const router = useRouter()
const {getNomination, loadSummary, summary, remember} = useCatalog()
const {votedNomineeId, votedCount, totalNominations, load: loadVotes, record} = useMyVotes()
const {config, load: loadConfig} = useAppConfig()
const loginModal = useLoginModal()
// второе нажатие раньше этого срока после выбора — случайный двойной клик, а не подтверждение
const CONFIRM_GUARD_MS = 300
let activatedAt = 0

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
// в проголосованной номинации выбор — первым; сразу после голоса (статус «Выбрано») порядок не трогаем, чтобы карточка не прыгала
const nominees = computed(() =>
    nomination.value ? votedFirst(nomination.value.nominees, showChosen.value ? null : voted.value) : [],
)
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

/**
 * Нажатие на карточку: первое — выбор (карточка в состоянии «Подтвердить голос»),
 * второе по той же карточке — подтверждение и отправка голоса.
 */
function select(nominee: Nominee) {
  if (isMoment.value && activeId.value !== nominee.id) playMoment(nominee)
  if (readOnly.value || submitting.value) return
  notice.value = null

  if (activeId.value === nominee.id) {
    if (Date.now() - activatedAt >= CONFIRM_GUARD_MS) submit(nominee.id)
    return
  }
  activeId.value = nominee.id
  activatedAt = Date.now()
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
  else if (event.key === 'Escape') activeId.value = null
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const actionHint = computed(() => (submitting.value ? 'Отправляем…' : undefined))
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
          <li v-for="nominee in nominees" :key="nominee.id">
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
        :disabled="skipping"
        data-testid="skip"
        @click="skip"
    >
      Пропустить →
    </PrimeButton>

  </main>
</template>

<style scoped>
/* нижняя панель: 56dp + отступ 16dp сверху и снизу — под неё оставляем место в конце страницы */
.vote {
  --bottom-bar: calc(var(--control-h-lg) + 2 * var(--space-4));
  min-height: 100dvh;
  padding-top: calc(var(--header-h) + var(--space-4));
  padding-bottom: calc(var(--bottom-bar) + var(--space-8));
}

.vote__loading {
  display: grid;
  place-items: center;
  min-height: 60vh;
}

.vote__error {
  padding-block: var(--space-24);
  text-align: center;
}

.vote__error h1 {
  font: 400 var(--type-headline-l) var(--font-display);
}

.vote__error-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.vote__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3) var(--space-8);
}

.vote__progress {
  margin: 0;
  color: var(--muted-2);
  font: var(--type-body-m) var(--font-text);
  white-space: nowrap;
}

.vote__player {
  margin-top: var(--space-6);
}

.vote__subtitle {
  margin: var(--space-8) 0 var(--space-4);
  font: 400 var(--type-subtitle) var(--font-serif);
}

.vote__notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-4);
  margin: 0 0 var(--space-5);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--shape-md);
  background: var(--surface);
  font: var(--type-body-m) var(--font-text);
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
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

/* сетка номинантов: карточки фиксированной ширины, не больше 5 в ряд, ряды (и неполный последний) — по центру */
.vote__grid {
  --card-w: var(--ballot-card-w);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--layout-gutter);
  max-width: calc(5 * var(--card-w) + 4 * var(--layout-gutter));
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.vote__grid--moments {
  --card-w: var(--ballot-moment-w);
}

.vote__grid > li {
  flex: 0 0 var(--card-w);
  min-width: 0;
}

/* compact: люди — по 2 в ряд на всю ширину, моменты — по одному */
@media (max-width: 599px) {
  .vote__grid--people > li {
    flex-basis: calc((100% - var(--layout-gutter)) / 2);
  }

  .vote__grid--moments > li {
    flex-basis: 100%;
  }
}

/* навигация по анкетам: «< n/N >», 56dp */
.vote__nav {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  height: var(--control-h-lg);
  translate: -50% 0;
  padding: 0 var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--shape-full);
  background: rgba(14, 16, 20, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15);
  font: 400 var(--type-title-l) var(--font-serif);
}

.vote__arrow {
  display: grid;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  padding: 0;
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.vote__arrow:hover:not(:disabled) {
  background: var(--state-hover);
}

.vote__arrow:disabled {
  opacity: 0.38;
  cursor: default;
}

.vote__counter {
  min-width: 4.5em;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* «Пропустить» — extended FAB M3: 56dp, скругление 16dp, правый нижний угол */
.vote .vote__skip {
  position: fixed;
  right: var(--layout-margin);
  bottom: var(--space-4);
  z-index: 50;
  min-height: var(--control-h-lg);
  padding: 0 var(--space-5);
  border-radius: var(--shape-lg);
  background: var(--surface-3);
  border-color: var(--line);
  font: 400 var(--type-label-l) var(--font-serif);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15);
}


.ballot-enter-active,
.ballot-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.ballot-enter-from {
  opacity: 0;
  transform: translateX(var(--space-6));
}

.ballot-leave-to {
  opacity: 0;
  transform: translateX(calc(-1 * var(--space-6)));
}


/* compact: навигация слева и компактнее, FAB справа — чтобы не перекрывались */
@media (max-width: 599px) {
  .vote__nav {
    left: var(--layout-margin);
    translate: none;
    font: 400 var(--type-title-m) var(--font-serif);
  }

  .vote__arrow {
    width: var(--control-h);
    height: var(--control-h);
  }

  .vote__counter {
    min-width: 3.5em;
  }

  .vote .vote__skip {
    padding: 0 var(--space-4);
  }
}
</style>
