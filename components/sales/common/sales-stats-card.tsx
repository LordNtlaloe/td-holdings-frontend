// components/sales/common/sale-stats-cards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet, FileText, Users, ShoppingCart, Percent } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    trend?: number;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend !== undefined) && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                        {trend !== undefined && (
                            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {' '}
                                {trend >= 0 ? '+' : ''}{trend}%
                            </span>
                        )}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface SaleStatsCardsProps {
    stats: {
        todaySales: number;
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        averageTicket: number;
        totalTransactions: number;
        growth?: {
            daily?: number;
            weekly?: number;
            monthly?: number;
        };
    };
    showDetailed?: boolean;
}

export function SaleStatsCards({ stats, showDetailed = false }: SaleStatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Today's Sales"
                value={stats.todaySales}
                description={`${stats.todayRevenue.toLocaleString()} FCFA total`}
                icon={<TrendingUp className="h-4 w-4" />}
                trend={stats.growth?.daily}
            />

            <StatCard
                title="Today's Revenue"
                value={`${stats.todayRevenue.toLocaleString()} FCFA`}
                description={`Avg: ${stats.averageTicket.toLocaleString()} FCFA`}
                icon={<Wallet className="h-4 w-4" />}
            />

            <StatCard
                title="Weekly Revenue"
                value={`${stats.weekRevenue.toLocaleString()} FCFA`}
                icon={<ShoppingCart className="h-4 w-4" />}
                trend={stats.growth?.weekly}
            />

            <StatCard
                title="Monthly Revenue"
                value={`${stats.monthRevenue.toLocaleString()} FCFA`}
                icon={<Percent className="h-4 w-4" />}
                trend={stats.growth?.monthly}
            />

            {showDetailed && (
                <>
                    <StatCard
                        title="Total Transactions"
                        value={stats.totalTransactions}
                        description="All time"
                        icon={<FileText className="h-4 w-4" />}
                    />

                    <StatCard
                        title="Average Ticket"
                        value={`${stats.averageTicket.toLocaleString()} FCFA`}
                        icon={<Users className="h-4 w-4" />}
                    />
                </>
            )}
        </div>
    );
}