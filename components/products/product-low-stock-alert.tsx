"use client";

import { LowStockProduct } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface LowStockAlertProps {
    products: LowStockProduct[];
    maxItems?: number;
}

export function LowStockAlert({ products, maxItems = 5 }: LowStockAlertProps) {
    if (products.length === 0) return null;

    const displayedProducts = products.slice(0, maxItems);

    // Calculate total low stock items across all products
    const totalLowStockItems = products.reduce((total, product) => {
        return total + product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    }, 0);

    return (
        <Alert className="border-orange-200 bg-orange-50">
            <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 shrink-0" />
                <div className="flex-1">
                    <AlertTitle className="text-orange-800">
                        Low Stock Alert
                        <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 border-orange-300">
                            {products.length} {products.length === 1 ? 'product' : 'products'}
                        </Badge>
                    </AlertTitle>

                    <AlertDescription className="text-orange-700 mt-2">
                        <div className="space-y-3">
                            {displayedProducts.map((product) => {
                                const totalQuantity = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
                                const reorderLevel = product.inventories[0]?.reorderLevel || 0;

                                return (
                                    <div key={product.product.id} className="border-b border-orange-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="font-medium text-sm">{product.product.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 text-xs bg-orange-100 text-orange-800 border-orange-300"
                                                >
                                                    {product.product.type}
                                                </Badge>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {totalQuantity} 
                                            </span>
                                        </div>

                                        {/* Store breakdown */}
                                        <div className="mt-1 text-xs text-orange-600">
                                            {product.inventories.map((inventory, idx) => (
                                                <div key={idx} className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center">
                                                        <Store className="h-3 w-3 mr-1" />
                                                        <span>{inventory.storeName}</span>
                                                    </div>
                                                    <span className="font-medium">
                                                        {inventory.quantity} {inventory.reorderLevel && inventory.quantity <= inventory.reorderLevel && (
                                                            <span className="text-red-500 ml-1">(Below reorder: {inventory.reorderLevel})</span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {products.length > maxItems && (
                            <p className="text-sm mt-3 text-orange-600">
                                ... and {products.length - maxItems} more product(s) with low stock
                            </p>
                        )}

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-orange-600">
                                <span className="font-medium">Total low stock items:</span> {totalLowStockItems}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                                asChild
                            >
                                <Link href="/products?filter=low-stock">
                                    View Details
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}