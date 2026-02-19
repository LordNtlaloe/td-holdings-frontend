// components/sales/charts/sales-line-chart.tsx (Simpler version)
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts';
import { Sale } from '@/types/sales';
import { format, eachDayOfInterval, subDays } from 'date-fns';

interface SalesTrendChartProps {
    sales: Sale[];
}

export function SalesTrendChart({ sales }: SalesTrendChartProps) {
    // Generate last 30 days data
    const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date(),
    });

    const chartData = last30Days.map(date => {
        const daySales = sales.filter(sale =>
            format(new Date(sale.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );

        const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
        const transactions = daySales.length;

        return {
            date: format(date, 'MMM dd'),
            revenue: revenue / 1000, // Convert to thousands
            transactions,
        };
    });

    // Custom tooltip formatter
    const formatTooltipValue = (value: any) => {
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-75">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                                angle={-35}
                                textAnchor="end"
                                height={70}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}k`}
                                width={60}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={60}
                            />
                            <Tooltip 
                                formatter={formatTooltipValue}
                                labelFormatter={(label) => `Date: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue (1000s FCFA)"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="transactions"
                                name="Transactions"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}