/** Сохранить blob/dataURL как файл (браузерная загрузка через <a download>). */
export function downloadFile(href: string, fileName: string) {
    const link = document.createElement('a')
    link.href = href
    link.download = fileName
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
}

/** Имя файла без опасных символов. */
export function safeFileName(value: string): string {
    return value.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'prime'
}
