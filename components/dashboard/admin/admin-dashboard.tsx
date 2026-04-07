'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Users,
    Building2,
    Package,
    DollarSign,
    TrendingUp,
    Download,
    Settings,
    Shield,
    Activity,
    Loader2
} from 'lucide-react';

import EmployeeAPI from '@/lib/api/employees';
import StoreAPI from '@/lib/api/stores';
import ProductAPI from '@/lib/api/products';
import type { EmployeeStats } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { SystemHealth } from './system-health';
import { UserManagement } from './user-management';
import { StoreOverview } from './stores-overview';

export function AdminDashboard() {
    const { accessToken } = useAuth();
    const [stats, setStats] = useState<EmployeeStats | null>(null);
    const [storeCount, setStoreCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!accessToken) return;

            try {
                const [employeeStats, stores, products] = await Promise.all([
                    EmployeeAPI.getEmployeeStats(accessToken),
                    StoreAPI.getStores(accessToken, { limit: 1 }),
                    ProductAPI.getProducts(accessToken, { limit: 1 })
                ]);

                setStats(employeeStats);
                setStoreCount(stores.total || 0);
                setProductCount(products.meta?.total || 0);
            } catch (error) {
                console.error('Failed to fetch admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [accessToken]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        System Settings
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Backup Data
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="stores">Stores</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.activeEmployees || 0} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Stores</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{storeCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.byStore?.length || 0} with inventory
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Products</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{productCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all stores
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">98%</div>
                                <p className="text-xs text-muted-foreground">
                                    All systems operational
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                                <CardDescription>Real-time system metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SystemHealth token={accessToken || ''} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Administrative tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/admin/users/new">
                                        <Users className="mr-2 h-4 w-4" />
                                        Create New User
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/admin/stores/new">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Add New Store
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/admin/roles">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Manage Roles
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/admin/backup">
                                        <Download className="mr-2 h-4 w-4" />
                                        System Backup
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <UserManagement token={accessToken || ''} limit={5} />
                        <StoreOverview token={accessToken || ''} />
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <UserManagement token={accessToken || ''} />
                </TabsContent>

                <TabsContent value="stores">
                    <StoreOverview token={accessToken || ''} detailed />
                </TabsContent>

                <TabsContent value="system">
                    <SystemHealth token={accessToken || ''} detailed />
                </TabsContent>
            </Tabs>
        </div>
    );
}