'use client';

import { Employee } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    User,
    Building,
    Briefcase,
    Target,
    Calendar,
    Mail,
    Phone,
    MoreHorizontal,
    TrendingUp,
    Store,
    UserX,
    DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmployeeAPI from '@/lib/api/employees';

interface EmployeeTableProps {
    employees: Employee[];
    onEdit?: (employee: Employee) => void;
    onTransfer?: (employeeId: string) => void;
    onTerminate?: (employeeId: string) => void;
    onViewPerformance?: (employeeId: string) => void;
    onView?: (employeeId: string) => void;
}

export function EmployeeTable({
    employees,
    onEdit,
    onTransfer,
    onTerminate,
    onViewPerformance,
    onView
}: EmployeeTableProps) {
    const getStatusInfo = (status: string) => {
        const info = EmployeeAPI.getStatusInfo(status);
        return {
            color: info.color,
            label: info.label,
            variant: info.badgeVariant
        };
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'MANAGER': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'CASHIER': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getInitials = (employee: Employee) => {
        const firstName = employee.user?.firstName || '';
        const lastName = employee.user?.lastName || '';
        return (firstName[0] || '') + (lastName[0] || '');
    };

    // Calculate average performance score from reviews
    const getAveragePerformanceScore = (employee: Employee): number | null => {
        if (!employee.performanceReviews || employee.performanceReviews.length === 0) {
            return null;
        }

        const sum = employee.performanceReviews.reduce((acc, review) => acc + review.score, 0);
        return sum / employee.performanceReviews.length;
    };

    // Get recent sales count (if available)
    const getRecentSalesCount = (employee: Employee): number => {
        return employee._count?.sales || 0;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position & Role</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => {
                        const statusInfo = getStatusInfo(employee.status);
                        const tenure = EmployeeAPI.calculateTenure(employee.hireDate);
                        const avgPerformanceScore = getAveragePerformanceScore(employee);
                        const recentSalesCount = getRecentSalesCount(employee);

                        return (
                            <TableRow key={employee.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={employee.user?.avatar} />
                                            <AvatarFallback>
                                                {getInitials(employee)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">
                                                {employee.user?.firstName} {employee.user?.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                ID: {employee.id.slice(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{employee.position}</div>
                                        <Badge variant="outline" className={getRoleColor(employee.role)}>
                                            {employee.role}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-3 w-3" />
                                            <span className="font-medium">{employee.store?.name}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {employee.store?.isMainStore ? 'Main Store' : 'Branch'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate max-w-37.5">{employee.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-3 w-3" />
                                            {employee.user?.phone || 'N/A'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            <span className="font-medium">
                                                {avgPerformanceScore !== null
                                                    ? `${avgPerformanceScore.toFixed(1)}%`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        {recentSalesCount > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                {recentSalesCount} sales total
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusInfo.variant}>
                                        {statusInfo.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm">
                                            {format(new Date(employee.hireDate), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {tenure.display}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {onView && (
                                                <DropdownMenuItem onClick={() => onView(employee.id)}>
                                                    <User className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                            )}
                                            {onViewPerformance && (
                                                <DropdownMenuItem onClick={() => onViewPerformance(employee.id)}>
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    View Performance
                                                </DropdownMenuItem>
                                            )}
                                            {onEdit && (
                                                <DropdownMenuItem onClick={() => onEdit(employee)}>
                                                    <Briefcase className="h-4 w-4 mr-2" />
                                                    Edit Employee
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            {onTransfer && (
                                                <DropdownMenuItem onClick={() => onTransfer(employee.id)}>
                                                    <Store className="h-4 w-4 mr-2" />
                                                    Transfer Employee
                                                </DropdownMenuItem>
                                            )}
                                            {employee.status !== 'TERMINATED' && onTerminate && (
                                                <DropdownMenuItem
                                                    onClick={() => onTerminate(employee.id)}
                                                    className="text-red-600"
                                                >
                                                    <UserX className="h-4 w-4 mr-2" />
                                                    Terminate Employee
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}