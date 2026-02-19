// components/sales/manager/team-performance-chart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts';
import { Sale } from '@/types/sales';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface TeamPerformanceChartProps {
    sales: Sale[];
}

export function TeamPerformanceChart({ sales }: TeamPerformanceChartProps) {
    // Generate last 7 days data
    const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
    });

    const chartData = last7Days.map(date => {
        const daySales = sales.filter(sale =>
            format(new Date(sale.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );

        return {
            date: format(date, 'MMM dd'),
            revenue: daySales.reduce((sum, sale) => sum + sale.total, 0) / 1000, // Convert to thousands
            transactions: daySales.length,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Performance (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-75">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}k`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="revenue"
                                name="Revenue (1000s FCFA)"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="transactions"
                                name="Transactions"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}