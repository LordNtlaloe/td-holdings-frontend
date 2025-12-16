'use client';

import { Employee } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    MapPin,
    Mail,
    Phone,
    TrendingUp,
    MoreHorizontal
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmployeeCardProps {
    employee: Employee;
    onEdit?: (employee: Employee) => void;
    onTransfer?: (employeeId: string) => void;
    onTerminate?: (employeeId: string) => void;
    onViewPerformance?: (employeeId: string) => void;
    showActions?: boolean;
    compact?: boolean;
}

export function EmployeeCard({
    employee,
    onEdit,
    onTransfer,
    onTerminate,
    onViewPerformance,
    showActions = true,
    compact = false
}: EmployeeCardProps) {
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
            case 'CASHIER': return 'bg-green-100 text-green-800 border-green-200';
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

    if (compact) {
        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={employee.user.avatar} />
                                <AvatarFallback>
                                    {getInitials(employee.user.firstName)}{getInitials(employee.user.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{employee.user.firstName}&nbsp;{employee.user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{employee.position}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={getRoleColor(employee.role)}>
                                {employee.role}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(employee.status)}>
                                {employee.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={employee.user.avatar} />
                            <AvatarFallback>
                                    {getInitials(employee.user.firstName)}{getInitials(employee.user.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{employee.user.firstName}&nbsp;{employee.user.lastName}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                {employee.position}
                            </CardDescription>
                        </div>
                    </div>
                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onViewPerformance?.(employee.id)}>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View Performance
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit?.(employee)}>
                                    <User className="h-4 w-4 mr-2" />
                                    Edit Employee
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onTransfer?.(employee.id)}>
                                    <Building className="h-4 w-4 mr-2" />
                                    Transfer Employee
                                </DropdownMenuItem>
                                {employee.status !== 'TERMINATED' && (
                                    <DropdownMenuItem
                                        onClick={() => onTerminate?.(employee.id)}
                                        className="text-red-600"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Terminate
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.store.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{employee.store.location}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={getRoleColor(employee.role)}>
                                {employee.role}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(employee.status)}>
                                {employee.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.user.phone}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Hired {format(new Date(employee.hireDate), 'MMM yyyy')}</span>
                            </div>
                            {employee.salary && (
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>${employee.salary.toLocaleString()}/month</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {employee._count && (
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                            <div className="text-center">
                                <div className="font-semibold">
                                    {employee._count.sales || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Sales</p>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold">
                                    {employee._count.transactions || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Transactions</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span className="font-semibold">
                                        {employee.performanceScore?.toFixed(1) || 'N/A'}%
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Performance</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t">
                <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                        {employee.status === 'ACTIVE' ? 'Active' : 'Inactive'} •
                        Tenure: {formatDistanceToNow(new Date(employee.hireDate))}
                    </span>
                    <Link
                        href={`/workforce/employees/${employee.id}`}
                        className="text-primary hover:underline"
                    >
                        View Details →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}