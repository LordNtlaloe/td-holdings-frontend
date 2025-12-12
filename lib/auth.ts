// /lib/auth.ts

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Try to get from localStorage first
    const token = localStorage.getItem('token');
    if (token) return token;

    // Try to get from sessionStorage
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) return sessionToken;

    return null;
};

export const setToken = (token: string, rememberMe = false): void => {
    if (typeof window === 'undefined') return;

    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
};

export const clearToken = (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
};