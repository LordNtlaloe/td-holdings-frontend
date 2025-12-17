// app/(auth)/layout.tsx
'use client';

import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; description: string }> = {
    '/login': {
        title: 'Login',
        description: 'Sign in to your account',
    },
    '/register': {
        title: 'Register',
        description: 'Create a new account',
    },
    '/forgot-password': {
        title: 'Forgot Password',
        description: 'Reset your password',
    },
    '/reset-password': {
        title: 'Reset Password',
        description: 'Set a new password',
    },
};

export default function AuthLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { title, description } = pageTitles[pathname] || {
        title: 'Authentication',
        description: 'Manage your account',
    };

    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
        >
            {children}
        </AuthLayoutTemplate>
    );
}