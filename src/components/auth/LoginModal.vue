<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue'
import {useAuth} from '@/composable/useAuth.ts'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'

const {isOpen, redirectPath, close} = useLoginModal()
const {login} = useAuth()
const {config, load} = useAppConfig()

const dialog = ref<HTMLElement | null>(null)
const pending = ref<string | null>(null)
let returnFocus: HTMLElement | null = null

// иконки платформ в фирменных цветах (простые SVG-пути)
const PLATFORM_STYLE: Record<string, { color: string, mark: string }> = {
  twitch: {color: '#9146FF', mark: 'M4 3 3 6v13h4v2h2l2-2h3l5-5V3H4Zm14 10-3 3h-3l-2 2v-2H7V5h11v8Zm-3-6v4h-2V7h2Zm-4 0v4H9V7h2Z'},
  kick: {color: '#53FC18', mark: 'M4 3h5v5h2V6h2V4h2V3h5v6h-2v2h-2v2h2v2h2v6h-5v-1h-2v-2h-2v-2H9v5H4V3Z'},
  vk: {color: '#0077FF', mark: 'M12.8 18C6.6 18 3.1 13.8 3 6.7h3.1c.1 5.2 2.4 7.4 4.2 7.9V6.7h2.9v4.5c1.8-.2 3.7-2.2 4.3-4.5h2.9c-.5 2.8-2.5 4.8-4 5.6 1.5.7 3.8 2.4 4.7 5.7h-3.2c-.7-2.2-2.4-3.9-4.7-4.1V18h-.4Z'},
}

const providers = computed(() =>
    (config.value?.providers ?? [
      {id: 'twitch', title: 'Twitch', enabled: false},
      {id: 'kick', title: 'Kick', enabled: false},
      {id: 'vk', title: 'VK Video Live', enabled: false},
    ]).map((p) => ({...p, ...PLATFORM_STYLE[p.id]})),
)

watch(isOpen, async (value) => {
  if (value) {
    returnFocus = document.activeElement as HTMLElement | null
    pending.value = null
    load()
    document.body.style.overflow = 'hidden'
    await nextTick()
    dialog.value?.querySelector<HTMLElement>('button:not([disabled])')?.focus()
  } else {
    document.body.style.overflow = ''
    returnFocus?.focus?.()
  }
})

function choose(provider: string) {
  pending.value = provider
  login(provider, redirectPath.value)
}

// Tab не уходит за пределы окна
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !dialog.value) return
  const items = [...dialog.value.querySelectorAll<HTMLElement>('button:not([disabled])')]
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal" @click.self="close" @keydown.esc="close" @keydown="trapFocus">
        <div ref="dialog" class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" data-testid="login-modal">
          <button type="button" class="modal__close" aria-label="Закрыть" @click="close">×</button>

          <h2 id="login-title" class="display modal__title">Вход</h2>
          <p class="modal__text">Чтобы проголосовать, войдите через стриминговую платформу. Один аккаунт — один голос в каждой номинации.</p>

          <ul class="modal__providers">
            <li v-for="p in providers" :key="p.id">
              <button
                  type="button"
                  class="provider"
                  :style="{ '--brand': p.color }"
                  :disabled="!p.enabled || pending !== null"
                  :data-provider="p.id"
                  @click="choose(p.id)"
              >
                <svg class="provider__icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="p.mark"/></svg>
                <span class="provider__title">{{ p.title }}</span>
                <small v-if="!p.enabled" class="provider__note">скоро</small>
                <small v-else-if="pending === p.id" class="provider__note">переходим…</small>
              </button>
            </li>
          </ul>

          <template v-if="config?.devLogin">
            <div class="modal__divider"><span>режим разработки</span></div>
            <button
                type="button"
                class="provider provider--dev"
                data-provider="dev"
                :disabled="pending !== null"
                @click="choose('dev')"
            >
              <span class="provider__title">Войти как тестовый пользователь</span>
              <small v-if="pending === 'dev'" class="provider__note">переходим…</small>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(4, 5, 7, 0.72);
  backdrop-filter: blur(6px);
}

.modal__dialog {
  position: relative;
  width: min(440px, 100%);
  max-height: calc(100dvh - 32px);
  overflow: auto;
  padding: clamp(24px, 4vw, 36px);
  border: 1px solid var(--line);
  border-radius: 24px;
  background: radial-gradient(120% 80% at 50% 0%, #1a1e25 0%, var(--surface) 60%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

.modal__close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  color: var(--muted-2);
  cursor: pointer;
}

.modal__close:hover {
  color: var(--text);
  background: rgba(229, 231, 234, 0.08);
}

.modal__title {
  font-size: clamp(32px, 3vw, 44px);
  text-align: center;
}

.modal__text {
  margin: 12px 0 24px;
  color: var(--muted-2);
  font-size: 15px;
  line-height: 1.45;
  text-align: center;
}

.modal__providers {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.provider {
  --brand: var(--text);
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(229, 231, 234, 0.03);
  font-size: 17px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.provider:hover:not(:disabled) {
  border-color: var(--brand);
  background: color-mix(in srgb, var(--brand) 10%, transparent);
  transform: translateY(-1px);
}

.provider:disabled {
  cursor: default;
  opacity: 0.5;
}

.provider__icon {
  width: 24px;
  height: 24px;
  flex: none;
  fill: var(--brand);
}

.provider__title {
  flex: 1;
}

.provider__note {
  color: var(--muted-2);
  font-size: 13px;
  font-weight: 400;
}

.provider--dev {
  justify-content: center;
  border-style: dashed;
}

.modal__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 12px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.modal__divider::before,
.modal__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal__dialog,
.modal-leave-active .modal__dialog {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__dialog,
.modal-leave-to .modal__dialog {
  transform: translateY(12px) scale(0.98);
}
</style>
