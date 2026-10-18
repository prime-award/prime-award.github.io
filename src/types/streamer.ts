import {mediaUrl} from '../utils/media.ts'

export interface Streamer {
    nickname: string
    avatar: string
    twitchLink: string
}

/** Путь к аватару по имени файла в public/media/nominees (без расширения). */
export const avatarOf = (fileName: string): string => mediaUrl(`media/nominees/${fileName}.webp`)!
