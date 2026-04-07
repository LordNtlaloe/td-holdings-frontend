'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Employee,
    PerformanceReview,
    EmployeeTransfer,
    Store,
    EmployeeStatus
} from '@/types';
import EmployeeAPI from '@/lib/api/employees';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Edit,
    Briefcase,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Star,
    History,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { EmployeeForm } from '@/components/employees/employee-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import StoreAPI from '@/lib/api/stores';

// Define local types based on what actually exists
type EmployeeWithStore = Employee & {
    store: Store;
    user: NonNullable<Employee['user']>;
};

type EmployeeReview = PerformanceReview & {
    reviewer?: {
        firstName: string;
        lastName: string;
    };
};

// type EmployeeTransferWithStores = EmployeeTransfer & {
//     fromStore?: Store;
//     toStore?: Store;
//     employee?: Employee;
//     transferredByUser?: {
//         firstName: string;
//         lastName: string;
//     };
// };

// Simple components
const EmployeePerformance = ({ employeeId }: { employeeId: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Performance metrics for this employee</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Performance data coming soon...</p>
        </CardContent>
    </Card>
);

const EmployeeReviews = ({ reviews, employeeId, employeeName }: { 
    reviews: EmployeeReview[]; 
    employeeId: string; 
    employeeName: string;
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>Review history for {employeeName}</CardDescription>
        </CardHeader>
        <CardContent>
            {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews found</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">Score: {review.score}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(review.reviewDate), 'MMM d, yyyy')} - {review.period}
                                        </p>
                                    </div>
                                </div>
                                {review.feedback && (
                                    <p className="mt-2 text-sm">{review.feedback}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
);

//     <Card>
//         <CardHeader>
//             <CardTitle>Transfer History</CardTitle>
//             <CardDescription>Record of store transfers</CardDescription>
//         </CardHeader>
//         <CardContent>
//             {transfers.length === 0 ? (
//                 <p className="text-muted-foreground">No transfer history</p>
//             ) : (
//                 <div className="space-y-4">
//                     {transfers.map((transfer) => (
//                         <Card key={transfer.id}>
//                             <CardContent className="pt-4">
//                                 <div className="space-y-2">
//                                     <div className="flex justify-between">
//                                         <p className="font-medium">From: {transfer.fromStore?.name || 'Unknown'}</p>
//                                         <p className="font-medium">To: {transfer.toStore?.name || 'Unknown'}</p>
//                                     </div>
//                                     <p className="text-sm text-muted-foreground">Reason: {transfer.reason}</p>
//                                     <p className="text-sm text-muted-foreground">
//                                         Date: {format(new Date(transfer.transferDate), 'MMM d, yyyy')}
//                                     </p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>
//             )}
//         </CardContent>
//     </Card>
// );

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, accessToken, isAuthenticated } = useAuth();
    const id = params.id as string;

    const [employee, setEmployee] = useState<EmployeeWithStore | null>(null);
    const [reviews, setReviews] = useState<EmployeeReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);

    useEffect(() => {
        const loadEmployeeData = async () => {
            if (!isAuthenticated || !accessToken || !id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch employee details
                const employeeData = await EmployeeAPI.getEmployee(accessToken, id);

                console.log('📦 Employee Data:', employeeData);

                // Cast employee data to EmployeeWithStore (assuming the API returns store data)
                setEmployee(employeeData as EmployeeWithStore);
                setReviews([]); // Initialize with empty array

            } catch (error: any) {
                console.error('❌ Error loading employee:', error);
                setError(error.message || 'Failed to load employee details');
                toast.error('Error', {
                    description: error.message || 'Failed to load employee details',
                });
            } finally {
                setLoading(false);
            }
        };

        loadEmployeeData();
    }, [id, accessToken, isAuthenticated]);

    // Load stores for transfer dialog
    useEffect(() => {
        const loadStores = async () => {
            if (!accessToken || !isTransferDialogOpen) return;

            try {
                setLoadingStores(true);
                const storesResponse = await StoreAPI.getStores(accessToken, { limit: 100 });
                
                // Handle stores response
                let storesList: Store[] = [];
                if (storesResponse && storesResponse.data && Array.isArray(storesResponse.data)) {
                    storesList = storesResponse.data;
                } else if (Array.isArray(storesResponse)) {
                    storesList = storesResponse;
                } else if (storesResponse && (storesResponse as any).stores && Array.isArray((storesResponse as any).stores)) {
                    storesList = (storesResponse as any).stores;
                }

                setStores(storesList);
            } catch (error) {
                console.error('Error loading stores:', error);
                toast.error('Failed to load stores');
            } finally {
                setLoadingStores(false);
            }
        };

        loadStores();
    }, [accessToken, isTransferDialogOpen]);

    const handleEditEmployee = async (data: any) => {
        if (!accessToken || !employee) return;

        try {
            await EmployeeAPI.updateEmployee(accessToken, employee.id, data);
            toast.success('Success', {
                description: 'Employee updated successfully',
            });
            setIsEditDialogOpen(false);
            
            // Reload employee data
            const updatedEmployee = await EmployeeAPI.getEmployee(accessToken, id);
            setEmployee(updatedEmployee as EmployeeWithStore);
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to update employee',
            });
            throw error;
        }
    };

    const handleTransferEmployee = async (data: any) => {
        if (!accessToken || !employee) return;

        try {
            await EmployeeAPI.transferEmployee(accessToken, employee.id, data);
            toast.success('Success', {
                description: 'Employee transferred successfully',
            });
            setIsTransferDialogOpen(false);
            
            // Reload employee data
            const updatedEmployee = await EmployeeAPI.getEmployee(accessToken, id);
            setEmployee(updatedEmployee as EmployeeWithStore);
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to transfer employee',
            });
            throw error;
        }
    };

    const handleTerminateEmployee = async () => {
        if (!accessToken || !employee) return;

        if (!confirm(`Are you sure you want to terminate ${employee.user?.firstName} ${employee.user?.lastName}?`)) {
            return;
        }

        try {
            await EmployeeAPI.terminateEmployee(accessToken, employee.id, 'Terminated by manager');
            toast.success('Success', {
                description: 'Employee terminated successfully',
            });
            
            // Reload employee data
            const updatedEmployee = await EmployeeAPI.getEmployee(accessToken, id);
            setEmployee(updatedEmployee as EmployeeWithStore);
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to terminate employee',
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            active: { variant: 'default', label: 'Active' },
            inactive: { variant: 'secondary', label: 'Inactive' },
            terminated: { variant: 'destructive', label: 'Terminated' },
            on_leave: { variant: 'outline', label: 'On Leave' },
        };

        const statusConfig = variants[status] || { variant: 'secondary', label: status };
        
        return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return '?';
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading employee details...</p>
                </div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Error
                        </CardTitle>
                        <CardDescription>
                            {error || 'Employee not found'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.back()} variant="outline" className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with back button and actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsTransferDialogOpen(true)}
                        className="gap-2"
                        disabled={employee.status !== EmployeeStatus.ACTIVE}
                    >
                        <Briefcase className="h-4 w-4" />
                        Transfer
                    </Button>
                    {employee.status === EmployeeStatus.ACTIVE && (
                        <Button
                            variant="destructive"
                            onClick={handleTerminateEmployee}
                            className="gap-2"
                        >
                            <AlertCircle className="h-4 w-4" />
                            Terminate
                        </Button>
                    )}
                </div>
            </div>

            {/* Employee Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar and basic info */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={employee.user?.avatar} />
                                <AvatarFallback className="text-lg">
                                    {getInitials(employee.user?.firstName, employee.user?.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold">
                                        {employee.user?.firstName} {employee.user?.lastName}
                                    </h1>
                                    {getStatusBadge(employee.status)}
                                </div>
                                <p className="text-muted-foreground">{employee.position}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary">{employee.role}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Store</p>
                                <p className="font-medium">{employee.store?.name || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Hire Date</p>
                                <p className="font-medium">
                                    {employee.hireDate ? format(new Date(employee.hireDate), 'MMM d, yyyy') : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Tenure</p>
                                <p className="font-medium">
                                    {employee.hireDate ? (
                                        (() => {
                                            const days = Math.floor((new Date().getTime() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24));
                                            const years = Math.floor(days / 365);
                                            const months = Math.floor((days % 365) / 30);
                                            return years > 0 ? `${years}y ${months}m` : `${months}m`;
                                        })()
                                    ) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Contact information - only show what exists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employee.user?.email && (
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.user.email}</span>
                            </div>
                        )}
                        {employee.user?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.user.phone}</span>
                            </div>
                        )}
                        {employee.store?.address && employee.store?.city && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.store.address}, {employee.store.city}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2">
                        <Star className="h-4 w-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Reviews
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <History className="h-4 w-4" />
                        Transfer History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">First Name</p>
                                        <p className="font-medium">{employee.user?.firstName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Name</p>
                                        <p className="font-medium">{employee.user?.lastName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{employee.user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{employee.user?.phone || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Position</p>
                                    <p className="font-medium">{employee.position}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium">{employee.role}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{employee.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Hire Date</p>
                                    <p className="font-medium">
                                        {employee.hireDate ? format(new Date(employee.hireDate), 'MMMM d, yyyy') : 'N/A'}
                                    </p>
                                </div>
                                {employee.terminationDate && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Termination Date</p>
                                        <p className="font-medium">
                                            {format(new Date(employee.terminationDate), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Store Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Store Name</p>
                                    <p className="font-medium">{employee.store?.name || 'N/A'}</p>
                                </div>
                                {employee.store?.address && employee.store?.city && (
                                    <>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="font-medium">{employee.store.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">City</p>
                                            <p className="font-medium">{employee.store.city}</p>
                                        </div>
                                    </>
                                )}
                                {employee.store?.phone && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Store Phone</p>
                                        <p className="font-medium">{employee.store.phone}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance">
                    <EmployeePerformance employeeId={employee.id} />
                </TabsContent>

                <TabsContent value="reviews">
                    <EmployeeReviews 
                        reviews={reviews} 
                        employeeId={employee.id}
                        employeeName={`${employee.user?.firstName} ${employee.user?.lastName}`}
                    />
                </TabsContent>

                <TabsContent value="history">
                    {/* <EmployeeTransferHistory transfers={transfers} /> */}
                </TabsContent>
            </Tabs>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update employee information for {employee.user?.firstName} {employee.user?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <EmployeeForm
                        mode="edit"
                        employee={employee}
                        stores={stores}
                        onSubmit={handleEditEmployee}
                        onCancel={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Transfer Employee Dialog */}
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Transfer Employee</DialogTitle>
                        <DialogDescription>
                            Transfer {employee.user?.firstName} {employee.user?.lastName} to another store
                        </DialogDescription>
                    </DialogHeader>
                    {loadingStores ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <EmployeeForm
                            mode="transfer"
                            employee={employee}
                            stores={stores.filter(s => s.id !== employee.storeId)}
                            onSubmit={handleTransferEmployee}
                            onCancel={() => setIsTransferDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}