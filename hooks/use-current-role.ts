// hooks/useUserRole.ts
'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export const useCurrentRole = () => {
    const { user, isLoading } = useAuth();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role) {
            setRole(user.role);
        } else {
            setRole(null);
        }
    }, [user]);

    // Quick role check helpers
    const ADMIN = role === 'ADMIN';
    const MANAGER = role === 'MANAGER';
    const CASHIER = role === 'CASHIER';
    const INVENTORY_MANAGER = role === 'INVENTORY_MANAGER';

    return {
        role,
        isLoading,
        ADMIN,
        MANAGER,
        CASHIER,
        INVENTORY_MANAGER,
    };
};