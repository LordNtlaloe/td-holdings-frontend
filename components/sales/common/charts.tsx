'use client';

import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { SalesByHour, SalesByDay, TopSellingProduct } from '@/lib/api/sales-dashboard';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
            <p className="font-medium mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}:{' '}
                    {p.name?.toLowerCase().includes('revenue')
                        ? `${Number(p.value).toLocaleString()} FCFA`
                        : p.value}
                </p>
            ))}
        </div>
    );
};

// ─── Sales By Hour ──────────────────────────────────────────────────────────
export function SalesByHourChart({ data }: { data: SalesByHour[] }) {
    const formatted = data.map(d => ({
        ...d,
        label: `${String(d.hour).padStart(2, '0')}:00`,
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="transactions" name="Transactions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── Revenue Trend ──────────────────────────────────────────────────────────
export function RevenueTrendChart({ data }: { data: SalesByDay[] }) {
    const formatted = data.map(d => ({
        ...d,
        label: typeof d.date === 'string'
            ? d.date.slice(5)
            : new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="empRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#empRevenueGrad)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ─── Top Products ────────────────────────────────────────────────────────────
const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function TopProductsChart({ data }: { data: TopSellingProduct[] }) {
    const top5 = data.slice(0, 5);
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top5} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 3, 3, 0]}>
                    {top5.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}