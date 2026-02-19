// components/sales/manager/employee-performance-table.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { Sale } from '@/types/sales';
import { useRouter } from 'next/navigation';

interface EmployeePerformanceTableProps {
    sales: Sale[];
    token: string;
}

interface EmployeeStats {
    employeeId: string;
    employeeName: string;
    transactions: number;
    revenue: number;
    averageTicket: number;
    target?: number;
    achievement: number;
    trend: 'up' | 'down' | 'stable';
}

export function EmployeePerformanceTable({ sales, token }: EmployeePerformanceTableProps) {
    const router = useRouter();
    const [employees, setEmployees] = useState<EmployeeStats[]>([]);

    useEffect(() => {
        // Group sales by employee
        const employeeMap = new Map<string, EmployeeStats>();

        sales.forEach(sale => {
            const empId = sale.employeeId;
            const empName = `${sale.employee?.user?.firstName, " ", sale.employee?.user?.lastName }` ;

            if (!employeeMap.has(empId)) {
                employeeMap.set(empId, {
                    employeeId: empId,
                    employeeName: empName,
                    transactions: 0,
                    revenue: 0,
                    averageTicket: 0,
                    target: 500000, // Example target
                    achievement: 0,
                    trend: 'stable',
                });
            }

            const stats = employeeMap.get(empId)!;
            stats.transactions += 1;
            stats.revenue += sale.total;
        });

        // Calculate averages and achievements
        employeeMap.forEach(stats => {
            stats.averageTicket = stats.transactions > 0 ? stats.revenue / stats.transactions : 0;
            stats.achievement = stats.target ? (stats.revenue / stats.target) * 100 : 0;

            // Simple trend calculation (in real app, compare with previous period)
            stats.trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
        });

        setEmployees(Array.from(employeeMap.values()));
    }, [sales]);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            default:
                return <Minus className="h-4 w-4 text-yellow-500" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead className="text-right">Transactions</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Avg Ticket</TableHead>
                            <TableHead>Target Achievement</TableHead>
                            <TableHead>Trend</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((emp) => (
                            <TableRow key={emp.employeeId}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {emp.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{emp.employeeName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ID: {emp.employeeId.slice(-8)}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {emp.transactions}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {emp.revenue.toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right">
                                    {emp.averageTicket.toLocaleString()} FCFA
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>{emp.achievement.toFixed(1)}%</span>
                                            <span>{emp.target?.toLocaleString()} FCFA</span>
                                        </div>
                                        <Progress value={emp.achievement} className="h-2" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(emp.trend)}
                                        <Badge variant={
                                            emp.trend === 'up' ? 'default' :
                                                emp.trend === 'down' ? 'destructive' :
                                                    'secondary'
                                        }>
                                            {emp.trend === 'up' ? 'Improving' :
                                                emp.trend === 'down' ? 'Declining' :
                                                    'Stable'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/employees/${emp.employeeId}`)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}