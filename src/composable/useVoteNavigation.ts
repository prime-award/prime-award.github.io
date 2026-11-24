import {useRouter} from 'vue-router'
import {api} from '@/api'
import {useAuth} from './useAuth.ts'
import {useCatalog} from './useCatalog.ts'
import {useLoginModal} from './useLoginModal.ts'

/** Переходы в анкету: «Анкета» в меню, «Проголосовать», «Выбрать». Без входа — окно входа. */
export function useVoteNavigation() {
    const router = useRouter()
    const {isLoggedIn} = useAuth()
    const {remember, loadSummary} = useCatalog()
    const loginModal = useLoginModal()

    /** Первая непроголосованная анкета; если всё проголосовано — профиль. */
    async function openNextBallot() {
        if (!isLoggedIn.value) return loginModal.open('/vote')
        try {
            const next = await api.nextUnvoted()
            if (next) {
                remember(next)
                return router.push(`/vote/${next.position}`)
            }
            return router.push({path: '/profile', query: {done: '1'}})
        } catch {
            // сеть/сервер: откроем первую номинацию, анкета сама покажет ошибку или статус
            const summary = await loadSummary().catch(() => [])
            return router.push(summary[0] ? `/vote/${summary[0].position}` : '/')
        }
    }

    /** «Выбрать» на главной: анкета этой номинации с подсвеченным номинантом. */
    function openBallot(position: number, nomineeId?: number) {
        const target = `/vote/${position}` + (nomineeId ? `?nominee=${nomineeId}` : '')
        if (!isLoggedIn.value) return loginModal.open(target)
        return router.push(target)
    }

    return {openNextBallot, openBallot}
}
