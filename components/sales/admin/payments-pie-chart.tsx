// components/sales/admin/payments-pie-chart.tsx (Simpler version)
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SalesMetrics } from '@/types/sales';

interface PaymentDistributionChartProps {
    metrics: SalesMetrics | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PaymentDistributionChart({ metrics }: PaymentDistributionChartProps) {
    if (!metrics?.byPaymentMethod || Object.keys(metrics.byPaymentMethod).length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-75 flex items-center justify-center text-muted-foreground">
                        No payment data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const data = Object.entries(metrics.byPaymentMethod).map(([method, data]) => ({
        name: method.replace('_', ' '),
        value: data.total,
        count: data.count,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-75">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => {
                                    // Safely handle undefined percent
                                    const percentage = percent ? (percent * 100).toFixed(0) : '0';
                                    return `${name}: ${percentage}%`;
                                }}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: any, name: any, props: any) => {
                                    // Handle both number and string values
                                    if (typeof value === 'number') {
                                        return [`${value.toLocaleString()} FCFA`, name];
                                    }
                                    return [value, name];
                                }}
                                labelFormatter={(label) => `Payment Method: ${label}`}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}