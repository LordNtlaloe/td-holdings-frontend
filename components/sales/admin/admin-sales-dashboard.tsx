// components/sales/admin/admin-sales-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Download, Calendar, TrendingUp, Store, CreditCard, User } from 'lucide-react';
import { toast } from 'sonner';
import { Sale, SaleFilters, SalesMetrics } from '@/types/sales';
import { User as UserType, Store as StoreType } from '@/types';
import SalesAPI from '@/lib/api/sales';
import SalesReportsAPI from '@/lib/api/sales-report';
import StoreAPI from '@/lib/api/stores';
import { SalesTable } from '../common/sales-table';
import { TopProductsTable } from './top-products-table';
import { StorePerformanceGrid } from './store-performance-grid';
import { DateRangePicker } from '../common/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { SaleDetailsDialog } from '../common/sales-details-dialog';
import { PaymentDistributionChart } from './payments-pie-chart';
import { VoidSaleDialog } from '../employees/voided-sales-dialog';
import { SalesTrendChart } from './sales-line-chart';

interface AdminSalesDashboardProps {
    token: string;
    user: UserType;
}

// Extended metrics interface for voided fields
interface ExtendedSalesMetrics extends SalesMetrics {
    voidedAmount?: number;
    voidedTransactions?: number;
}

export function AdminSalesDashboard({ token, user }: AdminSalesDashboardProps) {
    const [loading, setLoading] = useState(false);
    const [storesLoading, setStoresLoading] = useState(true);
    const [sales, setSales] = useState<Sale[]>([]);
    const [metrics, setMetrics] = useState<ExtendedSalesMetrics | null>(null);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(1)),
        to: new Date(),
    });
    const [stores, setStores] = useState<StoreType[]>([]);

    // Fetch stores on component mount
    useEffect(() => {
        const fetchStores = async () => {
            setStoresLoading(true);
            try {
                const response = await StoreAPI.getStores(token, {
                    limit: 100, // Get all stores
                });
                setStores(response.data || []);
            } catch (error) {
                console.error('Failed to fetch stores:', error);
                toast.error('Failed to load stores', {
                    description: error instanceof Error ? error.message : 'Unknown error occurred',
                });
            } finally {
                setStoresLoading(false);
            }
        };

        fetchStores();
    }, [token]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const filters: SaleFilters = {
                storeId: selectedStore !== 'all' ? selectedStore : undefined,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                limit: 500,
            };

            const response = await SalesAPI.getSales(token, filters);
            setSales(response.data);

            // Calculate voided metrics if needed
            const baseMetrics = response.metrics || null;
            if (baseMetrics) {
                const voidedSales = response.data.filter(sale => sale.voidedSale);
                const extendedMetrics: ExtendedSalesMetrics = {
                    ...baseMetrics,
                    voidedAmount: voidedSales.reduce((sum, sale) => sum + sale.total, 0),
                    voidedTransactions: voidedSales.length,
                };
                setMetrics(extendedMetrics);
            } else {
                setMetrics(null);
            }
        } catch (error) {
            toast.error('Failed to fetch dashboard data', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!storesLoading) {
            fetchDashboardData();
        }
    }, [selectedStore, dateRange?.from, dateRange?.to, storesLoading]);

    const handleExportReport = async (fileFormat: 'csv' | 'pdf') => {
        try {
            const blob = await SalesReportsAPI.exportSalesReport(token, {
                storeId: selectedStore !== 'all' ? selectedStore : undefined,
                startDate: dateRange?.from || new Date(),
                endDate: dateRange?.to || new Date(),
                format: fileFormat, // Use fileFormat here too
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Use fileFormat instead of format to avoid naming conflict
            a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.${fileFormat}`;
            a.click();

            toast.success(`Report exported as ${fileFormat.toUpperCase()}`);
        } catch (error) {
            toast.error('Failed to export report', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Admin Info */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold tracking-tight">Sales Administration</h2>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            Admin
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        Welcome back, {user.firstName} {user.lastName}. Here's your comprehensive sales overview.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedStore}
                        onValueChange={setSelectedStore}
                        disabled={storesLoading}
                    >
                        <SelectTrigger className="w-50">
                            <SelectValue placeholder={storesLoading ? "Loading stores..." : "All Stores"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stores</SelectItem>
                            {stores.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                    {store.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Date Range */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <DateRangePicker
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.totalRevenue?.toLocaleString() || 0} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {sales.length} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.averageSaleValue?.toLocaleString() || 0} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.totalTax?.toLocaleString() || 0} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Collected taxes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voided Amount</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.voidedAmount?.toLocaleString() || 0} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics?.voidedTransactions || 0} transactions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <SalesTrendChart sales={sales} />
                <PaymentDistributionChart metrics={metrics} />
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="products">Top Products</TabsTrigger>
                    <TabsTrigger value="stores">Store Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Payment Methods:</span>
                                        <span className="font-medium">
                                            {Object.keys(metrics?.byPaymentMethod || {}).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Active Stores:</span>
                                        <span className="font-medium">{stores.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date Range:</span>
                                        <span className="font-medium">
                                            {dateRange?.from && format(dateRange.from, 'MMM dd')} -{' '}
                                            {dateRange?.to && format(dateRange.to, 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Admin:</span>
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {metrics?.byPaymentMethod && Object.entries(metrics.byPaymentMethod).map(([method, data]) => (
                                        <div key={method} className="flex justify-between items-center">
                                            <span className="text-sm">{method.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {data.count} txns
                                                </span>
                                                <span className="font-medium">
                                                    {data.total.toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SalesTable
                                sales={sales}
                                loading={loading}
                                onViewDetails={(sale) => {
                                    setSelectedSale(sale);
                                    setShowDetailsDialog(true);
                                }}
                                onVoidSale={(sale) => {
                                    setSelectedSale(sale);
                                    setShowVoidDialog(true);
                                }}
                                onPrintReceipt={(sale) => {
                                    toast.success(`Printing receipt for sale #${sale.id.slice(-8)}`);
                                }}
                                showEmployee={true}
                                showStore={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <TopProductsTable sales={sales} token={token} />
                </TabsContent>

                <TabsContent value="stores">
                    <StorePerformanceGrid sales={sales} stores={stores} />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <SaleDetailsDialog
                sale={selectedSale}
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}
            />

            <VoidSaleDialog
                sale={selectedSale}
                open={showVoidDialog}
                onOpenChange={setShowVoidDialog}
                onVoidSuccess={fetchDashboardData}
                token={token}
            />
        </div>
    );
}