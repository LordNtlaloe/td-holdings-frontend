'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import InventoryAPI from '@/lib/api/inventory';

interface InventorySummaryProps {
    token: string;
    storeId?: string;
    detailed?: boolean;
}

export function InventorySummary({ token, storeId, detailed = false }: InventorySummaryProps) {
    const [summary, setSummary] = useState<any>(null);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryData, lowStockData] = await Promise.all([
                    InventoryAPI.getGlobalInventorySummary(token),
                    InventoryAPI.getLowStockProducts(token, 10)
                ]);

                setSummary(summaryData);

                // Filter by store if needed
                const filtered = storeId
                    ? lowStockData.filter(item => item.store.id === storeId)
                    : lowStockData;

                setLowStock(filtered.slice(0, detailed ? 20 : 5));
            } catch (error) {
                console.error('Failed to fetch inventory summary:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, storeId, detailed]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Summary</CardTitle>
                </CardHeader>
                <CardContent>
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
                <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {!detailed && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Items</p>
                                <p className="text-2xl font-bold">{summary?.totalProducts || 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    LSL {summary?.totalValue?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Low Stock Items
                        </h4>
                        <div className="space-y-3">
                            {lowStock.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No low stock items</p>
                            ) : (
                                lowStock.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">{item.storeName}</p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive">{item.quantity} left</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {!detailed && (
                        <Button variant="outline" className="w-full" asChild>
                            <a href="/inventory">View Full Inventory</a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}