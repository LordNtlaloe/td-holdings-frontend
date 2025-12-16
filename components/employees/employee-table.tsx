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
    DollarSign,
    Target,
    Calendar,
    Mail,
    Phone,
    MoreHorizontal,
    TrendingUp,
    ArrowRightLeft,
    UserX
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
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'TERMINATED': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'MANAGER': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'SUPERVISOR': return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100';
            case 'CASHIER': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'WAREHOUSE': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
                        <TableHead>Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={employee.user.avatar} />
                                        <AvatarFallback>
                                            {getInitials(employee.user.firstName)}{getInitials(employee.user.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{employee.user.firstName}&nbsp;{employee.user.lastName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            ID: {employee.id.slice(0, 8)}...
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium">{employee.position}</div>
                                    <Badge variant="secondary" className={getRoleColor(employee.role)}>
                                        {employee.role}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-3 w-3" />
                                        <span className="font-medium">{employee.store.name}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {employee.store.isMainStore ? 'Main Store' : 'Branch'}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3 w-3" />
                                        {employee.user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3" />
                                        {employee.user.phone}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    <span className="font-medium">
                                        {employee.performanceScore?.toFixed(1) || 'N/A'}%
                                    </span>
                                    {employee._count && (
                                        <span className="text-sm text-muted-foreground">
                                            ({employee._count.sales || 0} sales)
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(employee.status)}>
                                    {employee.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="text-sm">
                                        {format(new Date(employee.hireDate), 'MMM d, yyyy')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(employee.hireDate), 'yyyy')}
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
                                                <ArrowRightLeft className="h-4 w-4 mr-2" />
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}