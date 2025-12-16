'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Store, InventorySummary, StorePerformance } from '@/types/stores';
import StoreAPI from '@/lib/api/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Edit,
    Package,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Users,
    ShoppingCart,
    BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { PerformanceCharts } from '@/components/stores/performance-chart';
import { StoreCard } from '@/components/stores/store-cards';
import { StoreForm } from '@/components/stores/store-form';

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, accessToken } = useAuth();

    const storeId = params.id as string;

    const [store, setStore] = useState<Store | null>(null);
    const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
    const [performance, setPerformance] = useState<StorePerformance | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const loadStoreData = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            const [storeData, inventoryData, performanceData] = await Promise.all([
                StoreAPI.getStore(accessToken, storeId),
                StoreAPI.getStoreInventorySummary(accessToken, storeId),
                StoreAPI.getStorePerformance(accessToken, storeId, 'month'),
            ]);

            setStore(storeData);
            setInventorySummary(inventoryData);
            setPerformance(performanceData);
        } catch (error: any) {
            toast('Error', {
                description: error.message || 'Failed to load store data',
            });
            router.push('/branches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStoreData();
    }, [storeId, accessToken]);

    const handleUpdateStore = async (data: any) => {
        if (!accessToken || !store) return;

        try {
            await StoreAPI.updateStore(accessToken, store.id, data);
            toast('Success', {
                description: 'Store updated successfully',
            });
            setEditing(false);
            loadStoreData();
        } catch (error: any) {
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading store details...</p>
                </div>
            </div>
        );
    }

    if (!store) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/branches')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Stores
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
                        <p className="text-muted-foreground">{store.location}</p>
                    </div>
                    {store.isMainStore && (
                        <Badge className="ml-2">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Main Store
                        </Badge>
                    )}
                </div>

                {user?.role === 'ADMIN' && (
                    <Dialog open={editing} onOpenChange={setEditing}>
                        <DialogTrigger asChild>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Store
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Store</DialogTitle>
                                <DialogDescription>
                                    Update store information
                                </DialogDescription>
                            </DialogHeader>
                            <StoreForm
                                store={store}
                                onSubmit={handleUpdateStore}
                                onCancel={() => setEditing(false)}
                                mode="edit"
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="inventory">
                        <Package className="h-4 w-4 mr-2" />
                        Inventory
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="details">
                        <Users className="h-4 w-4 mr-2" />
                        Details
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {inventorySummary && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {inventorySummary.summary.totalProducts.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        ${inventorySummary.summary.totalValue.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {inventorySummary.summary.lowStockProducts}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                                    <Package className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {inventorySummary.summary.outOfStockProducts}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {performance && <PerformanceCharts performance={performance} />}
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    {inventorySummary && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Summary</CardTitle>
                                    <CardDescription>
                                        Total value: ${inventorySummary.summary.totalValue.toLocaleString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Total Products</p>
                                                <p className="text-2xl font-bold">
                                                    {inventorySummary.summary.totalProducts}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Total Quantity</p>
                                                <p className="text-2xl font-bold">
                                                    {inventorySummary.summary.totalQuantity.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Stock Issues</p>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-sm text-yellow-600">Low Stock</p>
                                                        <p className="text-xl font-bold">
                                                            {inventorySummary.summary.lowStockProducts}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-red-600">Out of Stock</p>
                                                        <p className="text-xl font-bold">
                                                            {inventorySummary.summary.outOfStockProducts}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {inventorySummary.categories.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Inventory by Category</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {inventorySummary.categories.map((category) => (
                                                <div key={category.type} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium">{category.type}</h4>
                                                        <Badge variant="secondary">
                                                            {category.count} products
                                                        </Badge>
                                                    </div>
                                                    <div className="grid gap-4 md:grid-cols-3">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Quantity</p>
                                                            <p className="font-medium">{category.quantity.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Value</p>
                                                            <p className="font-medium">${category.value.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Avg. Price</p>
                                                            <p className="font-medium">
                                                                ${(category.value / category.quantity || 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="performance">
                    {performance ? (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sales Performance</CardTitle>
                                    <CardDescription>
                                        Period: {performance.period.charAt(0).toUpperCase() + performance.period.slice(1)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Revenue</p>
                                            <p className="text-3xl font-bold">
                                                ${performance.sales.revenue.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Transactions</p>
                                            <p className="text-3xl font-bold">
                                                {performance.sales.transactions}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Avg. Transaction</p>
                                            <p className="text-3xl font-bold">
                                                ${performance.sales.averageTransaction.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {performance && <PerformanceCharts performance={performance} />}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No performance data available</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="details">
                    <div className="grid gap-6 md:grid-cols-2">
                        <StoreCard store={store} showActions={false} />

                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Contact Information</p>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">Phone:</span> {store.phone}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Email:</span> {store.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Store Details</p>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">Created:</span>{' '}
                                            {new Date(store.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Last Updated:</span>{' '}
                                            {new Date(store.updatedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Status:</span>{' '}
                                            <Badge variant={store.isMainStore ? 'default' : 'outline'}>
                                                {store.isMainStore ? 'Main Store' : 'Branch Store'}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>

                                {store._count && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Store Statistics</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Employees</p>
                                                <p className="font-medium">{store._count.employees}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Products</p>
                                                <p className="font-medium">{store._count.inventories}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Sales</p>
                                                <p className="font-medium">{store._count.sales}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}