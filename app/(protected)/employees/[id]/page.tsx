// app/(dashboard)/employees/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomAlert } from "@/components/ui/custom-alert";
import {
    ArrowLeft,
    Edit,
    User,
    Phone,
    Mail,
    Store,
    Calendar,
    TrendingUp,
    Shield,
    Award,
    ShoppingCart,
    Activity,
    Clock,
    DollarSign,
    UserCheck,
    UserX,
    Download,
    LoaderCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import EmployeePerformance from "@/components/dashboard/employee/employee-performance-chart";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { getEmployeeById, getEmployeeActivities, deactivateEmployee, reactivateEmployee, resetEmployeePassword, exportEmployees } from "@/lib/employee-api";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog";


export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [deactivateReason, setDeactivateReason] = useState("");
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

    const employeeId = params.id as string;

    useEffect(() => {
        fetchEmployeeData();
    }, [employeeId]);

    const fetchEmployeeData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch employee details
            const employeeResult = await getEmployeeById(employeeId);

            if (!employeeResult.success || !employeeResult.data) {
                throw new Error(employeeResult.error || "Failed to fetch employee");
            }

            setEmployee(employeeResult.data);

            // Fetch recent activities
            const activitiesResult = await getEmployeeActivities(employeeId, {
                limit: 10,
                page: 1
            });

            if (activitiesResult.success) {
                setActivities(activitiesResult.data?.activities || []);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load employee data");
            console.error("Error fetching employee data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!employee || !deactivateReason.trim()) return;

        try {
            setIsDeactivating(true);
            const result = await deactivateEmployee(employee.id, deactivateReason);

            if (result.success) {
                // Update employee status in local state
                setEmployee({
                    ...employee,
                    user: employee.user ? { ...employee.user, isActive: false } : undefined
                });
                setShowDeactivateDialog(false);
                setDeactivateReason("");
            } else {
                setError(result.error || "Failed to deactivate employee");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to deactivate employee");
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleReactivate = async () => {
        if (!employee) return;

        try {
            setIsDeactivating(true);
            const result = await reactivateEmployee(employee.id);

            if (result.success) {
                // Update employee status in local state
                setEmployee({
                    ...employee,
                    user: employee.user ? { ...employee.user, isActive: true } : undefined
                });
            } else {
                setError(result.error || "Failed to reactivate employee");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reactivate employee");
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleResetPassword = async () => {
        if (!employee) return;

        try {
            const result = await resetEmployeePassword(employee.id, true);

            if (result.success) {
                setError(null);
                setShowResetPasswordDialog(false);
            } else {
                setError(result.error || "Failed to reset password");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password");
        }
    };

    const handleExportPerformance = async () => {
        try {
            const result = await exportEmployees('csv');

            if (result.success && result.data) {
                // Create and download CSV file
                const blob = new Blob([result.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `employee_performance_${employee?.firstName}_${employee?.lastName}_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                setError(result.error || "Failed to export performance data");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to export");
        }
    };

    const handleRefresh = () => {
        fetchEmployeeData();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>

                {/* Quick Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Employee Not Found</h3>
                            <p className="text-gray-500 mb-6">{error || "The requested employee could not be found"}</p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={() => router.push("/employees")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Employees
                                </Button>
                                <Button variant="outline" onClick={handleRefresh}>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isActive = employee.user?.isActive;
    const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={employee.user?.avatar || undefined} />
                            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {employee.firstName} {employee.lastName}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={isActive ? 'default' : 'destructive'}
                                        className="text-sm"
                                    >
                                        {isActive ? (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-1" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="h-4 w-4 mr-1" />
                                                Inactive
                                            </>
                                        )}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm">
                                        {employee.position}
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className={`text-sm ${employee.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                employee.user?.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                                                    employee.user?.role === 'SUPERVISOR' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <Shield className="h-3 w-3 mr-1" />
                                        {employee.user?.role || 'STAFF'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{employee.user?.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{employee.phoneNumber}</span>
                                </div>
                                {employee.store && (
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        <Link
                                            href={`/stores/${employee.store.id}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {employee.store.name}
                                        </Link>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined: {format(new Date(employee.createdAt), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/employees")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Employees
                        </Button>

                        {isActive ? (
                            <Button
                                variant="outline"
                                onClick={() => setShowDeactivateDialog(true)}
                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleReactivate}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                                disabled={isDeactivating}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {isDeactivating ? 'Reactivating...' : 'Reactivate'}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setShowResetPasswordDialog(true)}
                        >
                            Reset Password
                        </Button>

                        <Link href={`/employees/${employeeId}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Employee
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {employee.salesCount?.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sales transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {employee?.salesCount || '0'}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Performance score
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Activity</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activities.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recent activities
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {format(new Date(employee.updatedAt), 'MMM dd')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(employee.updatedAt), 'hh:mm a')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 lg:grid-cols-5">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Activities
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Sales
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Documents
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Employee Information */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Employee Information</CardTitle>
                                <CardDescription>Complete employee details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Personal Information</h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Full Name</dt>
                                                    <dd className="text-sm font-medium">{employee.firstName} {employee.lastName}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Employee ID</dt>
                                                    <dd className="text-sm font-medium">{employee.id.slice(0, 8)}...</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Phone Number</dt>
                                                    <dd className="text-sm font-medium">{employee.phoneNumber}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Email Address</dt>
                                                    <dd className="text-sm font-medium">{employee.user?.email || 'N/A'}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Employment Details</h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Position</dt>
                                                    <dd className="text-sm font-medium">{employee.position}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">System Role</dt>
                                                    <dd className="text-sm font-medium">{employee.user?.role}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Status</dt>
                                                    <dd className="text-sm font-medium">
                                                        <Badge variant={isActive ? 'default' : 'destructive'} className="text-xs">
                                                            {isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Email Verified</dt>
                                                    <dd className="text-sm font-medium">
                                                        {employee.user?.emailVerified ? 'Yes' : 'No'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Store Information */}
                                    {employee.store && (
                                        <div className="pt-4 border-t">
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Store Assignment</h4>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Store className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium">{employee.store.name}</p>
                                                        <p className="text-sm text-muted-foreground">{employee.store.location}</p>
                                                    </div>
                                                </div>
                                                <Link href={`/stores/${employee.store.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        View Store
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                                <CardDescription>Employee account information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg ${isActive
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                        }`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                {isActive ? (
                                                    <UserCheck className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <UserX className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">
                                                    {isActive ? 'Account Active' : 'Account Inactive'}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {isActive
                                                        ? 'Employee has access to the system'
                                                        : 'Employee cannot access the system'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Actions */}
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setShowResetPasswordDialog(true)}
                                        >
                                            Reset Password
                                        </Button>

                                        {isActive ? (
                                            <Button
                                                variant="outline"
                                                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                                                onClick={() => setShowDeactivateDialog(true)}
                                            >
                                                <UserX className="h-4 w-4 mr-2" />
                                                Deactivate Account
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                                                onClick={handleReactivate}
                                                disabled={isDeactivating}
                                            >
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                {isDeactivating ? 'Reactivating...' : 'Reactivate Account'}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Account Details */}
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-semibold mb-3">Account Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Created</span>
                                                <span className="font-medium">
                                                    {format(new Date(employee.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <span className="font-medium">
                                                    {format(new Date(employee.updatedAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Last Login</span>
                                                <span className="font-medium">
                                                    {employee.user?.updatedAt
                                                        ? format(new Date(employee.user.updatedAt), 'MMM dd, yyyy')
                                                        : 'Never'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance">
                    <EmployeePerformance employeeId={employeeId} />

                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="outline"
                            onClick={handleExportPerformance}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Performance Data
                        </Button>
                    </div>
                </TabsContent>

                {/* Activities Tab */}
                <TabsContent value="activities" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activities</CardTitle>
                            <CardDescription>Employee system activities and actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Activity className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{activity.action}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {activity.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {activity.createdAt
                                                        ? format(new Date(activity.createdAt), 'MMM dd, yyyy')
                                                        : 'N/A'
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.createdAt
                                                        ? format(new Date(activity.createdAt), 'hh:mm a')
                                                        : ''
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Activities</h3>
                                    <p className="text-gray-500 mb-6">
                                        No recent activities found for this employee.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                View All Activities
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales History</CardTitle>
                            <CardDescription>Employee sales transactions and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {employee.recentSales && employee.recentSales.length > 0 ? (
                                <div className="space-y-4">
                                    {employee.recentSales.map((sale, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">Sale #{sale.id?.slice(-8) || `TRX-${index + 1}`}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {sale.products?.length || 0} items • Total: M{sale.totalAmount?.toFixed(2) || '0.00'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    M{sale.totalAmount?.toFixed(2) || '0.00'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {sale.date ? format(new Date(sale.date), 'MMM dd, yyyy') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Sales History</h3>
                                    <p className="text-gray-500 mb-6">
                                        No sales transactions found for this employee.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                View Full Sales Report
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Documents</CardTitle>
                            <CardDescription>Important documents and certifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Documents Section</h3>
                                <p className="text-gray-500 mb-6">
                                    Manage employee documents, certifications, and important files.
                                </p>
                                <Button>Upload Document</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Deactivate Dialog */}
            <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate {employee.firstName} {employee.lastName}?
                            They will lose access to the system until reactivated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <label htmlFor="deactivate-reason" className="block text-sm font-medium mb-2">
                            Reason for deactivation (required):
                        </label>
                        <Textarea
                            id="deactivate-reason"
                            placeholder="Enter reason for deactivation"
                            value={deactivateReason}
                            onChange={(e) => setDeactivateReason(e.target.value)}
                            className="w-full min-h-[100px]"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeactivating}
                            onClick={() => {
                                setDeactivateReason("");
                                setShowDeactivateDialog(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeactivate}
                            disabled={isDeactivating || !deactivateReason.trim()}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isDeactivating ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                    Deactivating...
                                </>
                            ) : (
                                'Deactivate Employee'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Password Dialog */}
            <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password</AlertDialogTitle>
                        <AlertDialogDescription>
                            Reset password for {employee.firstName} {employee.lastName}?
                            A new password will be generated and sent to their email.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetPassword}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Reset Password
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {error && (
                <CustomAlert
                    message={error}
                    type="error"
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
}