'use client';

import { useCallback } from 'react';
import { User } from '@/types';
import { useAuth } from '@/contexts/auth-context';

/**
 * Hook to generate user initials
 * @returns A function that takes a user object and returns their initials
 */
export function useInitials() {
    return useCallback((user?: User | null): string => {
        if (!user) return '';

        const firstName = user.firstName?.trim() || '';
        const lastName = user.lastName?.trim() || '';

        if (!firstName && !lastName) return '';

        const firstInitial = firstName.charAt(0).toUpperCase();
        const lastInitial = lastName.charAt(0).toUpperCase();

        return `${firstInitial}${lastInitial}`;
    }, []);
}

/**
 * Hook to get the current user's initials
 * @returns The current user's initials or empty string if not authenticated
 */
export function useCurrentUserInitials(): string {
    const { user } = useAuth();
    const getInitials = useInitials();
    return getInitials(user);
}