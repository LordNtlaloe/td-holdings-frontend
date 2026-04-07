'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
    LineChart, Line, ComposedChart,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SalesDashboardAPI, { 
    SalesByHour, 
    SalesByDayResponse,
    SalesByWeekResponse,
    SalesByMonthResponse,
    SalesByYearResponse 
} from '@/lib/api/sales-dashboard';

interface SalesChartProps {
    storeId?: string;
    token: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    return (
        <div className="rounded-lg border bg-background p-3 shadow-md text-sm space-y-1">
            <p className="font-semibold text-foreground">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.name}: {p.dataKey.includes('revenue') || p.dataKey.includes('Revenue')
                        ? `LSL ${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                        : p.dataKey.includes('growth') || p.dataKey.includes('Growth')
                        ? `${Number(p.value).toFixed(1)}%`
                        : Number(p.value).toLocaleString()}
                </p>
            ))}
        </div>
    );
};

type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'year';

export function SalesChart({ storeId, token }: SalesChartProps) {
    const [period, setPeriod] = useState<TimePeriod>('hour');
    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'revenue' | 'transactions' | 'growth'>('revenue');
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                switch (period) {
                    case 'hour':
                        const hourlyData = await SalesDashboardAPI.getSalesByHour(token, { storeId });
                        // Only show hours with activity or the full business day (6–22)
                        const filtered = hourlyData.filter(h => h.hour >= 6 && h.hour <= 22);
                        setData(filtered);
                        setSummary(null);
                        break;

                    case 'day':
                        const endDate = new Date();
                        const startDate = new Date();
                        startDate.setDate(startDate.getDate() - 30);
                        
                        const dayData: SalesByDayResponse = await SalesDashboardAPI.getSalesByDay(
                            token, 
                            { storeId, startDate, endDate }
                        );
                        setData(dayData.data);
                        setSummary(dayData.summary);
                        break;

                    case 'week':
                        const weekData: SalesByWeekResponse = await SalesDashboardAPI.getSalesByWeek(
                            token,
                            { storeId }
                        );
                        setData(weekData.data);
                        setSummary(weekData.summary);
                        break;

                    case 'month':
                        const monthData: SalesByMonthResponse = await SalesDashboardAPI.getSalesByMonth(
                            token,
                            { storeId, years: 2 }
                        );
                        setData(monthData.data);
                        setSummary(monthData.summary);
                        break;

                    case 'year':
                        const yearData: SalesByYearResponse = await SalesDashboardAPI.getSalesByYear(
                            token,
                            { storeId, startYear: new Date().getFullYear() - 5 }
                        );
                        setData(yearData.data);
                        setSummary(yearData.summary);
                        break;
                }
            } catch (err) {
                console.error(`Failed to load ${period}ly sales:`, err);
            } finally {
                setLoading(false);
            }
        };

        if (token) loadData();
    }, [token, storeId, period]);

    const formatData = () => {
        switch (period) {
            case 'hour':
                return data.map(d => ({
                    ...d,
                    label: `${d.hour.toString().padStart(2, '0')}:00`,
                }));
            case 'day':
                return data.map(d => ({
                    ...d,
                    label: new Date(d.date).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                }));
            case 'week':
                return data.map(d => ({
                    ...d,
                    label: `W${d.weekNumber}`,
                    fullLabel: `${new Date(d.weekStart).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                    })} - ${new Date(d.weekEnd).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                    })}`,
                }));
            case 'month':
                return data.map(d => ({
                    ...d,
                    label: d.monthName.substring(0, 3),
                    fullLabel: `${d.monthName} ${d.year}`,
                }));
            case 'year':
                return data.map(d => ({
                    ...d,
                    label: d.year.toString(),
                }));
            default:
                return data;
        }
    };

    const hasData = data.some(d => 
        (d.revenue > 0) || 
        (d.transactions > 0) || 
        (d.sales > 0)
    );

    const renderChart = () => {
        const formattedData = formatData();

        if (!hasData) {
            return (
                <div className="flex h-75 items-center justify-center">
                    <p className="text-sm text-muted-foreground">No sales data for this period</p>
                </div>
            );
        }

        const commonProps = {
            margin: { top: 10, right: 10, left: 0, bottom: 0 },
        };

        switch (view) {
            case 'revenue':
                return (
                    <ComposedChart data={formattedData} {...commonProps}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={v => `LSL ${(v / 1000).toFixed(0)}k`}
                            className="fill-muted-foreground"
                        />
                        {period === 'week' && (
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={v => `${v}%`}
                                className="fill-muted-foreground"
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey={period === 'hour' ? 'revenue' : 'revenue'}
                            name="Revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#revenueGrad)"
                        />
                        {period === 'week' && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="weekOverWeekGrowth"
                                name="WoW Growth"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                                dot={false}
                            />
                        )}
                        {period === 'month' && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="movingAverage3Months"
                                name="3-Month Avg"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                            />
                        )}
                    </ComposedChart>
                );

            case 'transactions':
                return (
                    <BarChart data={formattedData} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            className="fill-muted-foreground"
                        />
                        {period !== 'hour' && (
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={v => `${v}`}
                                className="fill-muted-foreground"
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            yAxisId="left"
                            dataKey={period === 'hour' ? 'transactions' : 'transactions'}
                            name="Transactions"
                            fill="hsl(var(--primary))"
                            radius={[3, 3, 0, 0]}
                        />
                        {period !== 'hour' && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="averageTicket"
                                name="Avg Ticket"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                            />
                        )}
                    </BarChart>
                );

            case 'growth':
                if (period === 'hour') return null;
                return (
                    <BarChart data={formattedData} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={v => `${v}%`}
                            className="fill-muted-foreground"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey={
                                period === 'day' ? 'growth' :
                                period === 'week' ? 'weekOverWeekGrowth' :
                                period === 'month' ? 'monthOverMonthGrowth' :
                                'yearOverYearGrowth'
                            }
                            name="Growth Rate"
                            fill="hsl(var(--chart-3))"
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                );
        }
    };

    const renderSummary = () => {
        if (!summary || period === 'hour') return null;

        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="text-lg font-bold">
                            LSL {summary.totalRevenue?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Total Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="text-lg font-bold">
                            {summary.totalTransactions?.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Average Ticket
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="text-lg font-bold">
                            LSL {summary.averageTicket?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            {period === 'day' ? 'Daily Avg' : 
                             period === 'week' ? 'Weekly Avg' : 
                             period === 'month' ? 'Monthly Avg' : 'Annual Avg'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="text-lg font-bold">
                            LSL {(
                                period === 'day' ? summary.averageDailyRevenue :
                                period === 'week' ? summary.averageWeeklyRevenue :
                                period === 'month' ? summary.averageMonthlyRevenue :
                                summary.averageAnnualRevenue
                            )?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                {period === 'year' && summary.cagr && (
                    <Card>
                        <CardHeader className="p-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                CAGR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="text-lg font-bold text-green-600">
                                {summary.cagr}%
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs value={period} onValueChange={v => setPeriod(v as TimePeriod)}>
                    <TabsList>
                        <TabsTrigger value="hour">Hourly</TabsTrigger>
                        <TabsTrigger value="day">Daily</TabsTrigger>
                        <TabsTrigger value="week">Weekly</TabsTrigger>
                        <TabsTrigger value="month">Monthly</TabsTrigger>
                        <TabsTrigger value="year">Yearly</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Select value={view} onValueChange={v => setView(v as any)}>
                    <SelectTrigger className="w-35">
                        <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="transactions">Transactions</SelectItem>
                        {period !== 'hour' && <SelectItem value="growth">Growth</SelectItem>}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex h-75 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={300}>
                        {renderChart()}
                    </ResponsiveContainer>
                    {renderSummary()}
                </>
            )}
        </div>
    );
}