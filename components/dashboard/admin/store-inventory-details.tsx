'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import InventoryAPI from '@/lib/api/inventory';
import { formatCurrency } from '@/lib/utils';
import type { Inventory, StoreInventoryResponse } from '@/types';

interface StoreInventoryDetailsProps {
    token: string;
    storeId?: string;
}

export function StoreInventoryDetails({ token, storeId }: StoreInventoryDetailsProps) {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [summary, setSummary] = useState({
        totalItems: 0,
        totalValue: 0,
        lowStock: 0,
        outOfStock: 0,
    });

    useEffect(() => {
        if (!storeId) return;

        const fetchInventory = async () => {
            try {
                const data: StoreInventoryResponse = await InventoryAPI.getStoreInventory(token, storeId, {
                    limit: 100,
                });

                const items = data.inventory || [];
                setInventory(items);

                setSummary({
                    totalItems: items.length,
                    totalValue: items.reduce(
                        (sum, item) => sum + InventoryAPI.calculateInventoryValue(item.quantity, item.storePrice),
                        0
                    ),
                    lowStock: items.filter(
                        (item) => item.quantity > 0 && item.quantity <= (item.reorderLevel ?? 10)
                    ).length,
                    outOfStock: items.filter((item) => item.quantity === 0).length,
                });
            } catch (error) {
                console.error('Failed to fetch inventory:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, [token, storeId]);

    const filteredInventory = inventory.filter((item) => {
        const name = item.product?.name?.toLowerCase() ?? '';
        const type = item.product?.type?.toLowerCase() ?? '';
        const q = search.toLowerCase();
        return name.includes(q) || type.includes(q);
    });

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
                <CardTitle>Store Inventory</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total Items</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.totalItems}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">Total Value</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {formatCurrency(summary.totalValue)}
                        </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.lowStock}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.outOfStock}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search inventory..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Inventory Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No inventory items found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInventory.map((item) => {
                                const stockInfo = InventoryAPI.getStockStatusInfo(item.quantity, item.reorderLevel);
                                const price = item.storePrice ?? item.product?.basePrice ?? 0;
                                const value = InventoryAPI.calculateInventoryValue(item.quantity, price);

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product?.name ?? '—'}</TableCell>
                                        <TableCell>{item.product?.type ?? '—'}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(value)}</TableCell>
                                        <TableCell>
                                            <Badge className={stockInfo.color}>
                                                {stockInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Adjust</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}