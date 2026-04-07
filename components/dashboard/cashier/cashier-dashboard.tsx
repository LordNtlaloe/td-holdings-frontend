'use client';

import { useState, useEffect } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ShoppingCart, Clock, DollarSign, Receipt, TrendingUp,
    RotateCcw, Loader2, Activity, LogIn, LogOut,
    ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

import { DailySummary } from './daily-summary';
import { SalesChart } from './sales-chart';
import { LowStockAlerts } from './low-stock';
import { QuickActions } from './quick-actions';
import { RecentTransactions } from './recent-transactions';
import { TopProductsTable } from './top-products-table';
import { CashDrawerCard } from './cash-drawer-card';

import EmployeeAPI from '@/lib/api/employees';
import SalesDashboardAPI, { DashboardSummary } from '@/lib/api/sales-dashboard';
import type { Employee } from '@/types';
import { useAuth } from '@/contexts/auth-context';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

function StatCard({
    title, value, sub, icon: Icon, trend, trendValue,
}: {
    title: string;
    value: string;
    sub: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}) {
    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-muted/20 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-xs text-muted-foreground">{sub}</p>
                    {trendValue && trend && trend !== 'neutral' && (
                        <span className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                            }`}>
                            {trend === 'up'
                                ? <ArrowUpRight className="h-3 w-3" />
                                : <ArrowDownRight className="h-3 w-3" />
                            }
                            {trendValue}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function WeeklyComparison({ summary }: { summary: DashboardSummary | null }) {
    const rows = [
        {
            label: 'This week revenue',
            value: `LSL ${(summary?.week?.revenue ?? 0).toLocaleString()}`,
            growth: summary?.week?.growth ?? 0,
        },
        {
            label: 'This week transactions',
            value: (summary?.week?.sales ?? 0).toLocaleString(),
            growth: null,
        },
        {
            label: 'Month-to-date revenue',
            value: `LSL ${(summary?.month?.revenue ?? 0).toLocaleString()}`,
            growth: summary?.month?.growth ?? 0,
        },
        {
            label: 'Month transactions',
            value: (summary?.month?.sales ?? 0).toLocaleString(),
            growth: null,
        },
    ];

    return (
        <div className="divide-y">
            {rows.map(row => (
                <div key={row.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{row.value}</span>
                        {row.growth !== null && (
                            <Badge
                                variant={row.growth >= 0 ? 'default' : 'destructive'}
                                className="text-xs h-5 font-mono"
                            >
                                {row.growth >= 0 ? '+' : ''}{row.growth.toFixed(1)}%
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function CashierDashboard() {
    const { user, accessToken } = useAuth();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockTime, setClockTime] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tick = () =>
            setClockTime(
                new Date().toLocaleTimeString('en-ZA', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!accessToken || !user?.id) return;
            try {
                const emp = await EmployeeAPI.getEmployeeByUserId(accessToken, user.id);
                setEmployee(emp);
                const s = await SalesDashboardAPI.getSummary(accessToken, { storeId: emp.storeId });
                setSummary(s);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [accessToken, user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
            </div>
        );
    }

    const todayRevenue = summary?.today?.revenue ?? 0;
    const todaySales = summary?.today?.sales ?? 0;
    const avgTicket = summary?.today?.averageTicket ?? 0;
    const weekGrowth = summary?.week?.growth ?? 0;
    const pendingVoids = summary?.pendingVoids ?? 0;

    return (
        <div className="space-y-6 pb-10 px-6 py-4">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Good {getGreeting()},{' '}
                        <span className="text-primary">{employee?.user?.firstName ?? 'Cashier'}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date().toLocaleDateString('en-ZA', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                        {' · '}
                        <span className="font-mono text-foreground">{clockTime}</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant={isClockedIn ? 'default' : 'secondary'}
                        className="h-6 gap-1"
                    >
                        <Activity className="h-3 w-3" />
                        {isClockedIn ? 'On shift' : 'Off shift'}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsClockedIn(p => !p)}
                    >
                        {isClockedIn
                            ? <><LogOut className="mr-1.5 h-4 w-4" />Clock Out</>
                            : <><LogIn className="mr-1.5 h-4 w-4" />Clock In</>
                        }
                    </Button>
                    <Button size="sm" asChild>
                        <a href="/pos">
                            <ShoppingCart className="mr-1.5 h-4 w-4" />
                            New Sale
                        </a>
                    </Button>
                </div>
            </div>

            {/* KPI row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DailySummary storeId={employee?.storeId} token={accessToken ?? ''} />

                <StatCard
                    title="Today's Revenue"
                    value={`LSL ${todayRevenue.toLocaleString()}`}
                    sub={`${todaySales} transactions`}
                    icon={DollarSign}
                    trend={weekGrowth >= 0 ? 'up' : 'down'}
                    trendValue={`${Math.abs(weekGrowth).toFixed(1)}% vs last week`}
                />

                <StatCard
                    title="Avg. Ticket Size"
                    value={`LSL ${avgTicket.toLocaleString()}`}
                    sub="Per transaction today"
                    icon={TrendingUp}
                />

                <StatCard
                    title="Pending Voids"
                    value={String(pendingVoids)}
                    sub="Awaiting manager approval"
                    icon={Receipt}
                    trend={pendingVoids > 0 ? 'down' : 'neutral'}
                    trendValue={pendingVoids > 0 ? 'Action needed' : undefined}
                />
            </div>

            {/* Main tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="products">Top Products</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                {/* ── Overview ── */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Hourly Sales</CardTitle>
                                <CardDescription>
                                    Revenue and transaction volume by hour today
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SalesChart
                                    storeId={employee?.storeId}
                                    token={accessToken ?? ''}
                                />
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                                <CardDescription>Common operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <QuickActions storeId={employee?.storeId} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <CashDrawerCard revenue={todayRevenue} />

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Period Summary</CardTitle>
                                <CardDescription>Weekly &amp; monthly performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <WeeklyComparison summary={summary} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── Transactions ── */}
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Transactions</CardTitle>
                            <CardDescription>
                                Latest sales, returns, and voids at your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentTransactions
                                storeId={employee?.storeId}
                                token={accessToken ?? ''}
                                limit={20}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Products ── */}
                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Top Selling Products</CardTitle>
                            <CardDescription>
                                Best performers by revenue — this week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TopProductsTable
                                storeId={employee?.storeId}
                                token={accessToken ?? ''}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Inventory ── */}
                <TabsContent value="inventory">
                    <LowStockAlerts
                        storeId={employee?.storeId}
                        token={accessToken ?? ''}
                        threshold={10}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}