'use client';

import { useState, useEffect, useCallback, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    TrendingUp, Wallet, Target, Award, RefreshCw, Plus, Search,
    ShoppingBag, Clock, ChevronRight, Eye, FileText, Printer,
    Download, Store, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import SalesDashboardAPI, {
    SalesByHour, SalesByDay, TopSellingProduct,
} from '@/lib/api/sales-dashboard';
import SalesAPI from '@/lib/api/sales';
import StoreAPI from '@/lib/api/stores';
import { Sale } from '@/types/sales';
import { Store as StoreType } from '@/types';
import { SalesByHourChart, RevenueTrendChart, TopProductsChart } from '../common/charts';
import { DateRangePicker } from '../common/date-range-picker';
import { PaymentMethodBadge } from '../common/payment-method-badge';
import { SaleDetailsDialog } from '../common/sales-details-dialog';
import { SalesTable } from '../common/sales-table';
import { VoidSaleDialog } from './voided-sales-dialog';


// ─── Constants ────────────────────────────────────────────────────────────────
const WEEKLY_TARGET  = 500_000;
const MONTHLY_TARGET = 2_000_000;

// ─── Props ────────────────────────────────────────────────────────────────────
interface EmployeeSalesViewProps {
    employeeId: string;
    storeId: string;
    token: string;
    employeeName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `${Math.round(n).toLocaleString()} FCFA`;

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
];

function getInitials(name?: string | null) {
    if (!name) return 'W';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function transformSale(s: any): Sale {
    return {
        ...s,
        createdAt:  new Date(s.createdAt),
        updatedAt:  s.updatedAt ? new Date(s.updatedAt) : new Date(s.createdAt),
        saleItems:  s.saleItems ?? [],
        voidedSale: s.voidedSale
            ? { ...s.voidedSale, createdAt: new Date(s.voidedSale.createdAt) }
            : undefined,
    };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    title, value, sub, icon, loading, progress,
}: {
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    loading?: boolean;
    progress?: number;
}) {
    if (loading) return <Skeleton className="h-32 w-full" />;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {progress !== undefined && (
                    <Progress value={progress} className="mt-2 h-1.5" />
                )}
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function EmployeeSalesView({
    employeeId, storeId, token, employeeName,
}: EmployeeSalesViewProps) {
    const router = useRouter();

    const [dashLoading, setDashLoading]   = useState(true);
    const [salesLoading, setSalesLoading] = useState(true);
    const [store, setStore]               = useState<StoreType | null>(null);
    const [salesByHour, setSalesByHour]   = useState<SalesByHour[]>([]);
    const [salesByDay, setSalesByDay]     = useState<SalesByDay[]>([]);
    const [topProducts, setTopProducts]   = useState<TopSellingProduct[]>([]);
    const [sales, setSales]               = useState<Sale[]>([]);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showDetails, setShowDetails]   = useState(false);
    const [showVoid, setShowVoid]         = useState(false);
    const [searchTerm, setSearchTerm]     = useState('');
    const [dateRange, setDateRange]       = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to:   new Date(),
    });

    // ── Guard: don't fetch until we have a token ───────────────────────────────
    const ready = Boolean(token && storeId && employeeId);

    // ── Store info ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!ready) return;
        StoreAPI.getStore(token, storeId).then(setStore).catch(() => {});
    }, [token, storeId, ready]);

    // ── Dashboard charts ───────────────────────────────────────────────────────
    const fetchDashboard = useCallback(async () => {
        if (!ready) return;
        setDashLoading(true);
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

            const [byHour, byDay, products] = await Promise.all([
                SalesDashboardAPI.getSalesByHour(token, { storeId }),
                SalesDashboardAPI.getSalesByDay(token, {
                    storeId,
                    startDate: thirtyDaysAgo,
                    endDate:   new Date(),
                }),
                SalesDashboardAPI.getTopProducts(token, { storeId, limit: 5 }),
            ]);

            setSalesByHour(byHour ?? []);
            setSalesByDay((byDay as any)?.data ?? byDay ?? []);
            setTopProducts(products ?? []);
        } catch (e) {
            console.error('Dashboard fetch error:', e);
            toast.error('Failed to load chart data');
        } finally {
            setDashLoading(false);
        }
    }, [token, storeId, ready]);

    // ── Sales list ─────────────────────────────────────────────────────────────
    const fetchSales = useCallback(async () => {
        if (!ready) return;
        setSalesLoading(true);
        try {
            const res = await SalesAPI.getSales(token, {
                employeeId,
                storeId,
                startDate: dateRange?.from,
                endDate:   dateRange?.to,
                limit:     100,
                search:    searchTerm || undefined,
            });
            setSales((res.data ?? []).map(transformSale));
        } catch (e) {
            console.error('Sales fetch error:', e);
            toast.error('Failed to load sales');
        } finally {
            setSalesLoading(false);
        }
    }, [token, employeeId, storeId, dateRange, searchTerm, ready]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
    useEffect(() => { fetchSales();     }, [fetchSales]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const today      = new Date().toDateString();
    const weekAgo    = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const todaySales   = sales.filter(s => new Date(s.createdAt).toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    const weekRevenue  = sales.filter(s => new Date(s.createdAt) >= weekAgo).reduce((sum, s) => sum + s.total, 0);
    const monthRevenue = sales.filter(s => new Date(s.createdAt) >= monthStart).reduce((sum, s) => sum + s.total, 0);
    const avgTicket    = sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0;
    const weeklyPct    = Math.min((weekRevenue  / WEEKLY_TARGET)  * 100, 100);
    const monthlyPct   = Math.min((monthRevenue / MONTHLY_TARGET) * 100, 100);

    const handleRefresh = () => { fetchDashboard(); fetchSales(); };

    const isLoading = dashLoading || salesLoading;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Welcome back, {employeeName ?? 'Employee'}!
                        </h2>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            Cashier
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <Store className="h-3.5 w-3.5" />
                        {store
                            ? `${store.name}${store.city ? ` · ${store.city}` : ''}`
                            : storeId
                                ? `Store #${storeId.slice(-8)}`
                                : 'Loading store…'
                        }
                        {store?.isMainStore && (
                            <Badge variant="outline" className="text-xs ml-1">Main Store</Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline" size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => router.push('/sales/new')}>
                        <Plus className="mr-2 h-4 w-4" /> New Sale
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Today"
                    value={`${todaySales.length} sales`}
                    sub={`${fmtCurrency(todayRevenue)} revenue`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    loading={salesLoading}
                />
                <StatCard
                    title="This Week"
                    value={fmtCurrency(weekRevenue)}
                    sub={`${weeklyPct.toFixed(1)}% of ${fmtCurrency(WEEKLY_TARGET)} target`}
                    progress={weeklyPct}
                    icon={<Wallet className="h-4 w-4" />}
                    loading={salesLoading}
                />
                <StatCard
                    title="This Month"
                    value={fmtCurrency(monthRevenue)}
                    sub={`${monthlyPct.toFixed(1)}% of ${fmtCurrency(MONTHLY_TARGET)} target`}
                    progress={monthlyPct}
                    icon={<Target className="h-4 w-4" />}
                    loading={salesLoading}
                />
                <StatCard
                    title="Avg Ticket"
                    value={fmtCurrency(avgTicket)}
                    sub="across selected period"
                    icon={<Award className="h-4 w-4" />}
                    loading={salesLoading}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">

                        {/* Recent sales */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base">Recent Sales</CardTitle>
                                <Button
                                    variant="ghost" size="sm"
                                    className="text-xs text-muted-foreground gap-1"
                                    onClick={() => {
                                        const el = document.querySelector('[value="history"]') as HTMLButtonElement;
                                        el?.click();
                                    }}
                                >
                                    View All <ChevronRight className="h-3 w-3" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {salesLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className="h-14 w-full" />
                                    ))
                                ) : sales.length === 0 ? (
                                    <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                                        <ShoppingBag className="h-8 w-8 mb-2 opacity-40" />
                                        <p className="text-sm">No sales yet</p>
                                        <Button
                                            variant="outline" size="sm" className="mt-3"
                                            onClick={() => router.push('/sales/new')}
                                        >
                                            <Plus className="mr-2 h-3.5 w-3.5" /> Create Sale
                                        </Button>
                                    </div>
                                ) : (
                                    sales.slice(0, 5).map((sale, idx) => (
                                        <div
                                            key={sale.id}
                                            className="group flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className={`h-9 w-9 shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                                    <AvatarFallback className="text-xs font-medium">
                                                        {getInitials(sale.customerName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {sale.customerName ?? 'Walk-in Customer'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(sale.createdAt), 'MMM dd, HH:mm')}
                                                        {' · '}
                                                        <span className="font-mono">
                                                            #{sale.id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2 shrink-0">
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">
                                                        {fmtCurrency(sale.total)}
                                                    </p>
                                                    <PaymentMethodBadge method={sale.paymentMethod} />
                                                </div>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => { setSelectedSale(sale); setShowDetails(true); }}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Right column */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Today's Activity by Hour
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashLoading
                                        ? <Skeleton className="h-52 w-full" />
                                        : salesByHour.length === 0
                                            ? <p className="text-sm text-muted-foreground text-center py-16">No hourly data yet</p>
                                            : <SalesByHourChart data={salesByHour} />
                                    }
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button className="w-full justify-start" variant="outline"
                                        onClick={() => router.push('/sales/reports/daily')}>
                                        <FileText className="mr-2 h-4 w-4" /> Daily Report
                                    </Button>
                                    <Button className="w-full justify-start" variant="outline"
                                        onClick={() => window.print()}>
                                        <Printer className="mr-2 h-4 w-4" /> Print End-of-Day Summary
                                    </Button>
                                    <Button className="w-full justify-start" variant="outline"
                                        onClick={() => toast.info('Preparing your export…')}>
                                        <Download className="mr-2 h-4 w-4" /> Export Sales Data
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Trends */}
                <TabsContent value="trends">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" /> Revenue – Last 30 Days
                            </CardTitle>
                            <CardDescription>Your store's sales trend</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashLoading
                                ? <Skeleton className="h-56 w-full" />
                                : salesByDay.length === 0
                                    ? <p className="text-sm text-muted-foreground text-center py-16">No trend data available</p>
                                    : <RevenueTrendChart data={salesByDay} />
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Products */}
                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Top Products in Your Store</CardTitle>
                            <CardDescription>By revenue this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashLoading
                                ? <Skeleton className="h-56 w-full" />
                                : topProducts.length === 0
                                    ? <p className="text-sm text-muted-foreground text-center py-16">No product data available</p>
                                    : <TopProductsChart data={topProducts} />
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sales History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search invoice or customer…"
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && fetchSales()}
                                    />
                                </div>
                                <DateRangePicker
                                    dateRange={dateRange}
                                    onDateRangeChange={setDateRange}
                                />
                                <Button onClick={fetchSales} disabled={salesLoading}>
                                    {salesLoading ? 'Loading…' : 'Search'}
                                </Button>
                            </div>

                            <SalesTable
                                sales={sales}
                                loading={salesLoading}
                                showEmployee={false}
                                showStore={false}
                                onViewDetails={(sale: SetStateAction<Sale | null>) => { setSelectedSale(sale); setShowDetails(true); }}
                                onVoidSale={(sale: SetStateAction<Sale | null>)    => { setSelectedSale(sale); setShowVoid(true);    }}
                                onPrintReceipt={(sale: { id: string; }) =>
                                    toast.info(`Printing receipt for #${sale.id.slice(-8).toUpperCase()}`)
                                }
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <SaleDetailsDialog
                sale={selectedSale}
                open={showDetails}
                onOpenChange={setShowDetails}
            />
            <VoidSaleDialog
                sale={selectedSale}
                open={showVoid}
                onOpenChange={setShowVoid}
                token={token}
                onVoidSuccess={() => { fetchSales(); setShowVoid(false); }}
            />
        </div>
    );
}