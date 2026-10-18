import {readonly, ref} from 'vue'
import {api, type AppConfig} from '@/api'

const config = ref<AppConfig | null>(null)
let loading: Promise<AppConfig | null> | null = null

/** Публичные настройки бэкенда: провайдеры входа, dev-режим, дедлайн голосования. Грузятся один раз. */
export function useAppConfig() {
    function load(): Promise<AppConfig | null> {
        if (config.value) return Promise.resolve(config.value)
        loading ??= api.config()
            .then((value) => (config.value = value))
            .catch(() => null)
            .finally(() => (loading = null))
        return loading
    }

    return {config: readonly(config), load}
}
