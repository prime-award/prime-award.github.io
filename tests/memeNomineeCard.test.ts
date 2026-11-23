import {mount} from '@vue/test-utils'
import {expect, it} from 'vitest'
import type {Nominee} from '@/api'
import MemeNomineeCard from '@/components/nominations/MemeNomineeCard.vue'

const nominee: Nominee = {
    id: 316,
    slug: 'prime-2026-mem-02',
    type: 'MOMENT',
    name: 'Зио - куколд',
    photoPath: 'media/nominees/zio310.webp',
    participants: 'Зио',
    timecodeSeconds: 140,
}

it('renders the full meme name and timecode without portrait or participants', () => {
    const wrapper = mount(MemeNomineeCard, {props: {nominee}})
    expect(wrapper.get('article').text()).toBe(nominee.name)
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('.meme-card__timing').text()).toBe('02:20')
})

it('keeps video seeking separate from vote confirmation', async () => {
    const wrapper = mount(MemeNomineeCard, {
        props: {nominee, timing: 140, state: 'active', actionLabel: 'Подтвердить голос'},
    })
    await wrapper.get('button[aria-label="Смотреть момент с 02:20"]').trigger('click')
    expect(wrapper.emitted('seek')).toEqual([[140]])
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.get('article button').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.find('.meme-card__timing').exists()).toBe(false)
})

it('omits a missing or legacy zero timecode', () => {
    for (const timecodeSeconds of [null, 0]) {
        const wrapper = mount(MemeNomineeCard, {props: {nominee: {...nominee, timecodeSeconds}}})
        expect(wrapper.text()).toBe(nominee.name)
    }
})
