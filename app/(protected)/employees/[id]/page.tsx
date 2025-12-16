'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Employee, EmployeePerformance, PerformanceReview, EmployeeTransfer, StoreStaffSummary } from '@/types';
import EmployeeAPI from '@/lib/api/employees';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Edit,
    TrendingUp,
    History,
    FileText,
    Award,
    Building,
    Briefcase,
    DollarSign,
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    Clock,
    Target,
    BarChart3,
    Download,
    Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PerformanceCharts } from '@/components/employees/performance-chart';
import { EmployeeForm } from '@/components/employees/employee-form';
import { format, formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, accessToken } = useAuth();

    const employeeId = params.id as string;
    const defaultTab = searchParams.get('tab') || 'overview';

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [performance, setPerformance] = useState<EmployeePerformance | null>(null);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [transfers, setTransfers] = useState<EmployeeTransfer[]>([]);
    const [storeSummary, setStoreSummary] = useState<StoreStaffSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [addingReview, setAddingReview] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultTab);

    const loadEmployeeData = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            const [employeeData, performanceData, reviewsData, transfersData] = await Promise.all([
                EmployeeAPI.getEmployee(accessToken, employeeId),
                EmployeeAPI.getEmployeePerformance(accessToken, employeeId, 'month'),
                EmployeeAPI.getEmployeeReviews(accessToken, employeeId),
                EmployeeAPI.getEmployeeTransfers(accessToken, employeeId),
            ]);

            setEmployee(employeeData);
            setPerformance(performanceData);
            setReviews(reviewsData);
            setTransfers(transfersData);

            // Load store summary if employee has a store
            if (employeeData.storeId) {
                try {
                    const summary = await EmployeeAPI.getStoreStaffSummary(accessToken, employeeData.storeId);
                    setStoreSummary(summary);
                } catch (error) {
                    console.error('Failed to load store summary:', error);
                }
            }
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to load employee data',
            });
            router.push('/workforce/employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployeeData();
    }, [employeeId, accessToken]);

    const handleUpdateEmployee = async (data: any) => {
        if (!accessToken || !employee) return;

        try {
            await EmployeeAPI.updateEmployee(accessToken, employee.id, data);
            toast.success('Success', {
                description: 'Employee updated successfully',
            });
            setEditing(false);
            loadEmployeeData();
        } catch (error: any) {
            throw error;
        }
    };

    const handleAddReview = async (data: any) => {
        if (!accessToken || !employee) return;

        try {
            await EmployeeAPI.addPerformanceReview(accessToken, employee.id, data);
            toast.success('Success', {
                description: 'Performance review added successfully',
            });
            setAddingReview(false);
            loadEmployeeData();
        } catch (error: any) {
            throw error;
        }
    };

    const handleExportPerformance = async () => {
        if (!accessToken || !employee) return;

        try {
            const blob = await EmployeeAPI.exportEmployeePerformance(accessToken, employee.id, 'month');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-${employee.user.firstName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Success', {
                description: 'Performance report exported successfully',
            });
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to export performance report',
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'TERMINATED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SUPERVISOR': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'CASHIER': return 'bg-green-100 text-green-800 border-green-200';
            case 'WAREHOUSE': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading employee details...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/workforce/employees')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Employees
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={employee.user.avatar} />
                            <AvatarFallback>
                                {getInitials(employee.user.firstName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{employee.user.firstName}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getRoleColor(employee.role)}>
                                    {employee.role}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(employee.status)}>
                                    {employee.status}
                                </Badge>
                                <span className="text-muted-foreground">• {employee.position}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Employee Actions</DropdownMenuLabel>
                            {performance && (
                                <DropdownMenuItem onClick={handleExportPerformance}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Performance
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setAddingReview(true)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Add Performance Review
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                <DropdownMenuItem onClick={() => setEditing(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Employee
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">
                        <User className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                        <FileText className="h-4 w-4 mr-2" />
                        Reviews
                    </TabsTrigger>
                    <TabsTrigger value="store">
                        <Building className="h-4 w-4 mr-2" />
                        Store Context
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Employee Information</CardTitle>
                                <CardDescription>
                                    Personal and employment details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Personal Details</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span>{employee.user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>{employee.user.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            Last login: {employee.user.lastLogin ?
                                                                formatDistanceToNow(new Date(employee.user.lastLogin), { addSuffix: true }) :
                                                                'Never'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Employment Details</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                        <span>{employee.position}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>Hired: {format(new Date(employee.hireDate), 'MMM d, yyyy')}</span>
                                                    </div>
                                                    {employee.terminationDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span>Terminated: {format(new Date(employee.terminationDate), 'MMM d, yyyy')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Store Information</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        <span>{employee.store.name}</span>
                                                        {employee.store.isMainStore && (
                                                            <Badge variant="outline">Main Store</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{employee.store.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            Tenure: {formatDistanceToNow(new Date(employee.hireDate), { addSuffix: false })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Compensation</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            Salary: {employee.salary ?
                                                                `$${employee.salary.toLocaleString()}/month` :
                                                                'Not specified'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Target className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            Performance: {employee.performanceScore ?
                                                                `${employee.performanceScore.toFixed(1)}%` :
                                                                'Not rated'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {employee._count && (
                                        <div className="pt-4 border-t">
                                            <h4 className="text-sm font-medium mb-3">Activity Summary</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-2xl font-bold">
                                                        {employee._count.sales || 0}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Total Sales</p>
                                                </div>
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-2xl font-bold">
                                                        {employee._count.transactions || 0}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Transactions</p>
                                                </div>
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-2xl font-bold">
                                                        {transfers.length}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Store Transfers</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                                <CardDescription>Key metrics at a glance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {performance && (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium">Performance Score</span>
                                                    <span className="font-bold">
                                                        {performance.metrics.salesTargetAchievement.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Rank: #{performance.rankings.overallRank}</span>
                                                    <span>of {performance.rankings.totalEmployees}</span>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium">Monthly Revenue</span>
                                                    <span className="font-bold">
                                                        ${performance.sales.totalRevenue.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Transactions: {performance.sales.totalTransactions}</span>
                                                    <span>Avg: ${performance.sales.averageTransactionValue.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <Separator />
                                        </>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Store Ranking</span>
                                            <Badge variant="secondary">
                                                #{
                                                    storeSummary?.topPerformers &&
                                                        storeSummary.topPerformers.findIndex(p => p.employeeId === employee.id) !== -1 ?
                                                        storeSummary.topPerformers.findIndex(p => p.employeeId === employee.id) + 1 :
                                                        'N/A'
                                                }
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Among {storeSummary?.summary.totalEmployees || 0} store employees
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Last Review</span>
                                            <span className="font-medium">
                                                {reviews.length > 0 ?
                                                    format(new Date(reviews[0].createdAt), 'MMM d, yyyy') :
                                                    'No reviews'}
                                            </span>
                                        </div>
                                        {reviews.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-yellow-600" />
                                                <span className="text-sm">
                                                    Score: {reviews[0].score.toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance">
                    {performance ? (
                        <PerformanceCharts performance={performance} />
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No performance data available</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Transfer History</CardTitle>
                            <CardDescription>
                                History of store transfers for this employee
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transfers.length > 0 ? (
                                <div className="space-y-4">
                                    {transfers.map((transfer) => (
                                        <div key={transfer.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{transfer.fromStore.name}</span>
                                                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{transfer.toStore.name}</span>
                                                </div>
                                                <Badge variant="outline">
                                                    {format(new Date(transfer.transferDate), 'MMM d, yyyy')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {transfer.reason}
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>
                                                    Transferred by: {transfer.transferredByUser.firstName}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {format(new Date(transfer.transferDate), 'PPpp')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">No transfer history</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Timeline</CardTitle>
                            <CardDescription>
                                Key events in employee's career
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <div className="h-full w-px bg-border mt-1"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">Hired</div>
                                        <div className="text-sm text-muted-foreground">
                                            {format(new Date(employee.hireDate), 'MMMM d, yyyy')}
                                        </div>
                                        <p className="text-sm mt-1">
                                            Started as {employee.position} at {employee.store.name}
                                        </p>
                                    </div>
                                </div>

                                {employee.terminationDate && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">Terminated</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(employee.terminationDate), 'MMMM d, yyyy')}
                                            </div>
                                            <p className="text-sm mt-1">
                                                Employment ended
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Performance Reviews</h3>
                            <p className="text-sm text-muted-foreground">
                                Historical performance reviews and feedback
                            </p>
                        </div>
                        <Dialog open={addingReview} onOpenChange={setAddingReview}>
                            <DialogTrigger asChild>
                                <Button>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Add Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                                <DialogHeader>
                                    <DialogTitle>Add Performance Review</DialogTitle>
                                    <DialogDescription>
                                        Record a performance review for {employee.user.lastName}
                                    </DialogDescription>
                                </DialogHeader>
                                <EmployeeForm
                                    mode="review"
                                    employee={employee}
                                    onSubmit={handleAddReview}
                                    onCancel={() => setAddingReview(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Award className="h-5 w-5 text-yellow-600" />
                                                    {review.period} Review
                                                </CardTitle>
                                                <CardDescription>
                                                    Reviewed by {review.reviewedBy.user.firstName} • {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="text-lg font-bold">
                                                {review.score.toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Feedback</h4>
                                            <p className="text-sm">{review.feedback}</p>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Strengths</h4>
                                                <ul className="space-y-1">
                                                    {review.strengths.map((strength, index) => (
                                                        <li key={index} className="text-sm flex items-start gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5"></div>
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {review.areasForImprovement && review.areasForImprovement.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Areas for Improvement</h4>
                                                    <ul className="space-y-1">
                                                        {review.areasForImprovement.map((area, index) => (
                                                            <li key={index} className="text-sm flex items-start gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5"></div>
                                                                {area}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Goals for Next Period</h4>
                                            <ul className="space-y-1">
                                                {review.goals.map((goal, index) => (
                                                    <li key={index} className="text-sm flex items-start gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                                                        {goal}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No performance reviews yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="store" className="space-y-6">
                    {storeSummary ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Context</CardTitle>
                                <CardDescription>
                                    {employee.store.name} • {storeSummary.summary.totalEmployees} employees
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Store Rank</p>
                                            <div className="text-3xl font-bold">
                                                #{storeSummary.topPerformers.findIndex(p => p.employeeId === employee.id) + 1 || 'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Among {storeSummary.topPerformers.length} top performers
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Performance Percentile</p>
                                            <div className="text-3xl font-bold">
                                                {employee.performanceScore ?
                                                    `${Math.round((1 - (storeSummary.topPerformers.findIndex(p => p.employeeId === employee.id) / storeSummary.topPerformers.length)) * 100)}%` :
                                                    'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Store performance ranking
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Same Role Employees</p>
                                            <div className="text-3xl font-bold">
                                                {storeSummary.byRole.find(r => r.role === employee.role)?.count || 0}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Employees with {employee.role} role
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Same Position</p>
                                            <div className="text-3xl font-bold">
                                                {storeSummary.byPosition.find(p => p.position === employee.position)?.count || 1}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Employees with same position
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-3">Store Performance Distribution</h4>
                                        <div className="space-y-2">
                                            {storeSummary.performanceDistribution.map((dist) => (
                                                <div key={dist.range} className="flex items-center justify-between">
                                                    <span className="text-sm">{dist.range}%</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-48 bg-secondary rounded-full h-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{ width: `${dist.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium w-10">
                                                            {dist.count} ({dist.percentage}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No store context available</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update employee information
                        </DialogDescription>
                    </DialogHeader>
                    <EmployeeForm
                        mode="edit"
                        employee={employee}
                        onSubmit={handleUpdateEmployee}
                        onCancel={() => setEditing(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}