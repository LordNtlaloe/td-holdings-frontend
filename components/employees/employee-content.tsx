import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { EmployeeCard } from '@/components/employees/employee-cards';
import { EmployeeTable } from '@/components/employees/employee-table';
import { Employee } from '@/types';

interface EmployeeContentProps {
    employees: Employee[];
    viewMode: 'grid' | 'table';
    filters: any;
    onShowCreateForm: () => void;
    onEdit: (employee: Employee) => void;
    onTransfer: (employeeId: string) => void;
    onTerminate: (employeeId: string) => void;
    onViewPerformance: (employeeId: string) => void;
    onView: (employeeId: string) => void;
    userRole?: string;
}

export function EmployeeContent({
    employees,
    viewMode,
    filters,
    onShowCreateForm,
    onEdit,
    onTransfer,
    onTerminate,
    onViewPerformance,
    onView,
    userRole
}: EmployeeContentProps) {
    if (employees.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No employees found</h3>
                <p className="text-muted-foreground mt-2">
                    {filters.search || filters.storeId || filters.role || filters.status ?
                        'Try adjusting your filters' :
                        'Get started by adding your first employee'}
                </p>
                {!filters.search && !filters.storeId && !filters.role && !filters.status && (
                    <Button className="mt-4" onClick={onShowCreateForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                )}
            </div>
        );
    }

    return viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
                <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onEdit={onEdit}
                    onTransfer={onTransfer}
                    onTerminate={onTerminate}
                    onViewPerformance={onViewPerformance}
                    showActions={userRole === 'ADMIN' || userRole === 'MANAGER'}
                />
            ))}
        </div>
    ) : (
        <EmployeeTable
            employees={employees}
            onEdit={onEdit}
            onTransfer={onTransfer}
            onTerminate={onTerminate}
            onViewPerformance={onViewPerformance}
            onView={onView}
        />
    );
}