// components/dashboard/employees/employee-alerts.tsx
"use client";

import { useState, useEffect } from "react";
import { Employee } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Users,
    UserX,
    Clock,
    Mail,
    RefreshCw,
    ArrowRight,
    Calendar,
    TrendingDown,
    Award
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getAllEmployees } from "@/lib/employee-api";

interface EmployeeAlertsProps {
    employees?: Employee[];
}

export default function EmployeeAlerts({ employees: initialEmployees }: EmployeeAlertsProps) {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees || []);
    const [isLoading, setIsLoading] = useState(!initialEmployees);
    const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('month');

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const result = await getAllEmployees();
            if (result.length > 0) {
                setEmployees(result);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialEmployees) {
            fetchEmployees();
        }
    }, [initialEmployees]);

    // Filter and categorize employees
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const newEmployees = employees.filter(e =>
        new Date(e.createdAt) > thirtyDaysAgo
    );

    const inactiveEmployees = employees.filter(e =>
        e.user?.isActive === false
    );

    const employeesWithoutSales = employees.filter(e =>
        e.salesCount === 0
    );

    const topPerformers = [...employees]
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 5);

    const refreshData = () => {
        fetchEmployees();
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const totalAlerts = newEmployees.length + inactiveEmployees.length + employeesWithoutSales.length;

    if (totalAlerts === 0 && employees.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">All Employee Data Healthy</h3>
                        <p className="text-gray-500 mb-6">
                            No employee alerts at this time.
                        </p>
                        <Button onClick={refreshData}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                        Employee Alerts
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-muted-foreground">
                            {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} requiring attention
                        </p>
                        <Badge variant="outline" className="text-xs">
                            {employees.length} Total Employees
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                            {inactiveEmployees.length} Inactive
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Inactive Employees */}
            {inactiveEmployees.length > 0 && (
                <Card className="border-red-300 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <UserX className="h-5 w-5" />
                            Inactive Employees ({inactiveEmployees.length})
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            Employees with deactivated accounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inactiveEmployees.slice(0, 10).map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between p-4 border border-red-200 bg-white rounded-lg hover:bg-red-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <UserX className="h-5 w-5 text-red-600" />
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
                                                <span className="text-sm text-muted-foreground">
                                                    {employee.store?.name || 'No store'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-red-600">Account Inactive</p>
                                        <p className="text-xs text-red-500">
                                            Last active: {employee.updatedAt ? formatDate(employee.updatedAt) : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* New Employees */}
            {newEmployees.length > 0 && (
                <Card className="border-blue-300 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-700 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            New Employees ({newEmployees.length})
                        </CardTitle>
                        <CardDescription className="text-blue-600">
                            Joined in the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {newEmployees
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 10)
                                .map((employee) => (
                                    <div
                                        key={employee.id}
                                        className="flex items-center justify-between p-4 border border-blue-200 bg-white rounded-lg hover:bg-blue-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Users className="h-5 w-5 text-blue-600" />
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
                                                    <span className="text-sm text-muted-foreground">
                                                        Joined: {formatDate(employee.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-blue-600">New Hire</p>
                                            <p className="text-xs text-muted-foreground">
                                                {employee.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Employees Without Sales */}
            {employeesWithoutSales.length > 0 && (
                <Card className="border-orange-300 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-orange-700 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            No Sales Record ({employeesWithoutSales.length})
                        </CardTitle>
                        <CardDescription className="text-orange-600">
                            Employees with zero sales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {employeesWithoutSales
                                .slice(0, 10)
                                .map((employee) => (
                                    <div
                                        key={employee.id}
                                        className="flex items-center justify-between p-4 border border-orange-200 bg-white rounded-lg hover:bg-orange-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <TrendingDown className="h-5 w-5 text-orange-600" />
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
                                                    <span className="text-sm text-muted-foreground">
                                                        {employee.store?.name || 'No store'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-orange-600">0 sales</p>
                                            <p className="text-sm text-orange-500">No sales recorded</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Performers */}
            {topPerformers.length > 0 && (
                <Card className="border-green-300 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-green-700 flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Top Performers ({topPerformers.length})
                        </CardTitle>
                        <CardDescription className="text-green-600">
                            Employees with highest sales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topPerformers.map((employee, index) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between p-4 border border-green-200 bg-white rounded-lg hover:bg-green-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 font-bold rounded-full">
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
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">
                                            {employee.salesCount?.toLocaleString()} sales
                                        </p>
                                        {employee.performance?.last30Days && (
                                            <p className="text-sm text-muted-foreground">
                                                {employee.performance.last30Days.totalSales} this month
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Alerts</p>
                            <p className="text-3xl font-bold text-orange-600">{totalAlerts}</p>
                            <p className="text-xs text-muted-foreground mt-2">Issues requiring attention</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Employees</p>
                            <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                <div className="flex justify-between">
                                    <span>Active:</span>
                                    <span>{employees.filter(e => e.user?.isActive !== false).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Inactive:</span>
                                    <span className="text-red-600">{inactiveEmployees.length}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">New Hires (30d)</p>
                            <p className="text-3xl font-bold text-green-600">{newEmployees.length}</p>
                            <p className="text-xs text-muted-foreground mt-2">Employees joined recently</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold mb-1">Take Action</h4>
                            <p className="text-sm text-muted-foreground">
                                Manage employee alerts and improve performance
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/employees?filter=new">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Onboard New Hires
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/dashboard/employees/create">
                                    <Users className="h-4 w-4 mr-2" />
                                    Hire New Employee
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}