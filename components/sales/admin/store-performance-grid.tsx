// components/sales/admin/store-performance-grid.tsx
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingBag,
    DollarSign,
    Target,
} from 'lucide-react';
import { Sale } from '@/types/sales';

interface StorePerformanceGridProps {
    sales: Sale[];
    stores: Array<{ id: string; name: string }>;
}

interface StoreMetrics {
    storeId: string;
    storeName: string;
    revenue: number;
    transactions: number;
    employees: Set<string>;
    averageTicket: number;
    growth: number;
    target: number;
    achievement: number;
}

export function StorePerformanceGrid({ sales, stores }: StorePerformanceGridProps) {
    // Calculate metrics per store
    const storeMetrics: StoreMetrics[] = stores.map(store => {
        const storeSales = sales.filter(s => s.storeId === store.id);
        const revenue = storeSales.reduce((sum, s) => sum + s.total, 0);
        const transactions = storeSales.length;
        const employees = new Set(storeSales.map(s => s.employeeId));
        const target = 5000000; // Example target per store
        const achievement = (revenue / target) * 100;

        // Calculate growth (mock data for demo)
        const growth = Math.random() * 20 - 5; // Random between -5 and 15

        return {
            storeId: store.id,
            storeName: store.name,
            revenue,
            transactions,
            employees,
            averageTicket: transactions > 0 ? revenue / transactions : 0,
            growth,
            target,
            achievement,
        };
    });

    const totalRevenue = storeMetrics.reduce((sum, s) => sum + s.revenue, 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {storeMetrics.map((store) => (
                <Card key={store.storeId}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{store.storeName}</CardTitle>
                            <Badge variant={store.growth >= 0 ? 'default' : 'destructive'}>
                                {store.growth >= 0 ? '+' : ''}{store.growth.toFixed(1)}%
                            </Badge>
                        </div>
                        <CardDescription>
                            Store ID: {store.storeId.slice(-8)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <DollarSign className="mr-1 h-4 w-4" />
                                        Revenue
                                    </div>
                                    <p className="text-lg font-bold">
                                        {store.revenue.toLocaleString()} FCFA
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {((store.revenue / totalRevenue) * 100).toFixed(1)}% of total
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <ShoppingBag className="mr-1 h-4 w-4" />
                                        Transactions
                                    </div>
                                    <p className="text-lg font-bold">{store.transactions}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Avg: {store.averageTicket.toLocaleString()} FCFA
                                    </p>
                                </div>
                            </div>

                            {/* Employees */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Users className="mr-1 h-4 w-4" />
                                        Active Employees
                                    </div>
                                    <span className="font-medium">{store.employees.size}</span>
                                </div>
                            </div>

                            {/* Target Achievement */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Target className="mr-1 h-4 w-4" />
                                        Target Achievement
                                    </div>
                                    <span className="font-medium">
                                        {store.achievement.toFixed(1)}%
                                    </span>
                                </div>
                                <Progress value={store.achievement} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    Target: {store.target.toLocaleString()} FCFA
                                </p>
                            </div>

                            {/* Growth Indicator */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                                {store.growth >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">
                                    {store.growth >= 0 ? 'Growth' : 'Decline'} compared to last period
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}