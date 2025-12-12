// utils/storage.ts

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    emailVerified?: Date | null;
    store?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
    };
    employee?: {
        id: string;
        position: string;
    };
}

// Storage utility functions
export const storage = {
    getAccessToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    },

    getRefreshToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('refreshToken');
        }
        return null;
    },

    getUser: (): User | null => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            try {
                return user ? JSON.parse(user) : null;
            } catch (error) {
                console.error('Failed to parse user from storage:', error);
                return null;
            }
        }
        return null;
    },

    setAccessToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    },

    setRefreshToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', token);
        }
    },

    setUser: (user: User): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    clearAll: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    // Additional utility methods
    clear: (key: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },

    get: (key: string): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },

    set: (key: string, value: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    }
};