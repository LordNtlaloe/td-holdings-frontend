'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Employee, EmployeeFilters, EmployeeStats, Store, User } from '@/types';
import EmployeeAPI from '@/lib/api/employees';
import StoreAPI from '@/lib/api/stores';
import AuthAPI from '@/lib/api/auth';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { EmployeeStats as EmployeeStatsComponent } from '@/components/employees/employee-stats';
import { EmployeeFiltersComponent } from '@/components/employees/employee-filters';
import { EmployeeContent } from '@/components/employees/employee-content';
import { EmployeeLoading, AuthLoading } from '@/components/employees/employee-loading';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmployeeForm } from '@/components/employees/employee-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeToolbar } from '@/components/employees/employees-tool-bar';

export default function EmployeesPage() {
    const router = useRouter();
    const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isCreating, setIsCreating] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [transferringEmployee, setTransferringEmployee] = useState<string | null>(null);
    const [stats, setStats] = useState<EmployeeStats | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);

    const [filters, setFilters] = useState<EmployeeFilters>({
        search: '',
        storeId: undefined,
        role: undefined,
        status: undefined,
        activeOnly: true,
        page: 1,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc'
    });

    const loadEmployees = async () => {
        if (!isAuthenticated || !accessToken) {
            console.log('⚠️ Cannot load employees: not authenticated or no token');
            return;
        }

        try {
            setLoading(true);
            const [employeesResponse, statsData, storesData, usersData] = await Promise.all([
                EmployeeAPI.getEmployees(accessToken, filters),
                EmployeeAPI.getEmployeeStats(accessToken),
                StoreAPI.getStores(accessToken, { limit: 100 }),
                AuthAPI.getAllUsers(accessToken)
            ]);

            setEmployees(employeesResponse.employees);
            setStats(statsData);
            setStores(storesData.stores.map(store => ({
                id: store.id,
                name: store.name,
                location: store.location,
                phone: store.phone,
                email: store.email,
                isMainStore: store.isMainStore,
                createdAt: store.createdAt,
                updatedAt: store.updatedAt
            })));
            // FIXED: Extract users array from paginated response
            setAvailableUsers(usersData.users);
        } catch (error: any) {
            console.error('❌ Error loading employees:', error);
            toast.error('Error', {
                description: error.message || 'Failed to load employees',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && isAuthenticated && accessToken) {
            loadEmployees();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, accessToken, filters]);

    const handleFilterChange = (newFilters: Partial<EmployeeFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleCreateEmployee = async (data: any) => {
        if (!accessToken) {
            toast.error('Error', {
                description: 'Not authenticated',
            });
            return;
        }

        try {
            await EmployeeAPI.createEmployee(accessToken, data);
            toast.success('Success', {
                description: 'Employee created successfully',
            });
            setIsCreating(false);
            loadEmployees();
        } catch (error: any) {
            throw error;
        }
    };

    const handleUpdateEmployee = async (data: any) => {
        if (!accessToken || !editingEmployee) return;

        try {
            await EmployeeAPI.updateEmployee(accessToken, editingEmployee.id, data);
            toast.success('Success', {
                description: 'Employee updated successfully',
            });
            setEditingEmployee(null);
            loadEmployees();
        } catch (error: any) {
            throw error;
        }
    };

    const handleTransferEmployee = async (data: any) => {
        if (!accessToken || !transferringEmployee) return;

        try {
            await EmployeeAPI.transferEmployee(accessToken, transferringEmployee, data);
            toast.success('Success', {
                description: 'Employee transferred successfully',
            });
            setTransferringEmployee(null);
            loadEmployees();
        } catch (error: any) {
            throw error;
        }
    };

    const handleTerminateEmployee = async (employeeId: string) => {
        if (!accessToken) return;

        try {
            await EmployeeAPI.terminateEmployee(accessToken, employeeId, 'Terminated by manager');
            toast.success('Success', {
                description: 'Employee terminated successfully',
            });
            loadEmployees();
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to terminate employee',
            });
        }
    };

    const handleExportEmployees = async () => {
        if (!accessToken) return;

        try {
            const blob = await EmployeeAPI.exportEmployees(accessToken, filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employees-export-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Success', {
                description: 'Employees exported successfully',
            });
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to export employees',
            });
        }
    };

    const handleViewEmployee = (employeeId: string) => {
        router.push(`/workforce/employees/${employeeId}`);
    };

    const handleViewPerformance = (employeeId: string) => {
        router.push(`/workforce/employees/${employeeId}?tab=performance`);
    };

    // Loading states
    if (authLoading) return <AuthLoading />;
    if (!isAuthenticated) return <div>Not authenticated. Please log in.</div>;
    if (loading && employees.length === 0) return <EmployeeLoading />;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                    <p className="text-muted-foreground">
                        Manage your workforce, track performance, and handle employee data
                    </p>
                </div>
                <EmployeeToolbar
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onRefresh={loadEmployees}
                    onExport={handleExportEmployees}
                    onCreateEmployee={handleCreateEmployee}
                    stores={stores}
                    users={availableUsers}
                />
            </div>

            {/* Stats */}
            {stats && <EmployeeStatsComponent stats={stats} />}

            {/* Employee Directory */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Employee Directory</CardTitle>
                            <CardDescription>
                                View and manage all employees across stores
                            </CardDescription>
                        </div>
                        <EmployeeFiltersComponent
                            filters={filters}
                            stores={stores}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <EmployeeContent
                        employees={employees}
                        viewMode={viewMode}
                        filters={filters}
                        onShowCreateForm={() => setIsCreating(true)}
                        onEdit={setEditingEmployee}
                        onTransfer={setTransferringEmployee}
                        onTerminate={handleTerminateEmployee}
                        onViewPerformance={handleViewPerformance}
                        onView={handleViewEmployee}
                        userRole={user?.role}
                    />
                </CardContent>
            </Card>

            {/* Dialogs */}
            <EditEmployeeDialog
                employee={editingEmployee}
                onClose={() => setEditingEmployee(null)}
                onUpdate={handleUpdateEmployee}
            />
            <TransferEmployeeDialog
                employeeId={transferringEmployee}
                employees={employees}
                stores={stores}
                onClose={() => setTransferringEmployee(null)}
                onTransfer={handleTransferEmployee}
            />
        </div>
    );
}

// Dialog Components
function EditEmployeeDialog({
    employee,
    onClose,
    onUpdate
}: {
    employee: Employee | null;
    onClose: () => void;
    onUpdate: (data: any) => Promise<void>;
}) {
    if (!employee) return null;

    return (
        <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>Update employee information</DialogDescription>
                </DialogHeader>
                <EmployeeForm
                    mode="edit"
                    employee={employee}
                    onSubmit={onUpdate}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}

function TransferEmployeeDialog({
    employeeId,
    employees,
    stores,
    onClose,
    onTransfer
}: {
    employeeId: string | null;
    employees: Employee[];
    stores: Store[];
    onClose: () => void;
    onTransfer: (data: any) => Promise<void>;
}) {
    if (!employeeId) return null;

    const employee = employees.find(e => e.id === employeeId);

    return (
        <Dialog open={!!employeeId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Transfer Employee</DialogTitle>
                    <DialogDescription>Transfer employee to another store</DialogDescription>
                </DialogHeader>
                {employee && (
                    <EmployeeForm
                        mode="transfer"
                        employee={employee}
                        stores={stores.filter(s => s.id !== employee.storeId)}
                        onSubmit={onTransfer}
                        onCancel={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}