const getCookie = (name: string): string => {
    if (typeof document === 'undefined') {
        return ''
    }

    const value = `${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length > 1) {
        const lastPart = parts.pop()
        if (lastPart) {
            const cookieValue = lastPart.split(';').shift()
            return cookieValue || ''
        }
    }

    return ''
}
export default getCookie
