// app/(dashboard)/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    UserPlus,
    RefreshCw,
    Users,
    TrendingUp,
    Award,
    ShoppingCart,
    UserCheck,
    UserX
} from 'lucide-react';
import Link from 'next/link';
// Fixed import path
import { Employee } from '@/types';
import { getAllEmployeesWithParams } from '@/lib/employee-api';
import EmployeeStats from '@/components/dashboard/employee/employee-stats';
import EmployeesTable from '@/components/dashboard/employee/employees-table';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState('list');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {} as Record<string, number>,
        byPosition: {} as Record<string, number>,
    });

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const result = await getAllEmployeesWithParams({
                page: 1,
                limit: 50,
            });

            console.log('API Response:', result); // Debug log

            if (result && result.employees) {
                setEmployees(result.employees);
                setTotal(result.total);

                // Calculate stats
                const statsData = {
                    total: result.total,
                    active: result.employees.filter(e => e.user?.isActive).length,
                    inactive: result.employees.filter(e => !e.user?.isActive).length,
                    byRole: {} as Record<string, number>,
                    byPosition: {} as Record<string, number>,
                };

                result.employees.forEach(employee => {
                    const role = employee.user?.role || 'UNKNOWN';
                    const position = employee.position || 'UNKNOWN';

                    statsData.byRole[role] = (statsData.byRole[role] || 0) + 1;
                    statsData.byPosition[position] = (statsData.byPosition[position] || 0) + 1;
                });

                setStats(statsData);
            } else {
                console.error('Invalid API response format:', result);
                setEmployees([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            setEmployees([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    if (loading && employees.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading employees...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Employees</h1>
                    <p className="text-sm text-gray-500">
                        Manage your team members and their access to the system
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadEmployees}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/employees/create">
                        <Button size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" className="text-xs">
                                <UserCheck className="h-3 w-3 mr-1" />
                                {stats.active} Active
                            </Badge>
                            <Badge variant="destructive" className="text-xs">
                                <UserX className="h-3 w-3 mr-1" />
                                {stats.inactive} Inactive
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Role</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.entries(stats.byRole).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most common system role
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Position</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.entries(stats.byPosition).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most common job position
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees.reduce((sum, emp) => sum + (emp.salesCount || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Combined employee sales
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="list">Employee List</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="performance">Top Performers</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    {employees.length > 0 ? (
                        <EmployeesTable
                            initialEmployees={employees}
                            total={total}
                        />
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No employees found</h3>
                                    <p className="text-sm text-gray-500">Get started by adding your first team member</p>
                                    <Link href="/employees/create" className="mt-4 inline-block">
                                        <Button>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add Employee
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="stats">
                    <EmployeeStats employees={employees} />
                </TabsContent>

                <TabsContent value="performance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performers</CardTitle>
                            <CardDescription>Employees with highest sales performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {employees.filter(e => e.salesCount && e.salesCount > 0).length > 0 ? (
                                <div className="space-y-4">
                                    {employees
                                        .filter(e => e.salesCount && e.salesCount > 0)
                                        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
                                        .slice(0, 5)
                                        .map((employee, index) => (
                                            <div
                                                key={employee.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                        index === 1 ? 'bg-gray-100 text-gray-600' :
                                                            index === 2 ? 'bg-orange-100 text-orange-600' :
                                                                'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        <Award className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">
                                                            {employee.firstName} {employee.lastName}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {employee.position}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {employee.store?.name || 'No store'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-green-600">
                                                        {employee.salesCount?.toLocaleString()} sales
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Rank #{index + 1}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                                    <p className="text-gray-500 mb-6">
                                        Add employees and track their sales to see performance rankings.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}