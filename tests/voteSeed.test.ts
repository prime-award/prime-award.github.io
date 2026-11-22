import {expect, it, vi} from 'vitest'
import {api} from '@/api'
import {useAuth} from '@/composable/useAuth'

it('keeps the seed across token expiry and clears it on explicit logout', async () => {
    const auth = useAuth()
    const user = {id: 17, platform: 'DEV' as const, login: 'dev', displayName: 'Dev', avatarUrl: null, nameColor: null}
    const session = {token: 'first', expiresAt: new Date(Date.now() + 60_000).toISOString(), user, redirectPath: '/'}
    vi.spyOn(api, 'exchange').mockResolvedValue(session)
    await auth.completeLogin('code')
    const seed = auth.voteSeed.value
    const key = 'prime.voteSeed.17'
    expect(document.cookie).toContain(`${key}=${seed}`)

    localStorage.removeItem('prime.session')
    window.dispatchEvent(new StorageEvent('storage', {key: 'prime.session'}))
    expect(auth.isLoggedIn.value).toBe(false)
    expect(document.cookie).toContain(`${key}=${seed}`)
    // Даже если браузер успел удалить cookie, восстановим тот же порядок.
    document.cookie = `${key}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    vi.mocked(api.exchange).mockResolvedValue({...session, token: 'second'})
    await auth.completeLogin('new-code')
    expect(auth.voteSeed.value).toBe(seed)
    expect(document.cookie).toContain(`${key}=${seed}`)

    vi.spyOn(api, 'logout').mockRejectedValue(new Error('offline'))
    await auth.logout()
    expect(document.cookie).not.toContain(key)
    expect(localStorage.getItem(key)).toBeNull()
})
