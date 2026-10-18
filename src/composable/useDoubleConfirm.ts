import {getCurrentInstance, onBeforeUnmount, readonly, ref} from 'vue'

/**
 * Подтверждение двойным нажатием: действие срабатывает, только если кнопку нажали дважды
 * в пределах [windowMs]. Своя логика вместо нативного dblclick: тот ненадёжен на iOS и с клавиатуры
 * (Enter дважды тоже работает). armed = true между первым и вторым нажатием — для подсказки.
 */
export function useDoubleConfirm(windowMs = 500) {
    const armed = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined

    function reset() {
        clearTimeout(timer)
        armed.value = false
    }

    /** true — это второе нажатие в окне, пора выполнять действие. */
    function press(): boolean {
        if (armed.value) {
            reset()
            return true
        }
        armed.value = true
        clearTimeout(timer)
        timer = setTimeout(() => (armed.value = false), windowMs)
        return false
    }

    if (getCurrentInstance()) onBeforeUnmount(reset)

    return {armed: readonly(armed), press, reset}
}
