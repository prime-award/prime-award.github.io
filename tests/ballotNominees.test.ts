import {describe, expect, it} from 'vitest'
import type {Nomination, Nominee} from '@/api'
import {ballotNominees} from '@/components/vote/ballotNominees'

const nominees: Nominee[] = [20, null, 0, 5, 5, null].map((timecodeSeconds, id) => ({
    id, slug: String(id), name: String(id), type: 'STREAMER', participants: null, photoPath: null, timecodeSeconds,
}))
const nomination: Nomination = {
    id: 1, slug: 'test', position: 1, type: 'STREAMER', name: '', description: '', iconPath: null,
    videoUrl: null, videoStartSeconds: null, videoEndSeconds: null, videoPosterPath: null, nominees,
}

describe('ballotNominees', () => {
    it('reproduces the order from the seed and nominee IDs without mutating the catalog', () => {
        const ordered = ballotNominees(nomination, 0)
        expect(ordered).toEqual(ballotNominees({...nomination, nominees: [...nominees].reverse()}, 0))
        expect(ordered).not.toEqual(ballotNominees(nomination, 42))
        expect(new Set(ordered)).toEqual(new Set(nominees))
        expect(nominees.map(n => n.id)).toEqual([0, 1, 2, 3, 4, 5])
    })

    it.each([{type: 'MOMENT' as const}, {videoUrl: '/video.mp4'}])('orders videos by time for any seed', video => {
        for (const seed of [null, 0, 42]) {
            expect(ballotNominees({...nomination, ...video}, seed).map(n => n.id)).toEqual([2, 3, 4, 0, 1, 5])
        }
    })
})
