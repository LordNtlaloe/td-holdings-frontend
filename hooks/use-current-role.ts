'use client';

import { useAuth } from '@/contexts/auth-context';
import { Role } from '@/types';

/**
 * Hook to get the current user's role
 * @returns The current user's role or undefined if not authenticated
 */
export const useCurrentRole = (): Role | undefined => {
    const { user } = useAuth();
    return user?.role;
};