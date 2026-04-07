// app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { UserDetails } from '@/components/users/user-details';
import { UsersFilters } from '@/components/users/users-filter';
import { UsersTable } from '@/components/users/users-table';
import { useAuth } from '@/contexts/auth-context';

export default function UsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const response = await res.json();

            // The backend returns { data: [...], meta: {...} }
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchUsers();
        }
    }, [accessToken]);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive) ||
            (statusFilter === 'inactive' && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setDetailsOpen(true);
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <UsersFilters
                        search={search}
                        onSearchChange={setSearch}
                        roleFilter={roleFilter}
                        onRoleFilterChange={setRoleFilter}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        onRefresh={fetchUsers}
                    />

                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <UsersTable
                            users={filteredUsers}
                            onViewDetails={handleViewDetails}
                        />
                    )}

                    {filteredUsers.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found
                        </div>
                    )}
                </CardContent>
            </Card>

            <UserDetails
                user={selectedUser}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    );
}