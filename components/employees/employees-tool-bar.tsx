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
    stores: Store[];
    users: User[];
}

export function EmployeeToolbar({
    viewMode,
    onViewModeChange,
    onRefresh,
    onExport,
    onCreateEmployee,
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
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>
                            Add a new employee to your workforce
                        </DialogDescription>
                    </DialogHeader>
                    <EmployeeForm
                        mode="create"
                        onSubmit={onCreateEmployee}
                        onCancel={() => { }}
                        stores={stores}
                        users={users}
                    />
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