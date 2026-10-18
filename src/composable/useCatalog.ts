import {ref} from 'vue'
import {api, type Nomination, type NominationBrief} from '@/api'

// Каталог почти не меняется за время жизни вкладки: кэшируем список и загруженные номинации
const summary = ref<NominationBrief[] | null>(null)
const nominations = new Map<number, Promise<Nomination>>()
let summaryLoading: Promise<NominationBrief[]> | null = null

/** Номинации: краткий список для навигации и полные данные по id (с предзагрузкой). */
export function useCatalog() {
    function loadSummary(): Promise<NominationBrief[]> {
        if (summary.value) return Promise.resolve(summary.value)
        summaryLoading ??= api.nominationsSummary()
            .then((list) => (summary.value = list))
            .finally(() => (summaryLoading = null))
        return summaryLoading
    }

    function getNomination(id: number): Promise<Nomination> {
        let promise = nominations.get(id)
        if (!promise) {
            promise = api.nomination(id)
            // ошибку не кэшируем — следующий вызов попробует снова
            promise.catch(() => nominations.delete(id))
            nominations.set(id, promise)
        }
        return promise
    }

    /** Положить уже полученную номинацию в кэш (например, из /votes/next). */
    function remember(nomination: Nomination) {
        nominations.set(nomination.id, Promise.resolve(nomination))
    }

    return {summary, loadSummary, getNomination, remember}
}
