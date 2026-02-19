// components/sales/manager/store-sales-summary.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Store, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Sale } from '@/types/sales';

interface StoreSalesSummaryProps {
    sales: Sale[];
    storeIds: string[];
    storeNames?: Record<string, string>;
}

export function StoreSalesSummary({ sales, storeIds, storeNames = {} }: StoreSalesSummaryProps) {
    // Calculate metrics per store
    const storeMetrics = storeIds.map(storeId => {
        const storeSales = sales.filter(s => s.storeId === storeId);
        const revenue = storeSales.reduce((sum, s) => sum + s.total, 0);
        const transactions = storeSales.length;
        const employees = new Set(storeSales.map(s => s.employeeId)).size;
        const target = 1000000; // Example target per store
        const achievement = (revenue / target) * 100;

        return {
            storeId,
            storeName: storeNames[storeId] || `Store ${storeId.slice(-8)}`,
            revenue,
            transactions,
            employees,
            target,
            achievement,
        };
    }).sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

    const totalRevenue = storeMetrics.reduce((sum, s) => sum + s.revenue, 0);
    const topStore = storeMetrics[0];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Store Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {topStore && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Top Performing Store</p>
                        <p className="text-lg font-bold">{topStore.storeName}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            {topStore.revenue.toLocaleString()} FCFA ({((topStore.revenue / totalRevenue) * 100).toFixed(1)}% of total)
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {storeMetrics.map((store) => (
                        <div key={store.storeId} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Store className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{store.storeName}</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {store.revenue.toLocaleString()} FCFA
                                </span>
                            </div>

                            <Progress value={store.achievement} className="h-2" />

                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{store.transactions} transactions</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{store.employees} employees</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{((store.revenue / totalRevenue) * 100).toFixed(1)}% of total</span>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Target: {store.achievement.toFixed(1)}% ({store.target.toLocaleString()} FCFA)
                            </div>
                        </div>
                    ))}

                    {storeMetrics.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                            No store data available
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}