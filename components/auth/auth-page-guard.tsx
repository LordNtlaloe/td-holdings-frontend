'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthRedirect } from '@/context/auth-context';

interface AuthPageGuardProps {
    children: ReactNode;
}

export function AuthPageGuard({ children }: AuthPageGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const redirectPath = useAuthRedirect();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(redirectPath);
        }
    }, [isAuthenticated, isLoading, redirectPath, router]);

    if (isLoading) {
        return null; // Or a minimal loading indicator
    }

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return null; // Will redirect in useEffect
}