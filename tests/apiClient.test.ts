import {afterEach, describe, expect, it, vi} from 'vitest'
import {ApiError, apiFetch, configureApiAuth, NetworkError} from '@/api/client.ts'

function mockFetch(status: number, body: unknown) {
    const fn = vi.fn().mockResolvedValue(new Response(body === null ? null : JSON.stringify(body), {status}))
    vi.stubGlobal('fetch', fn)
    return fn
}

afterEach(() => {
    vi.unstubAllGlobals()
    configureApiAuth(() => null, () => {})
})

describe('apiFetch', () => {
    it('sends the bearer token and json body', async () => {
        configureApiAuth(() => 'tok', () => {})
        const fetch = mockFetch(201, {ok: true})
        await apiFetch('/prime/votes', {method: 'POST', body: {nominationId: 1, nomineeId: 2}})
        const [, init] = fetch.mock.calls[0]
        expect(init.headers.Authorization).toBe('Bearer tok')
        expect(init.headers['Content-Type']).toBe('application/json')
        expect(JSON.parse(init.body)).toEqual({nominationId: 1, nomineeId: 2})
    })

    it('maps error bodies to ApiError with code', async () => {
        mockFetch(409, {error: 'already_voted', message: 'Already voted', vote: {nomineeId: 5}})
        const error = (await apiFetch('/prime/votes', {method: 'POST', body: {}}).catch((e) => e)) as ApiError & {data: any}
        expect(error).toBeInstanceOf(ApiError)
        expect(error.status).toBe(409)
        expect(error.code).toBe('already_voted')
        expect(error.data.vote.nomineeId).toBe(5)
    })

    it('drops the session on 401 only when a token was sent', async () => {
        const onUnauthorized = vi.fn()
        configureApiAuth(() => 'expired', onUnauthorized)
        mockFetch(401, {error: 'unauthorized', message: 'x'})
        await expect(apiFetch('/prime/me')).rejects.toBeInstanceOf(ApiError)
        expect(onUnauthorized).toHaveBeenCalledOnce()

        configureApiAuth(() => null, onUnauthorized)
        mockFetch(401, {error: 'invalid_code', message: 'x'})
        await expect(apiFetch('/prime/auth/exchange', {method: 'POST', body: {code: 'x'}, auth: false})).rejects.toBeInstanceOf(ApiError)
        expect(onUnauthorized).toHaveBeenCalledOnce()
    })

    it('returns null for 204 and wraps network failures', async () => {
        mockFetch(204, null)
        expect(await apiFetch('/prime/votes/next')).toBeNull()

        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
        await expect(apiFetch('/prime/config')).rejects.toBeInstanceOf(NetworkError)
    })
})
