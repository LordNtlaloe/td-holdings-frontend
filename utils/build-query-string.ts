// utils/buildQueryString.ts
export function buildQueryString(
    filters: Record<string, any>
): string {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        params.append(key, String(value))
    })

    return params.toString()
}
