import {describe, expect, it} from 'vitest'
import {nextTick, ref} from 'vue'
import {usePagination} from '@/composable/usePagination.ts'

describe('usePagination', () => {
    it('slices by page size and clamps the page', async () => {
        const items = ref(Array.from({length: 14}, (_, i) => i))
        const {page, totalPages, pageItems, setPage} = usePagination(items, 6)
        expect(totalPages.value).toBe(3)
        expect(pageItems.value).toEqual([0, 1, 2, 3, 4, 5])
        setPage(3)
        expect(pageItems.value).toEqual([12, 13])
        setPage(10)
        expect(page.value).toBe(3)

        // список стал короче (проголосовали) — страница сдвигается внутрь диапазона
        items.value = items.value.slice(0, 5)
        await nextTick()
        expect(page.value).toBe(1)
        expect(totalPages.value).toBe(1)
    })

    it('an empty list has one empty page', () => {
        const {totalPages, pageItems} = usePagination(ref<number[]>([]), 6)
        expect(totalPages.value).toBe(1)
        expect(pageItems.value).toEqual([])
    })
})
