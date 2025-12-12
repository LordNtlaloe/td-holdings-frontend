// components/dashboard/products/low-stock-alerts.tsx
"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, ShoppingCart, RefreshCw, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { getLowStockProducts } from "@/lib/products-api";

interface LowStockAlertsProps {
    products?: Product[];
}

export default function LowStockAlerts({ products: initialProducts }: LowStockAlertsProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [isLoading, setIsLoading] = useState(!initialProducts);
    const [threshold, setThreshold] = useState(10);

    const fetchLowStockProducts = async () => {
        try {
            setIsLoading(true);
            const result = await getLowStockProducts(threshold);
            if (result.success && result.data) {
                setProducts(result.data);
            }
        } catch (error) {
            console.error("Error fetching low stock products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialProducts) {
            fetchLowStockProducts();
        }
    }, [initialProducts, threshold]);

    const outOfStock = products.filter(p => p.quantity === 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= threshold);
    const criticalStock = products.filter(p => p.quantity <= 5 && p.quantity > 0);

    const refreshData = () => {
        fetchLowStockProducts();
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const totalAlerts = outOfStock.length + lowStock.length;

    if (totalAlerts === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Package className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">All Stock Healthy</h3>
                        <p className="text-gray-500 mb-6">
                            No products are currently below the threshold of {threshold} units.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" onClick={() => setThreshold(5)}>
                                Set Threshold: 5
                            </Button>
                            <Button variant="outline" onClick={() => setThreshold(10)}>
                                Set Threshold: 10
                            </Button>
                            <Button variant="outline" onClick={() => setThreshold(20)}>
                                Set Threshold: 20
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                        Low Stock Alerts
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-muted-foreground">
                            {totalAlerts} product{totalAlerts !== 1 ? 's' : ''} need attention
                        </p>
                        <Badge variant="destructive" className="text-xs">
                            {criticalStock.length} Critical
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Threshold: {threshold}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        Print Report
                    </Button>
                </div>
            </div>

            {/* Out of Stock Section */}
            {outOfStock.length > 0 && (
                <Card className="border-red-300 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Out of Stock ({outOfStock.length})
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            Products with zero units available
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {outOfStock.slice(0, 10).map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 border border-red-200 bg-white rounded-lg hover:bg-red-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Package className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{product.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {product.type}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    Grade {product.grade}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {product.store?.name || 'No store'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-red-600">0 units</p>
                                        <p className="text-sm text-red-500">Out of Stock</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {outOfStock.length > 10 && (
                            <div className="mt-4 text-center">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/products?stock=out">
                                        View all {outOfStock.length} out of stock products
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Low Stock Section */}
            {lowStock.length > 0 && (
                <Card className="border-orange-300 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-orange-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Low Stock ({lowStock.length})
                        </CardTitle>
                        <CardDescription className="text-orange-600">
                            Products below {threshold} units threshold
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {lowStock
                                .sort((a, b) => a.quantity - b.quantity)
                                .slice(0, 10)
                                .map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-4 border border-orange-200 bg-white rounded-lg hover:bg-orange-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <Package className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{product.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {product.type}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        Grade {product.grade}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {product.store?.name || 'No store'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${product.quantity <= 5 ? 'text-red-600' : 'text-orange-600'
                                                }`}>
                                                {product.quantity} units
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Value: M{(product.price * product.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {lowStock.length > 10 && (
                            <div className="mt-4 text-center">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/products?stock=low">
                                        View all {lowStock.length} low stock products
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Alerts</p>
                            <p className="text-3xl font-bold text-orange-600">{totalAlerts}</p>
                            <p className="text-xs text-muted-foreground mt-2">Products needing attention</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Critical Items</p>
                            <p className="text-3xl font-bold text-red-600">{criticalStock.length}</p>
                            <p className="text-xs text-muted-foreground mt-2">5 units or less</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Value at Risk</p>
                            <p className="text-3xl font-bold text-red-600">
                                M{lowStock.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">Inventory value below threshold</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold mb-1">Take Action</h4>
                            <p className="text-sm text-muted-foreground">
                                Manage low stock products and prevent outages
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Bulk Restock
                            </Button>
                            <Button>
                                <Package className="h-4 w-4 mr-2" />
                                Create Purchase Order
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}