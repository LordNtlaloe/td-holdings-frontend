'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string | string[];
}

export function ProtectedRoute({
    children,
    requiredRole,
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const redirectUrl = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
            router.replace(redirectUrl);
        }
    }, [isAuthenticated, isLoading, redirect, router]);

    if (isLoading) {
        return null; // Or a minimal loading indicator
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (requiredRole && user) {
        const hasRole = Array.isArray(requiredRole)
            ? requiredRole.includes(user.role)
            : user.role === requiredRole;

        if (!hasRole) {
            router.replace('/unauthorized');
            return null;
        }
    }

    return <>{children}</>;
}