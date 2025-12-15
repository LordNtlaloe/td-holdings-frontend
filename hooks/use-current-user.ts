'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types';

/**
 * Hook to get the current authenticated user
 * @returns The current user object or null if not authenticated
 */
export const useCurrentUser = (): User | null => {
    const { user } = useAuth();
    return user;
};

/**
 * Hook to get extended user data by fetching from API
 * Useful when you need additional user information not in the auth context
 */
export const useExtendedCurrentUser = () => {
    const { user, accessToken } = useAuth();
    const [extendedUser, setExtendedUser] = useState<User | null>(user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExtendedUser = async () => {
            if (!user?.id || !accessToken) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`/api/users/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setExtendedUser(data);
                } else {
                    throw new Error('Failed to fetch user details');
                }
            } catch (err) {
                console.error('Error fetching extended user:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExtendedUser();
    }, [user?.id, accessToken]);

    return { user: extendedUser, isLoading, error };
};