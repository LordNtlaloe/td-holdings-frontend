'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import SalesDashboardAPI, { DashboardSummary } from '@/lib/api/sales-dashboard';

interface DailySummaryProps {
    storeId?: string;
    token: string;
}

export function DailySummary({ storeId, token }: DailySummaryProps) {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await SalesDashboardAPI.getSummary(token, { storeId });
                setSummary(data);
            } catch (err) {
                console.error('Failed to fetch daily summary:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) load();
    }, [token, storeId]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="h-24 animate-pulse bg-muted rounded" />
                </CardContent>
            </Card>
        );
    }

    const dailyTarget  = 20000;
    const currentSales = summary?.today?.revenue ?? 0;
    const percentage   = Math.min((currentSales / dailyTarget) * 100, 100);
    const isAchieved   = percentage >= 100;

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-muted/20 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Target
                </CardTitle>
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                    LSL {currentSales.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                    of LSL {dailyTarget.toLocaleString()} target
                </p>
                <Progress value={percentage} className="h-1.5" />
                <div className="mt-2 flex items-center gap-1 text-xs">
                    {isAchieved ? (
                        <>
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Target achieved!</span>
                        </>
                    ) : (
                        <>
                            <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-amber-500">
                                {Math.round(100 - percentage)}% remaining
                            </span>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}