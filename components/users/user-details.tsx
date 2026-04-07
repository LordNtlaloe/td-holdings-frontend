// app/users/components/user-details.tsx
'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Role, User } from '@/types';

interface UserDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onEdit?: () => void;
}

export function UserDetails({ open, onOpenChange, user, onEdit }: UserDetailsProps) {
    if (!user) return null;

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-131.25">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                        Detailed information about the user account.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 py-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-semibold">
                            {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={
                                user.role === Role.ADMIN ? 'destructive' :
                                    user.role === Role.MANAGER ? 'default' : 'secondary'
                            }>
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">User ID</TableCell>
                            <TableCell>{user.id}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Last Login</TableCell>
                            <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Member Since</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Last Updated</TableCell>
                            <TableCell>{formatDate(user.updatedAt)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {onEdit && (
                    <div className="flex justify-end">
                        <Button onClick={onEdit}>Edit User</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}