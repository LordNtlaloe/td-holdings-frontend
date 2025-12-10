// utils/storage.ts
import { User } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

export const storage = {
    // Token management
    getAccessToken: (): string | null => {
        if (!isBrowser) return null;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken: (token: string): void => {
        if (!isBrowser) return;
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    removeAccessToken: (): void => {
        if (!isBrowser) return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: (): string | null => {
        if (!isBrowser) return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken: (token: string): void => {
        if (!isBrowser) return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    removeRefreshToken: (): void => {
        if (!isBrowser) return;
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    // User management
    getUser: (): User | null => {
        if (!isBrowser) return null;
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser: (user: User): void => {
        if (!isBrowser) return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser: (): void => {
        if (!isBrowser) return;
        localStorage.removeItem(USER_KEY);
    },

    // Clear all auth data
    clearAll: (): void => {
        if (!isBrowser) return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Check if user data exists
    hasAuthData: (): boolean => {
        if (!isBrowser) return false;
        return !!localStorage.getItem(ACCESS_TOKEN_KEY) && !!localStorage.getItem(USER_KEY);
    }
};