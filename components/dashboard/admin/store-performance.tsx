'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Store,
    TrendingUp,
    Users,
    Package,
    DollarSign,
    Calendar,
    Target,
    Loader2
} from 'lucide-react';
import StoreAPI from '@/lib/api/stores';
import EmployeeAPI from '@/lib/api/employees';
import { formatCurrency } from '@/lib/utils';
import { SalesByStore } from './sales-by-store';
import { StaffPerformance } from '../manager/staff-performance';
import { StoreInventoryDetails } from './store-inventory-details';
import { StoreTargets } from './store-targets';

interface StorePerformanceDetailedProps {
    token: string;
    storeId?: string;
}

export function StorePerformanceDetailed({ token, storeId }: StorePerformanceDetailedProps) {
    const [stores, setStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [performance, setPerformance] = useState<any>(null);
    const [staff, setStaff] = useState<any>(null);
    const [inventory, setInventory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await StoreAPI.getStores(token, { limit: 50 });
                setStores(response.data || []);

                if (storeId) {
                    const store = response.data.find((s: any) => s.id === storeId);
                    setSelectedStore(store);
                } else if (response.data.length > 0) {
                    setSelectedStore(response.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch stores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [token, storeId]);

    useEffect(() => {
        const fetchStoreDetails = async () => {
            if (!selectedStore) return;

            try {
                const [perf, staffData, invData] = await Promise.all([
                    StoreAPI.getStorePerformance(token, selectedStore.id, 'month'),
                    EmployeeAPI.getEmployees(token, { storeId: selectedStore.id }),
                    StoreAPI.getStoreInventorySummary(token, selectedStore.id)
                ]);

                setPerformance(perf);
                setStaff(staffData);
                setInventory(invData);
            } catch (error) {
                console.error('Failed to fetch store details:', error);
            }
        };

        if (selectedStore) {
            fetchStoreDetails();
        }
    }, [token, selectedStore]);

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
                <CardTitle>Store Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                        <TabsTrigger value="targets">Targets</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="space-y-6">
                            {/* Store Selector */}
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedStore?.id}
                                onChange={(e) => {
                                    const store = stores.find(s => s.id === e.target.value);
                                    setSelectedStore(store);
                                }}
                            >
                                {stores.map(store => (
                                    <option key={store.id} value={store.id}>
                                        {store.name} {store.isMainStore ? '(Main Store)' : ''}
                                    </option>
                                ))}
                            </select>

                            {selectedStore && (
                                <>
                                    {/* Store Header */}
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold">{selectedStore.name}</h3>
                                                <p className="text-muted-foreground">{selectedStore.address}</p>
                                                <p className="text-sm mt-1">{selectedStore.city}, {selectedStore.province}</p>
                                            </div>
                                            <Badge variant={selectedStore.isMainStore ? "default" : "outline"}>
                                                {selectedStore.isMainStore ? 'Main Store' : 'Branch'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(performance?.monthlyRevenue || 0)}
                                            </p>
                                            <p className="text-xs text-green-500">
                                                +{performance?.growth || 0}% vs last month
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Staff Count</p>
                                            <p className="text-2xl font-bold">{staff?.meta?.total || 0}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {staff?.data?.filter((e: any) => e.status === 'ACTIVE').length} active
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Inventory Value</p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(inventory?.totalValue || 0)}
                                            </p>
                                            <p className="text-xs text-yellow-500">
                                                {inventory?.lowStockCount || 0} items low stock
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Avg Daily Sales</p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(performance?.averageDaily || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Performance Chart Placeholder */}
                                    <div className="h-50 bg-muted/30 rounded-lg flex items-center justify-center">
                                        <p className="text-muted-foreground">Performance Chart</p>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Today's Stats</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Sales</span>
                                                    <span className="font-medium">{performance?.today?.sales || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Revenue</span>
                                                    <span className="font-medium">{formatCurrency(performance?.today?.revenue || 0)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Transactions</span>
                                                    <span className="font-medium">{performance?.today?.transactions || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-medium">This Week</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Total Sales</span>
                                                    <span className="font-medium">{performance?.week?.sales || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Total Revenue</span>
                                                    <span className="font-medium">{formatCurrency(performance?.week?.revenue || 0)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm">vs Last Week</span>
                                                    <span className={`font-medium ${performance?.week?.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {performance?.week?.growth > 0 ? '+' : ''}{performance?.week?.growth || 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="sales">
                        <SalesByStore token={token} storeId={selectedStore?.id} />
                    </TabsContent>

                    <TabsContent value="inventory">
                        <StoreInventoryDetails token={token} storeId={selectedStore?.id} />
                    </TabsContent>

                    <TabsContent value="staff">
                        <StaffPerformance token={token} storeId={selectedStore?.id} detailed />
                    </TabsContent>

                    <TabsContent value="targets">
                        <StoreTargets token={token} storeId={selectedStore?.id} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}