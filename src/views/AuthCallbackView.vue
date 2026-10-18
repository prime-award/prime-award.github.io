<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import AppLoader from '@/components/AppLoader.vue'
import PrimeButton from '@/components/ui/PrimeButton.vue'
import {useAuth} from '@/composable/useAuth.ts'
import {useLoginModal} from '@/composable/useLoginModal.ts'
import {useMyVotes} from '@/composable/useMyVotes.ts'

// Сюда бэкенд возвращает после входа: /auth/callback#code=… или #error=…
const ERRORS: Record<string, string> = {
  cancelled: 'Вход отменён.',
  banned: 'Этот аккаунт заблокирован.',
  invalid_state: 'Ссылка входа устарела. Попробуйте ещё раз.',
  provider_disabled: 'Вход через эту платформу пока недоступен.',
  failed: 'Не удалось войти. Попробуйте ещё раз.',
}

const router = useRouter()
const {completeLogin} = useAuth()
const {load: loadVotes} = useMyVotes()
const loginModal = useLoginModal()
const error = ref<string | null>(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  // одноразовый код не должен остаться в адресной строке и истории
  history.replaceState(history.state, '', window.location.pathname)

  const code = params.get('code')
  if (!code) {
    error.value = ERRORS[params.get('error') ?? ''] ?? ERRORS.failed
    return
  }
  try {
    const session = await completeLogin(code)
    loadVotes(true)
    await router.replace(session.redirectPath || '/')
  } catch {
    error.value = 'Код входа устарел или уже использован. Попробуйте войти ещё раз.'
  }
})

function retry() {
  router.replace('/')
  loginModal.open('/')
}
</script>

<template>
  <main class="auth-callback">
    <AppLoader v-if="!error"/>
    <div v-else class="auth-callback__error" role="alert">
      <h1 class="display auth-callback__title">Вход не выполнен</h1>
      <p>{{ error }}</p>
      <div class="auth-callback__actions">
        <PrimeButton variant="light" @click="retry">Попробовать снова</PrimeButton>
        <PrimeButton to="/">На главную</PrimeButton>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-callback {
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: var(--header-h) var(--page-pad) 0;
  text-align: center;
}

.auth-callback__title {
  font-size: clamp(32px, 4vw, 64px);
}

.auth-callback__error p {
  color: var(--muted-2);
  font-size: 18px;
}

.auth-callback__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
</style>
