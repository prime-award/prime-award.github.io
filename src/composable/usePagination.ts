import {computed, ref, watch, type Ref} from 'vue'

/** Клиентская пагинация списка: страницы с 1, номер страницы не выходит за границы при изменении списка. */
export function usePagination<T>(items: Ref<readonly T[]>, pageSize: number) {
    const page = ref(1)
    const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))
    const pageItems = computed(() => items.value.slice((page.value - 1) * pageSize, page.value * pageSize))

    watch(totalPages, (total) => {
        if (page.value > total) page.value = total
    })

    function setPage(next: number) {
        page.value = Math.min(Math.max(1, next), totalPages.value)
    }

    return {page, totalPages, pageItems, setPage}
}
