/**
 * Состояние карточки номинанта (по макету «состояния карт»):
 * idle — обычная; active — выбрана, ждёт подтверждения (фото размыто, кнопка поверх);
 * selected — голос отдан за неё; dimmed — голос отдан за другого, карточка неактивна.
 */
export type CardState = 'idle' | 'active' | 'selected' | 'dimmed'

/** 83 -> "01:23", 3725 -> "1:02:05" */
export function formatTimecode(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = String(s % 60).padStart(2, '0')
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${String(m).padStart(2, '0')}:${sec}`
}
