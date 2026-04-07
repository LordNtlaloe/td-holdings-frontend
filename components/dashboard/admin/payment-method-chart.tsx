'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
import SalesReportsAPI from '@/lib/api/sales-report';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#adfa1d', '#f97316', '#3b82f6', '#a855f7', '#ef4444'];

interface PaymentMethodsChartProps {
    token: string;
    storeId?: string;
    dateRange?: { from: Date; to: Date };
}

export function PaymentMethodsChart({ token, storeId, dateRange }: PaymentMethodsChartProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analytics = await SalesReportsAPI.getPaymentAnalytics(token, {
                    storeId,
                    startDate: dateRange?.from,
                    endDate: dateRange?.to
                });

                setData(analytics.distribution || []);
            } catch (error) {
                console.error('Failed to fetch payment analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, storeId, dateRange]);

    // Calculate total for percentage display
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => {
                                const percentage = total > 0 ? ((value || 0) / total) * 100 : 0;
                                return `${name} ${percentage.toFixed(0)}%`;
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                    {data.map((method, index) => {
                        const percentage = total > 0 ? ((method.amount || 0) / total) * 100 : 0;
                        
                        return (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span>{method.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        {percentage.toFixed(1)}%
                                    </span>
                                    <span className="font-medium">{formatCurrency(method.amount)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}