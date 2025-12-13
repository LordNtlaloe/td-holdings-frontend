// components/dashboard/employees/employee-stats.tsx
"use client";

import { Employee } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Users,
    UserCheck,
    UserX,
    TrendingUp,
    Store,
    Award,
    Shield,
    Briefcase
} from "lucide-react";
import { Badge } from '@/components/ui/badge';

interface EmployeeStatsProps {
    employees: Employee[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EmployeeStats({ employees }: EmployeeStatsProps) {
    if (employees.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Employee Data</h3>
                        <p className="text-sm text-gray-500">Add employees to see statistics</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.user?.isActive).length;
    const inactiveEmployees = employees.filter(e => !e.user?.isActive).length;

    // Role distribution
    const roleDistribution = employees.reduce((acc, employee) => {
        const role = employee.user?.role || 'UNKNOWN';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const roleData = Object.entries(roleDistribution).map(([name, value]) => ({
        name,
        value,
        color: name === 'ADMIN' ? '#8b5cf6' :
            name === 'MANAGER' ? '#3b82f6' :
                name === 'SUPERVISOR' ? '#10b981' :
                    '#6b7280'
    }));

    // Position distribution
    const positionDistribution = employees.reduce((acc, employee) => {
        const position = employee.position || 'UNKNOWN';
        acc[position] = (acc[position] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const positionData = Object.entries(positionDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
            name,
            value,
        }));

    // Store distribution
    const storeDistribution = employees.reduce((acc, employee) => {
        const storeName = employee.store?.name || 'No Store';
        acc[storeName] = (acc[storeName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const storeData = Object.entries(storeDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
            name,
            value,
        }));

    // Performance data
    const performanceData = employees
        .filter(e => e.salesCount && e.salesCount > 0)
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 8)
        .map(employee => ({
            name: `${employee.firstName} ${employee.lastName}`.substring(0, 12) +
                (`${employee.firstName} ${employee.lastName}`.length > 12 ? '...' : ''),
            sales: employee.salesCount || 0,
            position: employee.position,
        }));

    // Status distribution
    const statusData = [
        { name: 'Active', value: activeEmployees, color: '#10b981' },
        { name: 'Inactive', value: inactiveEmployees, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            All team members
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            {((activeEmployees / totalEmployees) * 100).toFixed(1)}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{inactiveEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            {((inactiveEmployees / totalEmployees) * 100).toFixed(1)}% of total
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
                            {positionData[0]?.name || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most common job role
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                        <CardDescription>System access levels across team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {roleData.map((item) => (
                                <div key={item.name} className="text-center p-2 border rounded">
                                    <div className="text-lg font-bold" style={{ color: item.color }}>
                                        {item.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        {item.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Status</CardTitle>
                        <CardDescription>Active vs Inactive team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {statusData.map((item) => (
                                <div key={item.name} className="text-center p-2 border rounded">
                                    <div className="text-lg font-bold" style={{ color: item.color }}>
                                        {item.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performers by Sales</CardTitle>
                    <CardDescription>Employees with highest sales count</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [`${value} sales`, 'Sales Count']}
                                    labelFormatter={(value) => `Employee: ${value}`}
                                />
                                <Legend />
                                <Bar
                                    dataKey="sales"
                                    name="Sales Count"
                                    fill="#8884d8"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {performanceData.slice(0, 4).map((employee, index) => (
                            <div key={index} className="text-center p-3 border rounded-lg">
                                <div className="font-bold text-blue-600">
                                    {employee.sales.toLocaleString()} sales
                                </div>
                                <div className="text-sm truncate">{employee.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {employee.position}
                                </div>
                                <Badge variant="outline" className="text-xs mt-1">
                                    Rank #{index + 1}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Store and Position Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Store Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Store Distribution</CardTitle>
                        <CardDescription>Employees by store location</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={storeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                                    <Bar
                                        dataKey="value"
                                        name="Employee Count"
                                        fill="#00C49F"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {storeData.map((store) => (
                                <div key={store.name} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-gray-500" />
                                        <span>{store.name}</span>
                                    </div>
                                    <span className="font-bold">{store.value} employees</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Position Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Position Distribution</CardTitle>
                        <CardDescription>Employees by job position</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={positionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                                    <Bar
                                        dataKey="value"
                                        name="Employee Count"
                                        fill="#FF8042"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {positionData.map((position) => (
                                <div key={position.name} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-gray-500" />
                                        <span>{position.name}</span>
                                    </div>
                                    <span className="font-bold">{position.value} employees</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}