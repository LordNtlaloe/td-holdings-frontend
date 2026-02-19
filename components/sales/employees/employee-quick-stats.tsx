// components/sales/employee/employee-quick-stats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Wallet, Target, Award, Calendar, DollarSign } from 'lucide-react';

interface EmployeeQuickStatsProps {
    stats: {
        todaySales: number;
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        weeklyTarget: number;
        weeklyAchieved: number;
        monthlyTarget: number;
        monthlyAchieved: number;
        averageTicket: number;
        rank?: number;
        totalTeam?: number;
    };
}

export function EmployeeQuickStats({ stats }: EmployeeQuickStatsProps) {
    const weeklyProgress = (stats.weeklyAchieved / stats.weeklyTarget) * 100;
    const monthlyProgress = (stats.monthlyAchieved / stats.monthlyTarget) * 100;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.todaySales}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.todayRevenue.toLocaleString()} FCFA revenue
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Avg ticket: {stats.averageTicket.toLocaleString()} FCFA
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.weekRevenue.toLocaleString()} FCFA
                    </div>
                    <Progress value={weeklyProgress} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {weeklyProgress.toFixed(1)}% of weekly target
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.monthRevenue.toLocaleString()} FCFA
                    </div>
                    <Progress value={monthlyProgress} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {monthlyProgress.toFixed(1)}% of monthly target
                    </p>
                </CardContent>
            </Card>

            {stats.rank && stats.totalTeam ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Ranking</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            #{stats.rank} of {stats.totalTeam}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Top {((stats.rank / stats.totalTeam) * 100).toFixed(1)}% performer
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats.monthRevenue / 30).toLocaleString()} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Based on last 30 days
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}