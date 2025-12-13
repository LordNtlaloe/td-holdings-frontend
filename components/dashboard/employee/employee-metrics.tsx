// components/dashboard/employees/metrics-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    UserPlus,
    Calendar,
    BarChart3,
    Target,
    Award,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { Employee, UserRole } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getAllEmployees, getEmployeesByStore } from '@/lib/employee-api';

interface MetricsDashboardProps {
    storeId?: string;
}

export default function MetricsDashboard({ storeId }: MetricsDashboardProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [roleDistribution, setRoleDistribution] = useState<Record<UserRole, number>>({
        ADMIN: 0,
        MANAGER: 0,
        CASHIER: 0
    });

    useEffect(() => {
        loadMetrics();
    }, [storeId, timeRange]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            let employeesData: Employee[] = [];

            if (storeId) {
                const result = await getEmployeesByStore(storeId);
                if (result.success && result.data) {
                    employeesData = result.data;
                }
            } else {
                employeesData = await getAllEmployees();
            }

            setEmployees(employeesData);

            // Calculate role distribution
            const distribution: Record<UserRole, number> = { ADMIN: 0, MANAGER: 0, CASHIER: 0 };
            // employeesData.forEach(emp => {
            //     const role = emp.user?.role || 'CASHIER';
            //     distribution[role] = (distribution[role] || 0) + 1;
            // });
            setRoleDistribution(distribution);

        } catch (error) {
            console.error('Failed to load metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mt-2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Calculate metrics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.user?.isActive !== false).length;
    const inactiveEmployees = employees.filter(e => e.user?.isActive === false).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newEmployees = employees.filter(e => new Date(e.createdAt) > thirtyDaysAgo).length;

    const totalSales = employees.reduce((sum, emp) => sum + (emp.salesCount || 0), 0);
    const avgSalesPerEmployee = totalEmployees > 0 ? totalSales / totalEmployees : 0;

    const totalRevenue = employees.reduce((sum, emp) => {
        const revenue = emp.performance?.last30Days?.totalRevenue || 0;
        return sum + revenue;
    }, 0);

    const avgRevenuePerEmployee = totalEmployees > 0 ? totalRevenue / totalEmployees : 0;

    // Top performers
    const topPerformers = [...employees]
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Employee Analytics</h2>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Employees */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEmployees.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                                Active: {activeEmployees}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                New: {newEmployees}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Sales */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <div className="flex justify-between">
                                <span>Avg per employee:</span>
                                <span>{avgSalesPerEmployee.toFixed(1)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Generated */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalRevenue)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <div className="flex justify-between">
                                <span>Avg per employee:</span>
                                <span>{formatCurrency(avgRevenuePerEmployee)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employee Growth */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Employee Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            New hires ({timeRange})
                        </p>
                        <div className="mt-2 text-sm">
                            {totalEmployees > 0
                                ? `${((newEmployees / totalEmployees) * 100).toFixed(1)}% growth`
                                : 'No growth data'
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Metrics Tabs */}
            <Tabs defaultValue="distribution" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Role Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Role Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(roleDistribution).map(([role, count]) => (
                                        <div key={role} className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm capitalize">{role.toLowerCase()}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{count}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {totalEmployees > 0
                                                            ? `${((count / totalEmployees) * 100).toFixed(1)}%`
                                                            : '0%'
                                                        }
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Progress
                                                value={totalEmployees > 0 ? (count / totalEmployees) * 100 : 0}
                                                className={`${role === 'ADMIN' ? '[&>div]:bg-red-500' :
                                                        role === 'MANAGER' ? '[&>div]:bg-blue-500' :
                                                            '[&>div]:bg-green-500'
                                                    }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Performance Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Top Performers</span>
                                            <span className="font-medium">
                                                {employees.filter(e => (e.salesCount || 0) > 100).length}
                                            </span>
                                        </div>
                                        <Progress
                                            value={totalEmployees > 0
                                                ? (employees.filter(e => (e.salesCount || 0) > 100).length / totalEmployees) * 100
                                                : 0
                                            }
                                            className="[&>div]:bg-green-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Average Performers</span>
                                            <span className="font-medium">
                                                {employees.filter(e => (e.salesCount || 0) > 10 && (e.salesCount || 0) <= 100).length}
                                            </span>
                                        </div>
                                        <Progress
                                            value={totalEmployees > 0
                                                ? (employees.filter(e => (e.salesCount || 0) > 10 && (e.salesCount || 0) <= 100).length / totalEmployees) * 100
                                                : 0
                                            }
                                            className="[&>div]:bg-yellow-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">New/Low Performers</span>
                                            <span className="font-medium">
                                                {employees.filter(e => (e.salesCount || 0) <= 10).length}
                                            </span>
                                        </div>
                                        <Progress
                                            value={totalEmployees > 0
                                                ? (employees.filter(e => (e.salesCount || 0) <= 10).length / totalEmployees) * 100
                                                : 0
                                            }
                                            className="[&>div]:bg-red-500"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Employees with highest sales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topPerformers.map((employee, index) => (
                                    <div
                                        key={employee.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">
                                                    {employee.firstName} {employee.lastName}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {employee.user?.role}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {employee.position}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {employee.store?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">
                                                {employee.salesCount?.toLocaleString()} sales
                                            </div>
                                            {employee.performance?.last30Days && (
                                                <div className="text-sm text-muted-foreground">
                                                    {formatCurrency(employee.performance.last30Days.totalRevenue || 0)} revenue
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Performance Trends</CardTitle>
                            <CardDescription>Employee performance over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {newEmployees}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            New Hires ({timeRange})
                                        </div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(avgRevenuePerEmployee)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Avg Revenue/Employee
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Employee Alerts</CardTitle>
                            <CardDescription>Issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Inactive Employees Alert */}
                                {inactiveEmployees > 0 && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                                        <div className="flex items-center gap-3">
                                            <UserPlus className="h-5 w-5 text-red-600" />
                                            <div>
                                                <h4 className="font-medium text-red-800">Inactive Employees</h4>
                                                <p className="text-sm text-red-600">
                                                    {inactiveEmployees} employee{inactiveEmployees !== 1 ? 's' : ''} have inactive accounts
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                                            Review
                                        </Button>
                                    </div>
                                )}

                                {/* New Hires Alert */}
                                {newEmployees > 0 && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <UserPlus className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <h4 className="font-medium text-blue-800">New Hires</h4>
                                                <p className="text-sm text-blue-600">
                                                    {newEmployees} new employee{newEmployees !== 1 ? 's' : ''} joined recently
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                                            Onboard
                                        </Button>
                                    </div>
                                )}

                                {/* Low Performance Alert */}
                                {employees.filter(e => (e.salesCount || 0) <= 10).length > 0 && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Low Performance</h4>
                                                <p className="text-sm text-yellow-600">
                                                    {employees.filter(e => (e.salesCount || 0) <= 10).length} employee{employees.filter(e => (e.salesCount || 0) <= 10).length !== 1 ? 's' : ''} with low sales
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300">
                                            Review
                                        </Button>
                                    </div>
                                )}

                                {/* All Good Alert */}
                                {inactiveEmployees === 0 && newEmployees === 0 &&
                                    employees.filter(e => (e.salesCount || 0) <= 10).length === 0 && (
                                        <div className="text-center py-8">
                                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-medium">All Good!</h3>
                                            <p className="text-sm text-gray-500">No critical alerts at this time</p>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}