// components/inventory/InventoryDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Filter,
    RefreshCw,
    Download,
    Plus,
    Store as StoreIcon
} from 'lucide-react';
import InventoryAPI from '@/lib/api/inventory';
import { Inventory, InventorySummary, Product, Store, InventoryFilters } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import InventoryTable from '@/components/inventory/inventory-table';
import InventoryAdjustmentModal from '@/components/inventory/inventory-adjustment-modal';
import InventoryHistory from '@/components/inventory/inventory-history';
import LowStockAlert from '@/components/inventory/low-stock-alert';
import InventorySummaryCards from '@/components/inventory/inventory-summary-card';
import StoreAPI from '@/lib/api/stores';
import { toast } from 'sonner';
import ProductAPI from '@/lib/api/products';

const InventoryDashboard = () => {
    const { user, accessToken: token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [summary, setSummary] = useState<InventorySummary | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    // FIXED: Initialize filters with undefined instead of empty strings
    const [filters, setFilters] = useState<InventoryFilters>({
        productId: undefined,
        productName: undefined,
        storeId: undefined,
        storeName: undefined,
        type: undefined,
        grade: undefined,
        lowStock: undefined,
        outOfStock: undefined,
        hasReorderLevel: undefined,
        minQuantity: undefined,
        maxQuantity: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
        limit: 50,
    });

    const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            loadInventory();
            loadSummary();
        }
    }, [token, filters, pagination.page]);


    useEffect(() => {
        if (token) {
            loadProducts();
            loadStores();
        }
    }, [token]);

    const loadProducts = async () => {
        try {
            const response = await ProductAPI.getProducts(token!, {
                limit: 100,
                page: 1
            });

            console.log('Products API Response:', response);
            console.log('Response keys:', Object.keys(response));
            console.log('Response data property:', response.data);

            const productsData = response.data || response.data || response;
            console.log('Products data to set:', productsData);

            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (err) {
            console.error('Failed to load products:', err);
        }
    };

    const loadStores = async () => {
        try {
            const response = await StoreAPI.getStores(token!, {
                limit: 50,
                page: 1
            });
            setStores(response.data || []);
        } catch (err) {
            console.error('Failed to load stores:', err);
        }
    };

    const loadInventory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Clean filters - remove undefined values
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== undefined)
            );

            const response = await InventoryAPI.getAllInventory(token!, {
                ...cleanFilters,
                page: pagination.page,
                limit: pagination.limit
            });

            setInventory(response.inventory || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                totalPages: response.totalPages || 1
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to load inventory');
            console.error('Error loading inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    // In your page component (app/(protected)/inventory/page.tsx)
    async function loadSummary() {
        try {
            if (!token) {
                console.error('No token found');
                return;
            }

            console.log('Token exists:', !!token);
            console.log('Calling getGlobalInventorySummary...');

            const summary = await InventoryAPI.getGlobalInventorySummary(token);
            console.log('Summary response:', summary);

            setSummary(summary);
        } catch (error: any) {
            console.error('Error loading summary:', error);
            console.error('Error details:', error.message, error.stack);

            toast.error(`Failed to load summary: ${error.message}`);
        }
    }

    const handleAdjustClick = (item: Inventory) => {
        setSelectedInventory(item);
        setShowAdjustModal(true);
    };

    const handleAdjustSuccess = () => {
        loadInventory();
        loadSummary();
        setShowAdjustModal(false);
        setSelectedInventory(null);
    };

    // FIXED: Handle "all" value properly
    const handleFilterChange = (key: string, value: any) => {
        // If value is "all", set it to undefined to clear the filter
        const newValue = value === "all" ? undefined : value;
        setFilters(prev => ({ ...prev, [key]: newValue }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleExportCSV = () => {
        if (inventory.length === 0) {
            alert('No inventory data to export');
            return;
        }

        try {
            const csvData = InventoryAPI.exportToCSV(inventory);
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting CSV:', err);
            alert('Failed to export CSV');
        }
    };

    if (!user || !token) {
        return (
            <Alert>
                <AlertDescription>
                    Please log in to access inventory management.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">
                        Manage stock levels across all stores and products
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadInventory}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && <InventorySummaryCards summary={summary} />}

            {/* Low Stock Alerts */}
            <LowStockAlert inventory={inventory} />

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Inventory List</CardTitle>
                            <CardDescription>
                                {pagination.total} items across all stores
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button onClick={() => setShowAdjustModal(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adjust Inventory
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Search products..."
                            value={filters.productName || ''}
                            onChange={(e) => handleFilterChange('productName', e.target.value || undefined)}
                            className="md:col-span-2"
                        />
                        {/* FIXED: Changed "" to "all" for SelectItem value */}
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) => handleFilterChange('type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Product Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="TIRE">Tires</SelectItem>
                                <SelectItem value="BALE">Bales</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="lowStock"
                                    checked={filters.lowStock || false}
                                    onChange={(e) => handleFilterChange('lowStock', e.target.checked || undefined)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="lowStock" className="text-sm font-medium">
                                    Low Stock
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="outOfStock"
                                    checked={filters.outOfStock || false}
                                    onChange={(e) => handleFilterChange('outOfStock', e.target.checked || undefined)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="outOfStock" className="text-sm font-medium">
                                    Out of Stock
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Tabs */}
                    <Tabs defaultValue="inventory" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="inventory">
                                <Package className="mr-2 h-4 w-4" />
                                Inventory
                            </TabsTrigger>
                            <TabsTrigger value="history">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                History
                            </TabsTrigger>
                            <TabsTrigger value="analytics">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="inventory" className="space-y-4">
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <InventoryTable
                                    inventory={inventory}
                                    onAdjust={handleAdjustClick}
                                    pagination={pagination}
                                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="history">
                            <InventoryHistory productId={selectedInventory?.productId} storeId={filters.storeId} />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Inventory Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Add charts here */}
                                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                                            Chart: Inventory by Type & Grade
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Value Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                                            Chart: Inventory Value by Store
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Adjustment Modal */}
            {showAdjustModal && (
                <InventoryAdjustmentModal
                    inventory={selectedInventory}
                    onClose={() => {
                        setShowAdjustModal(false);
                        setSelectedInventory(null);
                    }}
                    onSuccess={handleAdjustSuccess}
                />
            )}
        </div>
    );
};

export default InventoryDashboard;