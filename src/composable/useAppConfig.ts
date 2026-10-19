import {readonly, ref} from 'vue'
import {api, type AppConfig} from '@/api'

const config = ref<AppConfig | null>(null)
// idle — ещё не запрашивали; error — бэкенд не ответил (не запущен, другой адрес, CORS)
const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
let loading: Promise<AppConfig | null> | null = null

/** Публичные настройки бэкенда: провайдеры входа, dev-режим, дедлайн голосования. Грузятся один раз. */
export function useAppConfig() {
    /** force — перезапросить, даже если конфиг уже есть (например, бэкенд перезапустили с ключами). */
    function load(force = false): Promise<AppConfig | null> {
        if (config.value && !force) return Promise.resolve(config.value)
        status.value = 'loading'
        loading ??= api.config()
            .then((value) => {
                config.value = value
                status.value = 'ok'
                return value
            })
            .catch(() => {
                status.value = 'error'
                return null
            })
            .finally(() => (loading = null))
        return loading
    }

    return {config: readonly(config), status: readonly(status), load}
}
