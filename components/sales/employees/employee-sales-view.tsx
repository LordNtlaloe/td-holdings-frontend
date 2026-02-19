// components/sales/employee/employee-sales-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, Search, FileText, Printer, Download, UserCircle, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Sale, SaleFilters } from '@/types/sales';
import { Store as StoreType } from '@/types';
import SalesAPI from '@/lib/api/sales';
import StoreAPI from '@/lib/api/stores';
import { SalesTable } from '../common/sales-table';
import { EmployeeQuickStats } from './employee-quick-stats';
import { EmployeeRecentSales } from './employee-recent-sales';
import { DateRangePicker } from '../common/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { SaleDetailsDialog } from '../common/sales-details-dialog';
import { VoidSaleDialog } from './voided-sales-dialog';

interface EmployeeSalesViewProps {
    employeeId: string;
    storeId: string;
    token: string;
    employeeName?: string;
}

export function EmployeeSalesView({ employeeId, storeId, token, employeeName }: EmployeeSalesViewProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [storeLoading, setStoreLoading] = useState(true);
    const [sales, setSales] = useState<Sale[]>([]);
    const [store, setStore] = useState<StoreType | null>(null);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(1)), // First day of current month
        to: new Date(),
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch store details dynamically
    useEffect(() => {
        const fetchStoreDetails = async () => {
            if (!storeId) return;

            setStoreLoading(true);
            try {
                const storeData = await StoreAPI.getStore(token, storeId);
                setStore(storeData);
            } catch (error) {
                console.error('Failed to fetch store details:', error);
                toast.error('Failed to load store information');
            } finally {
                setStoreLoading(false);
            }
        };

        fetchStoreDetails();
    }, [storeId, token]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const filters: SaleFilters = {
                employeeId,
                storeId,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                limit: 100,
                search: searchTerm || undefined,
            };

            const response = await SalesAPI.getSales(token, filters);

            // Transform the data to ensure dates are Date objects and match the Sale type
            const transformedSales: Sale[] = response.data.map(sale => ({
                ...sale,
                // Convert string dates to Date objects
                createdAt: new Date(sale.createdAt),
                // If updatedAt is missing, use createdAt as fallback
                updatedAt: sale.updatedAt ? new Date(sale.updatedAt) : new Date(sale.createdAt),
                // Ensure saleItems exists even if empty
                saleItems: sale.saleItems || [],
                // Ensure voidedSale is handled properly
                voidedSale: sale.voidedSale ? {
                    ...sale.voidedSale,
                    createdAt: new Date(sale.voidedSale.createdAt),
                } : undefined,
            }));

            setSales(transformedSales);
        } catch (error) {
            toast.error('Failed to fetch sales', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) {
            fetchSales();
        }
    }, [employeeId, storeId, dateRange?.from, dateRange?.to]);

    const handleSearch = () => {
        fetchSales();
    };

    // Calculate stats
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === today);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const stats = {
        todaySales: todaySales.length,
        todayRevenue: todaySales.reduce((sum, s) => sum + s.total, 0),
        weekRevenue: sales
            .filter(s => new Date(s.createdAt) >= weekAgo)
            .reduce((sum, s) => sum + s.total, 0),
        monthRevenue: sales
            .filter(s => new Date(s.createdAt) >= monthAgo)
            .reduce((sum, s) => sum + s.total, 0),
        weeklyTarget: 500000,
        weeklyAchieved: sales
            .filter(s => new Date(s.createdAt) >= weekAgo)
            .reduce((sum, s) => sum + s.total, 0),
        monthlyTarget: 2000000,
        monthlyAchieved: sales
            .filter(s => {
                const date = new Date(s.createdAt);
                return date.getMonth() === new Date().getMonth();
            })
            .reduce((sum, s) => sum + s.total, 0),
        averageTicket: sales.length > 0
            ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length
            : 0,
        rank: 3, // Example rank - this should come from an API
        totalTeam: 10, // Example team size - this should come from an API
    };

    return (
        <div className="space-y-6">
            {/* Header with Employee Info */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Welcome back, {employeeName || 'Employee'}!
                        </h2>
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                            Cashier
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            {storeLoading ? (
                                <span className="animate-pulse">Loading store information...</span>
                            ) : store ? (
                                <>
                                    {store.name} • {store.city || 'No city specified'}
                                    {store.isMainStore && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            Main Store
                                        </span>
                                    )}
                                </>
                            ) : (
                                `Store #${storeId.slice(-8)}`
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchSales} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => router.push('/sales/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Sale
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <EmployeeQuickStats stats={stats} />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">Sales History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <EmployeeRecentSales
                            sales={sales}
                            onViewAll={() => {
                                const tab = document.querySelector('[value="history"]') as HTMLButtonElement;
                                if (tab) tab.click();
                            }}
                            onViewDetails={(sale) => {
                                setSelectedSale(sale);
                                setShowDetailsDialog(true);
                            }}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => router.push('/sales/reports/daily')}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Daily Report
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => window.print()}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print End of Day Summary
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => {
                                        toast('Export', {
                                            description: 'Preparing your export...',
                                            className: 'bg-emerald-500 text-emerald-900'
                                        });
                                    }}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Sales Data
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by invoice or customer..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <DateRangePicker
                                    dateRange={dateRange}
                                    onDateRangeChange={setDateRange}
                                />
                                <Button onClick={handleSearch}>Search</Button>
                            </div>

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
                                    toast('Print', {
                                        description: `Printing receipt for sale #${sale.id.slice(-8)}`,
                                        className: 'bg-indigo-500 text-indigo-900'
                                    });
                                }}
                                showEmployee={false}
                                showStore={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Analytics</CardTitle>
                            <CardDescription>
                                View your sales trends and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border p-4">
                                        <h3 className="font-medium mb-2">Best Performing Day</h3>
                                        <p className="text-2xl font-bold text-green-600">
                                            {sales.length > 0
                                                ? Math.max(...sales.map(s => s.total)).toLocaleString()
                                                : 0} FCFA
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {sales.length > 0 && sales.find(s => s.total === Math.max(...sales.map(s => s.total)))?.createdAt
                                                ? format(new Date(sales.find(s => s.total === Math.max(...sales.map(s => s.total)))!.createdAt), 'PPP')
                                                : 'No data'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <h3 className="font-medium mb-2">Average Daily Sales</h3>
                                        <p className="text-2xl font-bold">
                                            {(stats.monthRevenue / 30).toLocaleString()} FCFA
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Based on last 30 days
                                        </p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-center py-4">
                                    More analytics features coming soon...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
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
                onVoidSuccess={() => {
                    fetchSales();
                    setShowVoidDialog(false);
                }}
                token={token}
            />
        </div>
    );
}