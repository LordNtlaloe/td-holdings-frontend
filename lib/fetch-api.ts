// /lib/fetch-api.ts
export async function fetchAPI(
    endpoint: string,
    options: RequestInit = {},
    includeCookies = true
) {
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    if (includeCookies) {
        config.credentials = 'include'; // This automatically includes cookies
    }

    try {
        const response = await fetch(endpoint, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API Error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}