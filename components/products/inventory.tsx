// components/inventory/StoreInventory.tsx
'use client';

import { useState, useEffect } from 'react';
import { Store, Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store as StoreIcon, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import ProductAPI from '@/lib/api/products';
import { toast } from 'sonner';

interface StoreInventoryProps {
    token: string;
    store: Store;
}

interface InventoryItem {
    id: string;
    productId: string;
    storeId: string;
    quantity: number;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
    product?: {
        id: string;
        name: string;
        description?: string;
        basePrice: number;
        type: 'TIRE' | 'BALE';
        grade: 'A' | 'B' | 'C';
    };
}

export function StoreInventory({ token, store }: StoreInventoryProps) {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        lowStockOnly: false
    });

    const loadInventory = async () => {
        try {
            setLoading(true);
            const response = await ProductAPI.getProductsByStore(token, store.id, {
                limit: 100
            });

            if (response && response.data) {
                // Transform the response to match our InventoryItem type
                const inventoryData = response.data.map((product: any) => ({
                    id: product.inventory?.storeId || product.id,
                    productId: product.id,
                    storeId: store.id,
                    quantity: product.inventory?.quantity || 0,
                    reorderLevel: product.inventory?.reorderLevel,
                    optimalLevel: product.inventory?.optimalLevel,
                    storePrice: product.inventory?.storePrice,
                    product: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        basePrice: product.basePrice,
                        type: product.type,
                        grade: product.grade
                    }
                }));
                setInventory(inventoryData);
            }
        } catch (error: any) {
            console.error('Error loading inventory:', error);
            toast("Error", {
                description: error.message || "Failed to load store inventory",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (store.id) {
            loadInventory();
        }
    }, [store.id, filters]);

    const filteredInventory = inventory.filter(item => {
        if (filters.search && !item.product?.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.lowStockOnly && item.quantity > (item.reorderLevel || 10)) {
            return false;
        }
        return true;
    });

    const getStockStatus = (item: InventoryItem) => {
        const quantity = item.quantity;
        const reorderLevel = item.reorderLevel || 10;

        if (quantity === 0) {
            return {
                status: 'OUT_OF_STOCK',
                color: 'bg-red-100 text-red-800',
                icon: <AlertTriangle className="h-4 w-4" />
            };
        } else if (quantity <= reorderLevel) {
            return {
                status: 'LOW_STOCK',
                color: 'bg-yellow-100 text-yellow-800',
                icon: <AlertTriangle className="h-4 w-4" />
            };
        } else {
            return {
                status: 'IN_STOCK',
                color: 'bg-green-100 text-green-800',
                icon: <CheckCircle className="h-4 w-4" />
            };
        }
    };

    const getProductTypeBadge = (type: string) => {
        if (type === 'TIRE') {
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Tire
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Bale
                </Badge>
            );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <StoreIcon className="h-5 w-5" />
                    {store.name} Inventory
                    <Badge variant="outline" className="ml-2">
                        {store.isMainStore ? 'Main Store/Warehouse' : 'Branch Store'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-3 mb-4">
                    <Input
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="flex-1"
                    />
                    <Button
                        variant={filters.lowStockOnly ? "default" : "outline"}
                        onClick={() => setFilters({ ...filters, lowStockOnly: !filters.lowStockOnly })}
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Low Stock Only
                    </Button>
                </div>

                {/* Inventory Table */}
                {loading ? (
                    <div className="text-center py-8">Loading inventory...</div>
                ) : filteredInventory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No inventory found for this store
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Base Price</TableHead>
                                <TableHead>Store Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Reorder Level</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInventory.map((item) => {
                                const status = getStockStatus(item);
                                const price = item.storePrice || item.product?.basePrice || 0;
                                const value = item.quantity * price;

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{item.product?.name}</div>
                                                {item.product?.description && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.description.substring(0, 50)}...
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getProductTypeBadge(item.product?.type || '')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                Grade {item.product?.grade}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            ${item.product?.basePrice?.toFixed(2) || '0.00'}
                                        </TableCell>
                                        <TableCell>
                                            ${price.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{item.quantity}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                ${value.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {item.reorderLevel || 10}
                                                {item.optimalLevel && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Optimal: {item.optimalLevel}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={status.color}>
                                                <span className="flex items-center gap-1">
                                                    {status.icon}
                                                    {status.status.replace('_', ' ')}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}

                {/* Summary */}
                {filteredInventory.length > 0 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Total Items</div>
                                <div className="text-2xl font-bold">
                                    {filteredInventory.reduce((sum, item) => sum + item.quantity, 0)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Value</div>
                                <div className="text-2xl font-bold">
                                    ${filteredInventory.reduce((sum, item) => {
                                        const price = item.storePrice || item.product?.basePrice || 0;
                                        return sum + (item.quantity * price);
                                    }, 0).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Low Stock Items</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {filteredInventory.filter(item => item.quantity <= (item.reorderLevel || 10)).length}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Out of Stock</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {filteredInventory.filter(item => item.quantity === 0).length}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
