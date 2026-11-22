import {mount} from '@vue/test-utils'
import {expect, it, vi} from 'vitest'
import createPlayer from 'youtube-player'
import NominationPlayer from '@/components/vote/NominationPlayer.vue'

vi.mock('youtube-player', () => ({default: vi.fn()}))

it('cues the original segment after playback ends, including after a nominee jump', () => {
    const api = {on: vi.fn(), cueVideoById: vi.fn(), loadVideoById: vi.fn(), destroy: vi.fn()}
    vi.mocked(createPlayer).mockReturnValue(api as unknown as ReturnType<typeof createPlayer>)
    const wrapper = mount(NominationPlayer, {props: {
        url: 'https://youtu.be/example', start: 133, end: 238, title: 'Мем года',
    }})
    expect(createPlayer).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        videoId: 'example', playerVars: expect.objectContaining({start: 133, end: 238}),
    }))
    wrapper.vm.seek(200)
    wrapper.vm.seek(238)
    expect(api.loadVideoById).toHaveBeenCalledTimes(1)
    expect(api.loadVideoById).toHaveBeenCalledWith({videoId: 'example', startSeconds: 200, endSeconds: 238})
    const stateChange = api.on.mock.calls.find(([event]) => event === 'stateChange')![1]
    stateChange({data: 0})
    expect(api.cueVideoById).toHaveBeenCalledWith({videoId: 'example', startSeconds: 133, endSeconds: 238})
    wrapper.unmount()
    expect(api.destroy).toHaveBeenCalledOnce()
})
