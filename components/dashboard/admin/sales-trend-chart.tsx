'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Calendar, TrendingUp, Loader2 } from 'lucide-react';
import SalesReportsAPI from '@/lib/api/sales-report';
import { formatCurrency } from '@/lib/utils';
import type { SalesTrendData } from '@/types/sales';

interface SalesTrendChartProps {
    token: string;
    storeId?: string;
    dateRange?: { from: Date; to: Date };
}

export function SalesTrendChart({ token, storeId, dateRange }: SalesTrendChartProps) {
    const [data, setData] = useState<any[]>([]);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState<SalesTrendData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If dateRange is provided, use it instead of period
                const params: any = {
                    storeId,
                    ...(dateRange ? {
                        startDate: dateRange.from,
                        endDate: dateRange.to
                    } : {
                        period
                    })
                };

                const trend = await SalesReportsAPI.getSalesTrend(token, params);
                setTrendData(trend);
                setData(trend.dailyTrend || []);
            } catch (error) {
                console.error('Failed to fetch sales trend:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, storeId, period, dateRange]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate summary from the trend data
    const totalRevenue = data.reduce((sum, day) => sum + (day.revenue || 0), 0);
    const averageDaily = data.length > 0 ? totalRevenue / data.length : 0;
    
    // Find peak day
    const peakDay = data.reduce((max, day) => 
        (day.revenue || 0) > (max?.revenue || 0) ? day : max, data[0]);
    
    // Calculate growth (compare first half vs second half)
    const midPoint = Math.floor(data.length / 2);
    const firstHalfRevenue = data.slice(0, midPoint).reduce((sum, day) => sum + (day.revenue || 0), 0);
    const secondHalfRevenue = data.slice(midPoint).reduce((sum, day) => sum + (day.revenue || 0), 0);
    const growth = firstHalfRevenue > 0 
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
        : 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales Trend</CardTitle>
                {!dateRange && ( // Only show period buttons if no dateRange provided
                    <div className="flex gap-1">
                        <Button
                            variant={period === '7d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('7d')}
                        >
                            7D
                        </Button>
                        <Button
                            variant={period === '30d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('30d')}
                        >
                            30D
                        </Button>
                        <Button
                            variant={period === '90d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('90d')}
                        >
                            90D
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {data.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Daily Average</p>
                            <p className="text-2xl font-bold">{formatCurrency(averageDaily)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Growth</p>
                            <div className="flex items-center gap-1">
                                <TrendingUp className={`h-5 w-5 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                                <p className={`text-2xl font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Peak Day</p>
                            <p className="text-2xl font-bold">
                                {peakDay ? formatCurrency(peakDay.revenue || 0) : 'N/A'}
                            </p>
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#adfa1d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#adfa1d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => {
                                try {
                                    return new Date(date).toLocaleDateString();
                                } catch {
                                    return date;
                                }
                            }}
                        />
                        <YAxis
                            tickFormatter={(value) => `LSL ${(value / 1000).toFixed(0)}k`}
                        />
            
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#adfa1d"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}