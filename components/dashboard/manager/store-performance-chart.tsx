'use client';

import { useState, useEffect } from 'react';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';
import SalesDashboardAPI from '@/lib/api/sales-dashboard';
import { Loader2 } from 'lucide-react';

interface StorePerformanceChartProps {
    token: string;
}

export function StorePerformanceChart({ token }: StorePerformanceChartProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stores = await SalesDashboardAPI.getStorePerformance(token);

                // Transform for chart
                const chartData = stores.map(store => ({
                    name: store.storeName,
                    sales: store.revenue,
                    target: store.target || store.revenue * 1.1 // Fallback if no target
                }));

                setData(chartData);
            } catch (error) {
                console.error('Failed to fetch store performance:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-87.5 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `LSL ${value / 1000}k`}
                />
    
                <Legend />
                <Bar dataKey="sales" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Actual Sales" />
                <Bar dataKey="target" fill="#f97316" radius={[4, 4, 0, 0]} name="Target" />
            </BarChart>
        </ResponsiveContainer>
    );
}