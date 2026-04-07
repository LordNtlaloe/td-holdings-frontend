'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    Download,
    Store,
    BarChart3,
    Loader2
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

import EmployeeAPI from '@/lib/api/employees'; // Fixed import path
import SalesDashboardAPI, { DashboardSummary } from '@/lib/api/sales-dashboard';
import { DateRangePicker } from '@/components/sales/common/date-range-picker';
import { EmployeeStats } from '@/types';
import { InventorySummary } from './inventory-summary';
import { StaffPerformance } from './staff-performance';
import { StorePerformanceChart } from './store-performance-chart';
import { TopProducts } from './top-products';
import { SalesMetrics } from './sales-metrics'; // Import SalesMetrics
import { useAuth } from '@/contexts/auth-context';

export function ManagerDashboard() {
    const { accessToken } = useAuth();
    const [stats, setStats] = useState<EmployeeStats | null>(null);
    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Add state for date range
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date()
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!accessToken) return;

            try {
                const [employeeStats, summary] = await Promise.all([
                    EmployeeAPI.getEmployeeStats(accessToken),
                    SalesDashboardAPI.getSummary(accessToken)
                ]);

                setStats(employeeStats);
                setDashboardSummary(summary);
            } catch (error) {
                console.error('Failed to fetch manager dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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
                <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                <div className="flex items-center gap-2">
                    <DateRangePicker 
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                    />
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    LSL {dashboardSummary?.month?.revenue?.toLocaleString() || '0'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardSummary?.month?.growth || 0}% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeEmployees || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.onLeave || 0} on leave today
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">LSL 2.4M</div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardSummary?.lowStockAlerts || 0} items low stock
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Stores</CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.byStore?.length || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all locations
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Sales Overview</CardTitle>
                                <CardDescription>Store performance across all locations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StorePerformanceChart token={accessToken || ''} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Top Products</CardTitle>
                                <CardDescription>Best selling items this week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopProducts token={accessToken || ''} period="week" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <StaffPerformance token={accessToken || ''} />
                        <InventorySummary token={accessToken || ''} />
                    </div>
                </TabsContent>

                <TabsContent value="sales">
                    <SalesMetrics token={accessToken || ''} dateRange={dateRange} />
                </TabsContent>

                <TabsContent value="inventory">
                    <InventorySummary token={accessToken || ''} detailed />
                </TabsContent>

                <TabsContent value="staff">
                    <StaffPerformance token={accessToken || ''} detailed />
                </TabsContent>

                <TabsContent value="reports">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Generate Reports</CardTitle>
                                <CardDescription>Export sales, inventory, or staff reports</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/reports/sales">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Sales Report
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/reports/inventory">
                                        <Package className="mr-2 h-4 w-4" />
                                        Inventory Report
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href="/reports/staff">
                                        <Users className="mr-2 h-4 w-4" />
                                        Staff Performance
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Reports</CardTitle>
                                <CardDescription>Common reports for quick access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/reports/daily-sales">
                                            Daily Sales Summary
                                        </a>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/reports/low-stock">
                                            Low Stock Report
                                        </a>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/reports/staff-hours">
                                            Staff Hours Summary
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}