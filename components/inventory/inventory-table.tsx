// components/inventory/InventoryTable.tsx
'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, AlertTriangle, Store as StoreIcon } from 'lucide-react';
import { Inventory } from '@/types';
import InventoryAPI from '@/lib/api/inventory';

interface InventoryTableProps {
    inventory: Inventory[];
    onAdjust: (item: Inventory) => void;
    onView?: (item: Inventory) => void;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
}

const InventoryTable = ({
    inventory,
    onAdjust,
    onView,
    pagination,
    onPageChange
}: InventoryTableProps) => {
    const getStockStatus = (item: Inventory) => {
        return InventoryAPI.getStockStatusInfo(item.quantity, item.reorderLevel);
    };

    const calculateValue = (item: Inventory) => {
        return InventoryAPI.calculateInventoryValue(
            item.quantity,
            item.storePrice || item.product?.basePrice
        );
    };

    const needsReorder = (item: Inventory) => {
        return InventoryAPI.needsReorder(item.quantity, item.reorderLevel);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Reorder Level</TableHead>
                            <TableHead>Store Price</TableHead>
                            <TableHead>Total Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No inventory found. Try adjusting your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inventory.map((item) => {
                                const stockStatus = getStockStatus(item);
                                const value = calculateValue(item);
                                const reorderInfo = needsReorder(item);

                                return (
                                    <TableRow key={`${item.productId}-${item.store?.id}`}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-semibold">{item.product?.name || 'Unknown Product'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.product?.grade ? `Grade ${item.product.grade}` : ''}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {item.product?.type || 'Unknown'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <StoreIcon className="h-4 w-4 text-muted-foreground" />
                                                <span>{item.store?.name || 'Unknown Store'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {item.quantity}
                                                {item.optimalLevel && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Optimal: {item.optimalLevel}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.reorderLevel ? (
                                                <div className="font-medium">{item.reorderLevel}</div>
                                            ) : (
                                                <span className="text-muted-foreground">Not set</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {InventoryAPI.formatCurrency(
                                                item.storePrice || item.product?.basePrice || 0
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {InventoryAPI.formatCurrency(value)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    className={stockStatus.color}
                                                    variant={stockStatus.badgeVariant}
                                                >
                                                    {stockStatus.label}
                                                </Badge>
                                                {reorderInfo.needsReorder && reorderInfo.urgency === 'CRITICAL' && (
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {onView && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onView(item)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onAdjust(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} items
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pagination.page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            {pagination.totalPages > 5 && (
                                <>
                                    <span className="px-2">...</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.totalPages)}
                                    >
                                        {pagination.totalPages}
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryTable;