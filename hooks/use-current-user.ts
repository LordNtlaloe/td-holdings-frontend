// hooks/useCurrentUser.ts
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

export const useCurrentUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Call your existing API route: /api/auth/profile
                const result = await api.getProfile();

                if (result.error) {
                    setError(result.error);
                    setUser(null);
                } else if (result.data) {
                    setUser(result.data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setError('Failed to load user data');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []); // Empty dependency array = fetch once on mount

    const refetch = async () => {
        try {
            setIsLoading(true);
            const result = await api.getProfile();
            if (result.data) {
                setUser(result.data);
            }
            return result.data;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        isLoading,
        error,
        refetch,
    };
};