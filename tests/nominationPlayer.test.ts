import {mount} from '@vue/test-utils'
import {expect, it, vi} from 'vitest'
import createPlayer from 'youtube-player'
import NominationPlayer from '@/components/vote/NominationPlayer.vue'

vi.mock('youtube-player', () => ({default: vi.fn()}))

it('cues the original segment after playback ends, including after a nominee jump', () => {
    const api = {on: vi.fn(), cueVideoById: vi.fn(), loadVideoById: vi.fn(), destroy: vi.fn()}
    vi.mocked(createPlayer).mockReturnValue(api as unknown as ReturnType<typeof createPlayer>)
    const wrapper = mount(NominationPlayer, {props: {
        url: 'https://www.youtube.com/watch?v=777Kux6CqFc', start: 133, end: 238, title: 'Мем года',
    }})
    const frame = wrapper.get('iframe').element
    const embed = new URL(frame.src)
    expect(embed.origin + embed.pathname).toBe('https://www.youtube.com/embed/777Kux6CqFc')
    expect(Object.fromEntries(embed.searchParams)).toMatchObject({start: '133', end: '238', enablejsapi: '1'})
    expect(createPlayer).toHaveBeenCalledWith(frame)
    wrapper.vm.seek(200)
    wrapper.vm.seek(238)
    expect(api.loadVideoById).toHaveBeenCalledTimes(1)
    expect(api.loadVideoById).toHaveBeenCalledWith({videoId: '777Kux6CqFc', startSeconds: 200, endSeconds: 238})
    const stateChange = api.on.mock.calls.find(([event]) => event === 'stateChange')![1]
    stateChange({data: 0})
    expect(api.cueVideoById).toHaveBeenCalledWith({videoId: '777Kux6CqFc', startSeconds: 133, endSeconds: 238})
    wrapper.unmount()
    expect(api.destroy).toHaveBeenCalledOnce()
})

it('keeps the iframe visible when the API script fails and links to YouTube on playback errors', async () => {
    const api = {on: vi.fn(), destroy: vi.fn()}
    vi.mocked(createPlayer).mockReturnValue(api as unknown as ReturnType<typeof createPlayer>)
    const url = 'https://youtu.be/777Kux6CqFc'
    const wrapper = mount(NominationPlayer, {props: {url, start: 133, end: 238, title: 'Мем года'}})
    const onError = api.on.mock.calls.find(([event]) => event === 'error')![1]
    onError(new Error('script unavailable'))
    await wrapper.vm.$nextTick()
    expect(wrapper.get('iframe').isVisible()).toBe(true)
    onError({data: 101})
    await wrapper.vm.$nextTick()
    expect(wrapper.get('a').attributes('href')).toBe(url)
    expect(wrapper.get('iframe').element.style.display).toBe('none')
    wrapper.unmount()
})
