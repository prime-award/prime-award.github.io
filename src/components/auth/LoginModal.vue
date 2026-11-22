<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue'
import {useAuth} from '@/composable/useAuth.ts'
import {useAppConfig} from '@/composable/useAppConfig.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import {PLATFORM_STYLE} from '@/utils/platforms'
import {API_URL, type LoginProviderId, type OAuthProviderId, type Provider} from '@/api'

const {isOpen, redirectPath, close} = useLoginModal()
const {login} = useAuth()
const {config, status, load} = useAppConfig()
const isDev = import.meta.env.DEV

const dialog = ref<HTMLElement | null>(null)
const pending = ref<LoginProviderId | null>(null)
let returnFocus: HTMLElement | null = null

const providers = computed(() =>
    (config.value?.providers ?? [
      {id: 'twitch', title: 'Twitch', enabled: false},
      {id: 'kick', title: 'Kick', enabled: false},
    ])
        .filter((p): p is Provider & { id: OAuthProviderId } => p.id === 'twitch' || p.id === 'kick')
        .map((p) => ({...p, ...PLATFORM_STYLE[p.id]})),
)

watch(isOpen, async (value) => {
  if (value) {
    returnFocus = document.activeElement as HTMLElement | null
    pending.value = null
    // при каждом открытии сверяемся с сервером: его могли перезапустить с ключами провайдеров
    load(true)
    document.body.style.overflow = 'hidden'
    await nextTick()
    dialog.value?.querySelector<HTMLElement>('button:not([disabled])')?.focus()
  } else {
    document.body.style.overflow = ''
    returnFocus?.focus?.()
  }
})

function choose(provider: LoginProviderId) {
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

          <div v-if="status === 'error' && !config" class="modal__error" role="alert">
            Не удалось связаться с сервером входа.
            <small v-if="isDev">API: {{ API_URL }} — бэкенд запущен?</small>
            <button type="button" class="modal__retry" @click="load(true)">Повторить</button>
          </div>

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
                <small v-if="!config && status !== 'error'" class="provider__note">…</small>
                <small v-else-if="!config" class="provider__note">нет связи</small>
                <!-- в разработке подсказываем причину: бэкенд запущен без ключей провайдера -->
                <small
                    v-else-if="!p.enabled"
                    class="provider__note"
                    :title="isDev ? `Бэкенд запущен без ${p.id.toUpperCase()}_CLIENT_ID / ${p.id.toUpperCase()}_CLIENT_SECRET` : undefined"
                >{{ isDev ? 'нет ключей' : 'скоро' }}</small>
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
/* Диалог M3: 280–560dp, поля 24dp, скругление 28dp, заголовок headline-s, текст body-m. */
.modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: var(--space-4);
  background: var(--scrim);
  backdrop-filter: blur(6px);
}

.modal__dialog {
  position: relative;
  width: min(var(--dialog-max), 100%);
  max-height: calc(100dvh - 2 * var(--space-4));
  overflow: auto;
  padding: var(--space-6);
  border-radius: var(--shape-xl);
  background: var(--surface-2);
  box-shadow: 0 8px 12px 6px rgba(0, 0, 0, 0.3), 0 4px 4px rgba(0, 0, 0, 0.5);
}

.modal__close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: grid;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  font: 400 var(--type-headline-s) var(--font-text);
  color: var(--muted-2);
  cursor: pointer;
}

.modal__close:hover {
  color: var(--text);
  background: var(--state-hover);
}

.modal__title {
  font: 400 var(--type-headline-m) var(--font-display);
  text-align: center;
}

.modal__text {
  margin: var(--space-4) 0 var(--space-6);
  color: var(--text-muted);
  font: var(--type-body-m) var(--font-text);
  text-align: center;
}

.modal__error {
  display: grid;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--danger) 45%, transparent);
  border-radius: var(--shape-md);
  color: var(--danger);
  font: var(--type-body-m) var(--font-text);
  text-align: center;
}

.modal__error small {
  color: var(--muted-2);
  font: var(--type-body-s) var(--font-text);
  overflow-wrap: anywhere;
}

.modal__retry {
  justify-self: center;
  min-height: var(--control-h-sm);
  padding: 0 var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--text);
  font: var(--type-label-l) var(--font-text);
  cursor: pointer;
}

.modal__providers {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* пункт выбора платформы: строка 56dp (M3 list item), иконка 24dp, поля 16dp */
.provider {
  --brand: var(--text);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  min-height: var(--control-h-lg);
  padding: 0 var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--shape-md);
  background: transparent;
  font: 500 var(--type-body-l) var(--font-text);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.provider:hover:not(:disabled) {
  border-color: var(--brand);
  background: color-mix(in srgb, var(--brand) 8%, transparent);
}

.provider:disabled {
  cursor: default;
  opacity: 0.38;
}

.provider__icon {
  width: var(--icon);
  height: var(--icon);
  flex: none;
  fill: var(--brand);
}

.provider__title {
  flex: 1;
}

.provider__note {
  color: var(--muted-2);
  font: 400 var(--type-label-m) var(--font-text);
}

.provider--dev {
  justify-content: center;
  border-style: dashed;
}

.modal__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-6) 0 var(--space-3);
  color: var(--muted);
  font: 500 var(--type-label-s) var(--font-text);
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
  transform: translateY(var(--space-3)) scale(0.98);
}
</style>
