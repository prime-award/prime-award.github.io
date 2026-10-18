// Типы ответов бэкенда (routes/dto/Dtos.kt). Медиа-поля (*Path) — пути от корня сайта, см. utils/media.ts.

export type NominationType = 'STREAMER' | 'MOMENT'

export interface Nominee {
    id: number
    slug: string
    type: NominationType
    name: string
    photoPath: string | null
    link: string | null
    /** MOMENT: кто участвует */
    participants: string | null
    /** MOMENT: отдельное видео момента */
    videoUrl: string | null
    /** MOMENT: где момент в общем видео номинации */
    timecodeSeconds: number | null
}

export interface NominationBrief {
    id: number
    slug: string
    position: number
    type: NominationType
    name: string
    description: string
    iconPath: string | null
}

export interface Nomination extends NominationBrief {
    videoUrl: string | null
    videoPosterPath: string | null
    nominees: Nominee[]
}

export interface Page<T> {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    items: T[]
}

export interface Provider {
    id: string
    title: string
    enabled: boolean
}

export interface AppConfig {
    votingEndsAt: string
    votingOpen: boolean
    devLogin: boolean
    providers: Provider[]
}

export interface User {
    id: number
    platform: 'TWITCH' | 'KICK' | 'VK' | 'DEV'
    login: string
    displayName: string
    avatarUrl: string | null
    nameColor: string | null
}

export interface Session {
    token: string
    expiresAt: string
    user: User
    redirectPath: string
}

export interface Vote {
    nominationId: number
    nomineeId: number
    createdAt: string
}

export interface MyVotes {
    totalNominations: number
    votes: Vote[]
}

export interface VotedNomination {
    nomination: NominationBrief
    nominee: Nominee
    votedAt: string
}

export interface MyNominations {
    totalNominations: number
    voted: VotedNomination[]
    unvoted: NominationBrief[]
}

export interface NomineeStats {
    nominee: Nominee
    votes: number
    percent: number
}

export interface NominationStats {
    nomination: NominationBrief
    votes: number
    nominees: NomineeStats[]
}

export interface Stats {
    users: number
    voters: number
    votes: number
    nominations: NominationStats[]
}
