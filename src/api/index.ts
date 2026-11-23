import {API_URL, apiFetch} from './client.ts'
import type {AppConfig, LoginProviderId, MyNominations, MyVotes, Nomination, NominationBrief, Page, Session, Stats, User, Vote} from './types.ts'

export * from './client.ts'
export type * from './types.ts'

export const api = {
    config: () => apiFetch<AppConfig>('/prime/config', {auth: false}),

    nominationsPage: (page: number, size = 4) =>
        apiFetch<Page<Nomination>>(`/prime/nominations?page=${page}&size=${size}`, {auth: false}),
    nominationsSummary: () => apiFetch<NominationBrief[]>('/prime/nominations/summary', {auth: false}),
    nomination: (id: number) => apiFetch<Nomination>(`/prime/nominations/${id}`, {auth: false}),

    exchange: (code: string) => apiFetch<Session>('/prime/auth/exchange', {method: 'POST', body: {code}, auth: false}),
    logout: () => apiFetch<null>('/prime/auth/logout', {method: 'POST'}),

    me: () => apiFetch<User>('/prime/me'),
    myVotes: () => apiFetch<MyVotes>('/prime/me/votes'),
    myNominations: () => apiFetch<MyNominations>('/prime/me/nominations'),

    vote: (nominationId: number, nomineeId: number) =>
        apiFetch<Vote>('/prime/votes', {method: 'POST', body: {nominationId, nomineeId}}),
    /** null — непроголосованных номинаций не осталось */
    nextUnvoted: (after?: number) =>
        apiFetch<Nomination | null>('/prime/votes/next' + (after ? `?after=${after}` : '')),

    adminStats: () => apiFetch<Stats>('/prime/admin/stats'),
    devStats: () => apiFetch<Stats>('/prime/dev/stats', {auth: false}),
}

/**
 * Начало OAuth-входа: браузер уходит на бэкенд, оттуда на провайдера и обратно на /auth/callback.
 * origin — адрес сайта (с base, если сайт в подпапке), куда вернуть; бэкенд проверяет его по белому списку.
 */
export function loginUrl(provider: LoginProviderId, redirectPath: string): string {
    const origin = window.location.origin + import.meta.env.BASE_URL.replace(/\/+$/, '')
    const params = new URLSearchParams({redirect: redirectPath, origin})
    return `${API_URL}/prime/auth/${encodeURIComponent(provider)}/login?${params}`
}
