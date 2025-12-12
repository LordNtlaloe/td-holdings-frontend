// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import MetricsDashboard from '@/components/dashboard/products/product-metrics';
import { getAllProductsWithParams } from '@/lib/products-api';
import { Product } from '@/types';
import ProductsTable from '@/components/dashboard/products/products-table';
import LowStockAlerts from '@/components/dashboard/products/low-stock-alerts';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState('list');

    const loadProducts = async () => {
        try {
            setLoading(true);
            const result = await getAllProductsWithParams({
                page: 1,
                limit: 50,
            });
            setProducts(result.products);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    if (loading && products.length === 0) {
        return (

            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                </div>
            </div>
        );
    }

    return (

        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-sm text-gray-500">
                        {total} total products in inventory
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadProducts}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/products/create">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="list">Product List</TabsTrigger>
                    <TabsTrigger value="metrics">Analytics</TabsTrigger>
                    <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    {products.length > 0 ? (
                        <ProductsTable products={products} />

                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <h3 className="text-lg font-medium">No products found</h3>
                                    <p className="text-sm text-gray-500">Get started by adding your first product</p>
                                    <Link href="/products/create" className="mt-4 inline-block">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Product
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="metrics">
                    <MetricsDashboard />
                </TabsContent>

                <TabsContent value="low-stock">
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LowStockAlerts />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}