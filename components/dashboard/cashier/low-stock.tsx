'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Package, Loader2 } from 'lucide-react';
import ProductAPI from '@/lib/api/products';
import type { LowStockProduct } from '@/types'; // Make sure this matches your actual type

interface LowStockAlertsProps {
    storeId?: string;
    token: string;
    threshold?: number;
}

export function LowStockAlerts({ storeId, token, threshold = 10 }: LowStockAlertsProps) {
    const [lowStockItems, setLowStockItems] = useState<any[]>([]); // Use appropriate type
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const products = await ProductAPI.getLowStockProducts(token, threshold);
                
                // Based on your API response, products might be an array of:
                // { productId, productName, storeId, storeName, quantity, ... }
                
                // If storeId provided, filter by store
                const filtered = storeId
                    ? products.filter(p => p.store.id === storeId)
                    : products;

                setLowStockItems(filtered.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch low stock items:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchLowStock();
        }
    }, [token, storeId, threshold]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : lowStockItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No low stock items
                    </p>
                ) : (
                    <div className="space-y-4">
                        {lowStockItems.map((item) => (
                            <div key={item.productId} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">{item.storeName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="destructive">{item.quantity} left</Badge>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={`/inventory/adjust?productId=${item.productId}&storeId=${storeId}`}>
                                            Order
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" asChild>
                            <a href="/inventory?filter=lowStock">
                                View All Alerts
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}