export interface Streamer {
    nickname: string
    avatar: string
    twitchLink: string
}

/** Путь к аватару по имени файла в src/assets/streamers (без расширения). */
export const avatarOf = (fileName: string): string =>
    new URL(`../assets/streamers/${fileName}.png`, import.meta.url).href