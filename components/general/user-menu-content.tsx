// components/general/user-menu-content.tsx
"use client"

import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/general/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type BasicUser } from '@/types'; // Use BasicUser
import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserMenuContentProps {
    user: BasicUser; // Changed to BasicUser
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Logout failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('Logout result:', result);

            cleanup();
            router.push('/auth/login');
            router.refresh();

        } catch (error) {
            console.error('Logout error:', error);
            cleanup();
            router.push('/auth/login');
            router.refresh();
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href="/profile/edit"
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <div className="flex w-full items-center">
                    {isLoggingOut ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <LogOut className="mr-2" />
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                </div>
            </DropdownMenuItem>
        </DropdownMenuGroup>
    );
}