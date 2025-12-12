// components/dashboard/stores/charts/top-stores-chart.tsx
"use client";

import { Store } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopStoresChartProps {
    stores: Store[];
}

export default function TopStoresChart({ stores }: TopStoresChartProps) {
    const topStores = [...stores]
        .sort((a, b) => (b._count?.sales || 0) - (a._count?.sales || 0))
        .slice(0, 5)
        .map(store => ({
            name: store.name.substring(0, 10) + (store.name.length > 10 ? '...' : ''),
            sales: store._count?.sales || 0,
            employees: store._count?.employees || 0,
        }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="Total Sales" fill="#8884d8" />
                <Bar dataKey="employees" name="Employees" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    );
}