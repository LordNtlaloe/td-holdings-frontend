'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    UserCheck,
    UserX,
    UserCog,
    TrendingUp,
    DollarSign,
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
            value: stats.totalEmployees,
            icon: <Users className="h-4 w-4" />,
            description: 'All employees across stores',
            color: 'bg-blue-500/10 text-blue-600',
            trend: null,
        },
        {
            title: 'Active Employees',
            value: stats.activeEmployees,
            icon: <UserCheck className="h-4 w-4" />,
            description: 'Currently working',
            color: 'bg-green-500/10 text-green-600',
            trend: '+5%',
        },
        {
            title: 'On Leave',
            value: stats.onLeave,
            icon: <UserCog className="h-4 w-4" />,
            description: 'Currently on leave',
            color: 'bg-yellow-500/10 text-yellow-600',
            trend: '+2',
        },
        {
            title: 'Terminated',
            value: stats.terminated,
            icon: <UserX className="h-4 w-4" />,
            description: 'This year',
            color: 'bg-red-500/10 text-red-600',
            trend: '-1%',
        },
        {
            title: 'Avg Performance',
            value: `${stats.averagePerformanceScore.toFixed(1)}%`,
            icon: <Target className="h-4 w-4" />,
            description: 'Overall score',
            color: 'bg-purple-500/10 text-purple-600',
            trend: '+2.5%',
        },
        {
            title: 'Turnover Rate',
            value: `${stats.turnoverRate.toFixed(1)}%`,
            icon: <BarChart3 className="h-4 w-4" />,
            description: 'Last 12 months',
            color: 'bg-orange-500/10 text-orange-600',
            trend: '-0.5%',
        },
        {
            title: 'Recent Hires',
            value: stats.recentHires,
            icon: <Award className="h-4 w-4" />,
            description: 'Last 30 days',
            color: 'bg-teal-500/10 text-teal-600',
            trend: '+3',
        },
        {
            title: 'Upcoming Reviews',
            value: stats.upcomingReviews,
            icon: <Calendar className="h-4 w-4" />,
            description: 'Next 30 days',
            color: 'bg-cyan-500/10 text-cyan-600',
            trend: '+5',
        },
        {
            title: 'Avg Tenure',
            value: `${stats.byStore.length > 0 ? '2.5' : '0'} yrs`,
            icon: <Clock className="h-4 w-4" />,
            description: 'Average employee tenure',
            color: 'bg-pink-500/10 text-pink-600',
            trend: '+0.2 yrs',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={cn("p-2 rounded-full", stat.color)}>
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.trend && (
                                <div className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    stat.trend.startsWith('+')
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                )}>
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}