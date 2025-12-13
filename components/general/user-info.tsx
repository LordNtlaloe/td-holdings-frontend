// components/general/user-info.tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type BasicUser } from '@/types'; // Use BasicUser for display components

interface UserInfoProps {
    user: BasicUser; // Changed to BasicUser
    showEmail?: boolean;
}

export function UserInfo({ user, showEmail = false }: UserInfoProps) {
    const getInitials = useInitials();
    const fallbackInitials = (user.email?.[0] || 'U').toUpperCase();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage
                    src={user.avatar || '/Images/TD-Logo.png'}
                    alt={user.firstName || 'User'}
                />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {user.firstName && user.lastName
                        ? getInitials(user)
                        : fallbackInitials}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {user.firstName || 'User'} {user.lastName || ''}
                </span>
                {showEmail && user.email && (
                    <span className="text-muted-foreground truncate text-xs">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}