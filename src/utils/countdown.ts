/** Русское склонение: plural(5, ['день', 'дня', 'дней']) -> 'дней'. */
export function plural(n: number, [one, few, many]: readonly [string, string, string]): string {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
    return many
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Остаток до дедлайна словами: от суток — только дни («20 дней»), меньше суток — часы и минуты
 * («2 часа 15 минут»), меньше часа — минуты. null — время вышло.
 */
export function formatRemaining(ms: number): string | null {
    if (ms <= 0) return null
    const days = Math.floor(ms / DAY)
    if (days >= 1) return `${days} ${plural(days, ['день', 'дня', 'дней'])}`

    const hours = Math.floor(ms / HOUR)
    const minutes = Math.floor((ms % HOUR) / MINUTE)
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours} ${plural(hours, ['час', 'часа', 'часов'])}`)
    if (minutes > 0) parts.push(`${minutes} ${plural(minutes, ['минута', 'минуты', 'минут'])}`)
    return parts.length ? parts.join(' ') : 'меньше минуты'
}
