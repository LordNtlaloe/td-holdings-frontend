// components/sales/manager/team-sales-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Download, Search, Users, Store, UserCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Sale, SaleFilters } from '@/types/sales';
import SalesAPI from '@/lib/api/sales';
import { SalesTable } from '../common/sales-table';
import { TeamPerformanceChart } from './team-performance-chart';
import { EmployeePerformanceTable } from './employee-performance-table';
import { DateRangePicker } from '../common/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { StoreSalesSummary } from './store-summary';
import { SaleDetailsDialog } from '../common/sales-details-dialog';
import { VoidSaleDialog } from '../employees/voided-sales-dialog';

interface TeamSalesViewProps {
    managerId: string;
    storeIds: string[];
    token: string;
    managerName?: string;
}

export function TeamSalesView({ managerId, storeIds, token, managerName }: TeamSalesViewProps) {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState<Sale[]>([]);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(1)),
        to: new Date(),
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [storeNames, setStoreNames] = useState<Record<string, string>>({});

    useEffect(() => {
        // Generate store names (in real app, fetch from API)
        const names: Record<string, string> = {};
        storeIds.forEach((id, index) => {
            names[id] = `Store ${index + 1}`;
        });
        setStoreNames(names);
    }, [storeIds]);

    const fetchTeamSales = async () => {
        setLoading(true);
        try {
            const filters: SaleFilters = {
                storeId: selectedStore !== 'all' ? selectedStore : undefined,
                employeeId: selectedEmployee !== 'all' ? selectedEmployee : undefined,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                limit: 200,
                search: searchTerm || undefined,
            };

            const response = await SalesAPI.getSales(token, filters);
            setSales(response.data);
        } catch (error) {
            toast('Error',{
                description: 'Failed to fetch team sales',
                className: 'bg-red-500 text-red-900',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamSales();
    }, [selectedStore, selectedEmployee, dateRange]);

    // Calculate team metrics
    const teamMetrics = {
        totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
        totalTransactions: sales.length,
        averageTicket: sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0,
        activeEmployees: new Set(sales.map(s => s.employeeId)).size,
        todayRevenue: sales
            .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
            .reduce((sum, s) => sum + s.total, 0),
        voidedCount: sales.filter(s => s.voidedSale).length,
    };

    // Get unique employees from sales
    const employees = Array.from(new Set(sales.map(s => s.employeeId))).map(id => ({
        id,
        name: sales.find(s => s.employeeId === id)?.employee?.user?.firstName || 'Unknown Employee',
    }));

    return (
        <div className="space-y-6">
            {/* Header with Manager Info */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {managerName ? `${managerName}'s Team` : 'Team Sales Dashboard'}
                        </h2>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            Manager
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        Monitor your team's performance across {storeIds.length} store{storeIds.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchTeamSales}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMetrics.totalRevenue.toLocaleString()} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {teamMetrics.totalTransactions} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Ticket</CardTitle>
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMetrics.averageTicket.toLocaleString()} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMetrics.activeEmployees}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Out of {employees.length} total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMetrics.todayRevenue.toLocaleString()} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {teamMetrics.voidedCount} voided transactions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Store Selection (if managing multiple stores) */}
            {storeIds.length > 1 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <Select value={selectedStore} onValueChange={setSelectedStore}>
                                <SelectTrigger className="w-75">
                                    <SelectValue placeholder="Select Store" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stores</SelectItem>
                                    {storeIds.map((storeId) => (
                                        <SelectItem key={storeId} value={storeId}>
                                            {storeNames[storeId] || `Store ${storeId.slice(-8)}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Team Performance Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <TeamPerformanceChart sales={sales} />
                <StoreSalesSummary sales={sales} storeIds={storeIds} storeNames={storeNames} />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Sales History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by invoice, customer, or employee..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchTeamSales()}
                                />
                            </div>
                        </div>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="w-50">
                                <SelectValue placeholder="All Employees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <DateRangePicker
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />
                        <Button onClick={fetchTeamSales}>Apply Filters</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Tabs defaultValue="transactions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="employees">Employee Performance</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
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
                            toast('Print',{
                                description: `Printing receipt for sale #${sale.id.slice(-8)}`,
                                className: "bg-indigo-500 text-indigo-900"
                            });
                        }}
                        showEmployee={true}
                        showStore={storeIds.length > 1}
                    />
                </TabsContent>

                <TabsContent value="employees">
                    <EmployeePerformanceTable sales={sales} token={token} />
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-8">
                                Advanced analytics dashboard coming soon...
                            </p>
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
                onVoidSuccess={fetchTeamSales}
                token={token}
            />
        </div>
    );
}