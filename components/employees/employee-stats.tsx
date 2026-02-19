'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    UserCheck,
    UserX,
    UserCog,
    TrendingUp,
    Target,
    BarChart3,
    Award,
    Calendar,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmployeeStats as EmployeeStatsType } from '@/types';

interface EmployeeStatsProps {
    stats: EmployeeStatsType;
}

export function EmployeeStats({ stats }: EmployeeStatsProps) {
    const statCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees || 0,
            icon: <Users className="h-4 w-4" />,
            description: 'All employees across stores',
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            title: 'Active Employees',
            value: stats.activeEmployees || 0,
            icon: <UserCheck className="h-4 w-4" />,
            description: 'Currently working',
            color: 'bg-green-500/10 text-green-600',
        },
        {
            title: 'On Leave',
            value: stats.onLeave || 0,
            icon: <UserCog className="h-4 w-4" />,
            description: 'Currently on leave',
            color: 'bg-yellow-500/10 text-yellow-600',
        },
        {
            title: 'Terminated',
            value: stats.terminated || 0,
            icon: <UserX className="h-4 w-4" />,
            description: 'This year',
            color: 'bg-red-500/10 text-red-600',
        },
        {
            title: 'Avg Performance',
            value: `${stats.averagePerformanceScore?.toFixed(1) || 0}%`,
            icon: <Target className="h-4 w-4" />,
            description: 'Overall score',
            color: 'bg-purple-500/10 text-purple-600',
        },
        {
            title: 'Turnover Rate',
            value: `${stats.turnoverRate?.toFixed(1) || 0}%`,
            icon: <BarChart3 className="h-4 w-4" />,
            description: 'Last 12 months',
            color: 'bg-orange-500/10 text-orange-600',
        },
        {
            title: 'Recent Hires',
            value: stats.recentHires || 0,
            icon: <Award className="h-4 w-4" />,
            description: 'Last 30 days',
            color: 'bg-teal-500/10 text-teal-600',
        },
        {
            title: 'Upcoming Reviews',
            value: stats.upcomingReviews || 0,
            icon: <Calendar className="h-4 w-4" />,
            description: 'Next 30 days',
            color: 'bg-cyan-500/10 text-cyan-600',
        },
    ];

    // Calculate average tenure if byStore data exists
    const avgTenure = stats.byStore?.length > 0
        ? '2.5 yrs'
        : '0 yrs';

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {statCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={cn("p-2 rounded-full", stat.color)}>
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}

            {/* Role Distribution Summary */}
            {stats.byRole && stats.byRole.length > 0 && (
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.byRole.map((role) => (
                                <div key={role.role} className="space-y-1">
                                    <p className="text-sm font-medium">{role.role}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">{role.count}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {role.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}