import {flushPromises, mount} from '@vue/test-utils'
import {expect, it, vi} from 'vitest'
import LoginModal from '@/components/auth/LoginModal.vue'
import {useLoginModal} from '@/composable/useLoginModal'

it('only shows supported login providers when the API still advertises VK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
        votingEndsAt: '2026-12-31T00:00:00Z',
        votingOpen: true,
        devLogin: true,
        providers: [
            {id: 'twitch', title: 'Twitch', enabled: true},
            {id: 'kick', title: 'Kick', enabled: true},
            {id: 'vk', title: 'VK Video Live', enabled: true},
        ],
    }))))
    const modal = useLoginModal()
    const wrapper = mount(LoginModal, {global: {stubs: {teleport: true}}})

    try {
        modal.open('/')
        await flushPromises()

        const buttons = wrapper.findAll('button[data-provider]')
        expect(buttons.map((button) => button.attributes('data-provider'))).toEqual(['twitch', 'kick', 'dev'])
        expect(buttons.every((button) => button.attributes('disabled') === undefined)).toBe(true)
    } finally {
        modal.close()
        await flushPromises()
        wrapper.unmount()
        vi.unstubAllGlobals()
    }
})
