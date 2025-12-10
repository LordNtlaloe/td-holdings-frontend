// hooks/useUserRole.ts
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export const useUserRole = () => {
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                setIsLoading(true);
                const result = await api.getProfile();
                if (result.data?.role) {
                    setRole(result.data.role);
                }
            } catch (error) {
                console.error('Failed to fetch user role:', error);
                setRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRole();
    }, []);

    // Quick role check helpers
    const isAdmin = role === 'ADMIN';
    const isManager = role === 'MANAGER';
    const isCashier = role === 'CASHIER';

    return {
        role,
        isLoading,
        isAdmin,
        isManager,
        isCashier,
    };
};