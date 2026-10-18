import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useDoubleConfirm} from '@/composable/useDoubleConfirm.ts'

describe('useDoubleConfirm', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('fires only on the second press within the window', () => {
        const {press, armed} = useDoubleConfirm(500)
        expect(press()).toBe(false)
        expect(armed.value).toBe(true)
        vi.advanceTimersByTime(300)
        expect(press()).toBe(true)
        expect(armed.value).toBe(false)
    })

    it('a slow second press starts over', () => {
        const {press, armed} = useDoubleConfirm(500)
        expect(press()).toBe(false)
        vi.advanceTimersByTime(600)
        expect(armed.value).toBe(false)
        expect(press()).toBe(false)
        expect(press()).toBe(true)
    })

    it('reset disarms', () => {
        const {press, reset} = useDoubleConfirm(500)
        press()
        reset()
        expect(press()).toBe(false)
    })
})
