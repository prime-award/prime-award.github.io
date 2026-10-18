import {describe, expect, it} from 'vitest'
import {mediaUrl} from '@/utils/media.ts'
import {formatTimecode} from '@/components/nominations/cardState.ts'

describe('mediaUrl', () => {
    it('prefixes relative media paths with the site base', () => {
        expect(mediaUrl('media/nominees/arrowwoods.webp')).toBe('/media/nominees/arrowwoods.webp')
        expect(mediaUrl('/media/x.png')).toBe('/media/x.png')
    })

    it('keeps absolute urls and handles empty values', () => {
        expect(mediaUrl('https://static-cdn.jtvnw.net/a.png')).toBe('https://static-cdn.jtvnw.net/a.png')
        expect(mediaUrl('data:image/png;base64,xx')).toBe('data:image/png;base64,xx')
        expect(mediaUrl(null)).toBeUndefined()
        expect(mediaUrl('')).toBeUndefined()
    })
})

describe('formatTimecode', () => {
    it('formats minutes and hours', () => {
        expect(formatTimecode(0)).toBe('00:00')
        expect(formatTimecode(83)).toBe('01:23')
        expect(formatTimecode(3725)).toBe('1:02:05')
    })
})

import {parseVideoSource} from '@/components/vote/videoSource.ts'

describe('parseVideoSource', () => {
    it('recognises files, youtube and twitch', () => {
        expect(parseVideoSource('media/video/a.mp4')).toEqual({kind: 'file', src: '/media/video/a.mp4'})
        expect(parseVideoSource('https://www.youtube.com/watch?v=abc_123')).toEqual({kind: 'youtube', id: 'abc_123'})
        expect(parseVideoSource('https://youtu.be/xyz')).toEqual({kind: 'youtube', id: 'xyz'})
        expect(parseVideoSource('https://www.twitch.tv/streamer/clip/FunnyClip-1')).toEqual({kind: 'twitch-clip', slug: 'FunnyClip-1'})
        expect(parseVideoSource('https://www.twitch.tv/videos/123456')).toEqual({kind: 'twitch-video', id: '123456'})
        expect(parseVideoSource(null)).toBeNull()
    })
})
