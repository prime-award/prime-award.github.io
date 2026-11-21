import {readonly, ref} from 'vue'

const isOpen = ref(false)
// куда вернуть пользователя после входа (путь внутри сайта)
const redirectPath = ref('/')

/** Окно входа поверх любого экрана. Открывается кнопками «Войти», «Выбрать», «Проголосовать». */
export function useLoginModal() {
    function open(redirect?: string) {
        redirectPath.value = redirect ?? window.location.pathname + window.location.search
        isOpen.value = true
    }

    function close() {
        isOpen.value = false
    }

    return {isOpen: readonly(isOpen), redirectPath: readonly(redirectPath), open, close}
}
