'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Download, UserPlus, Grid, List } from 'lucide-react';
import { EmployeeForm } from '@/components/employees/employee-form';
import { Employee, Store, User } from '@/types';

interface EmployeeToolbarProps {
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
    onRefresh: () => void;
    onExport: () => void;
    onCreateEmployee: (data: any) => Promise<void>;
    isCreateDialogOpen?: boolean;
    onCreateDialogChange?: (open: boolean) => void;
    stores: Store[];
    users: User[];
}

export function EmployeeToolbar({
    viewMode,
    onViewModeChange,
    onRefresh,
    onExport,
    onCreateEmployee,
    isCreateDialogOpen,
    onCreateDialogChange,
    stores,
    users
}: EmployeeToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onExport}>
                        Export Current View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExport}>
                        Export All Employees
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Employee Dialog - Controlled from parent */}
            <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogChange}>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>
                            Add a new employee to your workforce
                        </DialogDescription>
                    </DialogHeader>
                    <div onClick={(e) => e.stopPropagation()}>
                        <EmployeeForm
                            mode="create"
                            onSubmit={async (data) => {
                                try {
                                    await onCreateEmployee(data);
                                    // Close dialog after successful submission
                                    if (onCreateDialogChange) {
                                        onCreateDialogChange(false);
                                    }
                                } catch (error) {
                                    // Form will handle error display, don't close dialog
                                    console.error('Form submission error:', error);
                                }
                            }}
                            onCancel={() => onCreateDialogChange?.(false)}
                            stores={stores}
                            users={users}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex border rounded-md">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => onViewModeChange('grid')}
                >
                    <Grid className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => onViewModeChange('table')}
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}