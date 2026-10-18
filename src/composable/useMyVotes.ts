import {computed, ref, watch} from 'vue'
import {api, type Vote} from '@/api'
import {useAuth} from './useAuth.ts'

// nominationId -> nomineeId; null — ещё не загружено (или пользователь не вошёл)
const votes = ref<Map<number, number> | null>(null)
const totalNominations = ref(0)
let loading: Promise<void> | null = null

const {isLoggedIn} = useAuth()
watch(isLoggedIn, (value) => {
    if (!value) votes.value = null
})

/** Голоса текущего пользователя: за кого он уже проголосовал. Общий кэш для главной, анкеты и профиля. */
export function useMyVotes() {
    function load(force = false): Promise<void> {
        if (!isLoggedIn.value) return Promise.resolve()
        if (votes.value && !force) return Promise.resolve()
        loading ??= api.myVotes()
            .then((data) => {
                votes.value = new Map(data.votes.map((v) => [v.nominationId, v.nomineeId]))
                totalNominations.value = data.totalNominations
            })
            .catch(() => {})
            .finally(() => (loading = null))
        return loading
    }

    /** Голос принят (или сервер сообщил о прежнем голосе при 409). */
    function record(vote: Pick<Vote, 'nominationId' | 'nomineeId'>) {
        const next = new Map(votes.value ?? [])
        next.set(vote.nominationId, vote.nomineeId)
        votes.value = next
    }

    function votedNomineeId(nominationId: number): number | null {
        return votes.value?.get(nominationId) ?? null
    }

    const votedCount = computed(() => votes.value?.size ?? 0)

    return {votes, totalNominations, votedCount, load, record, votedNomineeId}
}
