<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, ref, watch} from 'vue'
import type {User, VotedNomination} from '@/api'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {downloadFile, safeFileName} from '@/utils/download.ts'
import ShareCard from './ShareCard.vue'

// «Поделиться»: превью картинки «Мой выбор» и сохранение в PNG целиком в браузере.
const props = defineProps<{
  open: boolean
  user: User
  voted: VotedNomination[]
  total: number
}>()

const emit = defineEmits<{ close: [] }>()

const CARD_WIDTH = 1080
const card = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const scale = ref(0.4)
const cardHeight = ref(0)
const busy = ref(false)
const error = ref<string | null>(null)
const canShareFiles = ref(false)
let observer: ResizeObserver | null = null

const fileName = computed(() => `prime-2026-${safeFileName(props.user.login)}.png`)

watch(() => props.open, async (open) => {
  error.value = null
  if (!open) {
    observer?.disconnect()
    document.body.style.overflow = ''
    return
  }
  document.body.style.overflow = 'hidden'
  canShareFiles.value = typeof navigator.canShare === 'function' &&
      navigator.canShare({files: [new File([''], 'x.png', {type: 'image/png'})]})
  await nextTick()
  dialog.value?.querySelector<HTMLElement>('button')?.focus()
  // превью: карточка 1080 px уменьшается под ширину окна
  observer = new ResizeObserver(() => {
    if (!frame.value || !card.value) return
    scale.value = Math.min(1, frame.value.clientWidth / CARD_WIDTH)
    cardHeight.value = card.value.offsetHeight
  })
  if (frame.value) observer.observe(frame.value)
  if (card.value) observer.observe(card.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.body.style.overflow = ''
})

/** Снимок карточки: html-to-image рисует DOM в canvas. Библиотека грузится только по требованию. */
async function render(): Promise<Blob> {
  if (!card.value) throw new Error('nothing to render')
  const {toBlob} = await import('html-to-image')
  await document.fonts?.ready
  const blob = await toBlob(card.value, {
    pixelRatio: 1,
    width: CARD_WIDTH,
    backgroundColor: '#08090b',
    // невалидная картинка не должна ломать весь снимок
    imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  })
  if (!blob) throw new Error('empty image')
  return blob
}

async function save() {
  if (busy.value) return
  busy.value = true
  error.value = null
  try {
    const url = URL.createObjectURL(await render())
    downloadFile(url, fileName.value)
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  } catch {
    error.value = 'Не удалось подготовить картинку. Попробуйте ещё раз.'
  } finally {
    busy.value = false
  }
}

async function share() {
  if (busy.value) return
  busy.value = true
  error.value = null
  try {
    const file = new File([await render()], fileName.value, {type: 'image/png'})
    await navigator.share({files: [file], title: 'Мой выбор — PRIME 2026'})
  } catch (e) {
    if (!(e instanceof DOMException && e.name === 'AbortError')) error.value = 'Не получилось поделиться — сохраните картинку.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="share">
      <div v-if="open" class="share" @click.self="emit('close')" @keydown.esc="emit('close')">
        <div ref="dialog" class="share__dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" data-testid="share-modal">
          <header class="share__head">
            <h2 id="share-title" class="display share__title">Поделиться</h2>
            <button type="button" class="share__close" aria-label="Закрыть" @click="emit('close')">×</button>
          </header>

          <!-- превью: карточка 1080 px уменьшена transform-ом; sizer задаёт реальную (уменьшенную) высоту -->
          <div ref="frame" class="share__frame">
            <div class="share__sizer" :style="{ height: `${cardHeight * scale}px` }">
              <div class="share__scaler" :style="{ transform: `scale(${scale})` }">
                <div ref="card">
                  <ShareCard :user="user" :voted="voted" :total="total"/>
                </div>
              </div>
            </div>
          </div>

          <p v-if="error" class="share__error" role="alert">{{ error }}</p>

          <footer class="share__actions">
            <PrimeButton variant="light" :disabled="busy" data-testid="download-png" @click="save">
              {{ busy ? 'Готовим…' : 'Скачать PNG' }}
            </PrimeButton>
            <PrimeButton v-if="canShareFiles" :disabled="busy" @click="share">Отправить</PrimeButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Диалог M3 (скругление 28dp, поля 24dp); на compact — полноэкранный. */
.share {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  /* трек не должен растягиваться под ширину карточки (1080 px внутри превью) */
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: var(--space-4);
  background: var(--scrim);
  backdrop-filter: blur(6px);
}

.share__dialog {
  display: flex;
  flex-direction: column;
  width: min(var(--dialog-max), 100%);
  max-height: calc(100dvh - 2 * var(--space-4));
  padding: var(--space-6);
  border-radius: var(--shape-xl);
  background: var(--surface-2);
  box-shadow: 0 8px 12px 6px rgba(0, 0, 0, 0.3), 0 4px 4px rgba(0, 0, 0, 0.5);
}

.share__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.share__title {
  font: 400 var(--type-headline-s) var(--font-display);
}

.share__close {
  display: grid;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  margin-right: calc(-1 * var(--space-3));
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--muted-2);
  font: 400 var(--type-headline-s) var(--font-text);
  cursor: pointer;
}

.share__close:hover {
  color: var(--text);
  background: var(--state-hover);
}

.share__frame {
  flex: 0 1 auto;
  min-width: 0;
  min-height: var(--space-24);
  overflow: hidden auto;
  border-radius: var(--shape-md);
  background: var(--bg);
  overscroll-behavior: contain;
}

.share__sizer {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.share__scaler {
  width: 1080px;
  transform-origin: top left;
}

.share__error {
  margin: var(--space-3) 0 0;
  color: var(--danger);
  font: var(--type-body-m) var(--font-text);
}

.share__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.share-enter-active,
.share-leave-active {
  transition: opacity 0.2s ease;
}

.share-enter-from,
.share-leave-to {
  opacity: 0;
}

/* compact: полноэкранный диалог */
@media (max-width: 599px) {
  .share {
    padding: 0;
  }

  .share__dialog {
    width: 100%;
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    padding: var(--space-4);
  }

  .share__frame {
    flex: 1 1 auto;
  }

  .share__actions > * {
    flex: 1;
  }
}
</style>
