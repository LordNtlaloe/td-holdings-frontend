// components/inventory/LowStockAlert.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { Inventory } from '@/types';
import Link from 'next/link';

interface LowStockAlertProps {
    inventory: Inventory[];
    threshold?: number;
    maxItems?: number;
}

const LowStockAlert = ({ inventory, threshold = 10, maxItems = 5 }: LowStockAlertProps) => {
    // Filter low stock items
    const lowStockItems = inventory.filter(item => {
        // Items with quantity = 0 are out of stock, not low stock
        if (item.quantity === 0) return false;

        // Check if quantity is below threshold OR below reorder level
        return item.quantity <= threshold ||
            (item.reorderLevel && item.quantity <= item.reorderLevel);
    });

    // Sort by urgency (quantity relative to reorder level)
    const sortedItems = lowStockItems.sort((a, b) => {
        const aUrgency = getUrgencyLevel(a);
        const bUrgency = getUrgencyLevel(b);
        if (aUrgency !== bUrgency) return aUrgency - bUrgency;
        return (a.quantity / (a.reorderLevel || threshold)) - (b.quantity / (b.reorderLevel || threshold));
    });

    // Get only the most urgent items
    const criticalItems = sortedItems.slice(0, maxItems);
    const hasMoreItems = lowStockItems.length > maxItems;

    if (lowStockItems.length === 0) {
        return null;
    }

    function getUrgencyLevel(item: Inventory): number {
        const reorderLevel = item.reorderLevel || threshold;
        const percentage = (item.quantity / reorderLevel) * 100;

        if (percentage <= 25) return 1; // Critical
        if (percentage <= 50) return 2; // High
        if (percentage <= 75) return 3; // Medium
        return 4; // Low
    }

    function getUrgencyColor(item: Inventory): string {
        const urgency = getUrgencyLevel(item);
        switch (urgency) {
            case 1: return 'bg-red-100 text-red-800 border-red-200';
            case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
            case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    }

    function getUrgencyLabel(item: Inventory): string {
        const urgency = getUrgencyLevel(item);
        switch (urgency) {
            case 1: return 'CRITICAL';
            case 2: return 'HIGH';
            case 3: return 'MEDIUM';
            default: return 'LOW';
        }
    }

    function getRecommendedReorderQuantity(item: Inventory): number {
        const optimalLevel = item.optimalLevel || (item.reorderLevel ? item.reorderLevel * 2 : threshold * 3);
        const reorderQuantity = optimalLevel - item.quantity;
        return Math.max(reorderQuantity, item.reorderLevel || threshold);
    }

    return (
        <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-yellow-800">Low Stock Alert</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need attention
                    </Badge>
                </div>
                <CardDescription className="text-yellow-700">
                    The following items are running low and may need reordering
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {criticalItems.map((item) => (
                        <div
                            key={`${item.productId}-${item.storeId}`}
                            className={`flex items-center justify-between p-3 rounded-lg border ${getUrgencyColor(item)}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <Package className="h-4 w-4" />
                                    <div>
                                        <div className="font-semibold">{item.product?.name || 'Unknown Product'}</div>
                                        <div className="text-sm opacity-80">
                                            {item.store?.name || 'Unknown Store'} • Current: {item.quantity} units
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <div className="text-sm font-medium">Reorder Level</div>
                                    <div className="font-bold">{item.reorderLevel || threshold}</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-medium">Recommended</div>
                                    <div className="font-bold">
                                        {getRecommendedReorderQuantity(item)} units
                                    </div>
                                </div>

                                <Badge variant="outline" className={getUrgencyColor(item).replace('bg-', '')}>
                                    {getUrgencyLabel(item)}
                                </Badge>
                            </div>
                        </div>
                    ))}

                    {hasMoreItems && (
                        <Alert className="bg-yellow-100 border-yellow-300">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                +{lowStockItems.length - maxItems} more items with low stock.
                                <Link
                                    href="/dashboard/inventory?lowStock=true"
                                    className="ml-2 inline-flex items-center text-yellow-700 hover:text-yellow-900 font-medium"
                                >
                                    View all
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-yellow-700">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                            asChild
                        >
                            <Link href="/dashboard/inventory/reports/low-stock">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Generate Reorder Report
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LowStockAlert;