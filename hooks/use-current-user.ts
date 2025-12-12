'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/auth';

export const useCurrentUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call your API route directly
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Failed to fetch user');
                setUser(null);
            } else {
                setUser(result.data || result);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            setError('Failed to load user data');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []); // Empty dependency array = fetch once on mount

    const refetch = async () => {
        await fetchUser();
        return user;
    };

    return {
        user,
        isLoading,
        error,
        refetch,
    };
};