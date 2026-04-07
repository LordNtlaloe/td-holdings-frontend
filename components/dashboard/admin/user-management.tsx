'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Shield,
    UserCog,
    Loader2,
    MoreHorizontal
} from 'lucide-react';
import EmployeeAPI from '@/lib/api/employees';
import { formatDate, getInitials } from '@/lib/utils';
import type { Employee } from '@/types';

interface UserManagementProps {
    token: string;
    limit?: number;
}

export function UserManagement({ token, limit }: UserManagementProps) {
    const [users, setUsers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await EmployeeAPI.getEmployees(token, {
                    limit: limit || 50
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token, limit]);

    const filteredUsers = users.filter(user =>
        user.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        user.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        user.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.position?.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        const variants: Record<string, string> = {
            'ADMIN': 'bg-red-100 text-red-800',
            'MANAGER': 'bg-blue-100 text-blue-800',
            'CASHIER': 'bg-green-100 text-green-800'
        };
        return variants[role] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'ACTIVE': 'bg-green-100 text-green-800',
            'INACTIVE': 'bg-gray-100 text-gray-800',
            'ON_LEAVE': 'bg-yellow-100 text-yellow-800',
            'TERMINATED': 'bg-red-100 text-red-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const displayUsers = limit ? filteredUsers.slice(0, limit) : filteredUsers;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8 w-62.5"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Hire Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {getInitials(user.user?.firstName, user.user?.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {user.user?.firstName} {user.user?.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getRoleBadge(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.position}</TableCell>
                                    <TableCell>{user.store?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusBadge(user.status)}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(user.hireDate)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {limit && users.length > limit && (
                    <div className="mt-4 text-center">
                        <Button variant="link" asChild>
                            <a href="/admin/users">View all users →</a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}