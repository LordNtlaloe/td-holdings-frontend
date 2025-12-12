import { useCallback } from 'react';

export function useInitials() {
    return useCallback((user?: { firstName?: string; lastName?: string }): string => {
        if (!user) return '';

        const firstName = user.lastName?.trim() || '';
        const lastName = user.lastName?.trim() || '';

        if (!firstName && !lastName) return '';

        const firstInitial = firstName.charAt(0).toUpperCase();
        const lastInitial = lastName.charAt(0).toUpperCase();

        return `${firstInitial}${lastInitial}`;
    }, []);
}