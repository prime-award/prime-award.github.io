import type {Nomination} from '@/api'

// 32-битная финализация MurmurHash3 даёт каждому ID воспроизводимый ранг.
function rank(id: number, seed: number) {
    let value = id ^ seed
    value = Math.imul(value ^ (value >>> 16), 0x85ebca6b)
    value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35)
    return (value ^ (value >>> 16)) >>> 0
}

export function ballotNominees(nomination: Nomination, seed: number | null) {
    const {nominees} = nomination
    if (nomination.type === 'MOMENT' || nomination.videoUrl) {
        return [...nominees].sort((a, b) => (a.timecodeSeconds ?? Infinity) - (b.timecodeSeconds ?? Infinity))
    }
    if (seed === null) return nominees
    const nominationSeed = rank(nomination.id, seed)
    return [...nominees].sort((a, b) => rank(a.id, nominationSeed) - rank(b.id, nominationSeed) || a.id - b.id)
}
