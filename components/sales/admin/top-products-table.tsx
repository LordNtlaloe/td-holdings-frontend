// components/sales/admin/top-products-table.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sale } from '@/types/sales';
import { TopProductItem } from '@/types/sales';

interface TopProductsTableProps {
    sales: Sale[];
    token: string;
}

// Extended interface for product with percentage
interface ProductWithPercentage extends TopProductItem {
    percentageOfTotal: number;
}

export function TopProductsTable({ sales, token }: TopProductsTableProps) {
    const [products, setProducts] = useState<ProductWithPercentage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                // In a real app, you'd call the API
                // const data = await SalesReportsAPI.getTopProducts(token);

                // For now, aggregate from sales data
                const productMap = new Map<string, TopProductItem & { quantity?: number; revenue?: number }>();

                sales.forEach(sale => {
                    sale.saleItems?.forEach(item => {
                        const productId = item.productId;
                        const existing = productMap.get(productId);

                        if (existing) {
                            // Update existing product
                            existing.total_quantity += item.quantity;
                            existing.total_revenue += item.quantity * item.price;
                            existing.sales_count += 1;
                            existing.avg_price = existing.total_revenue / existing.total_quantity;
                        } else {
                            // Create new product entry
                            productMap.set(productId, {
                                id: productId,
                                name: item.product?.name || 'Unknown Product',
                                type: item.product?.type || 'N/A',
                                grade: item.product?.grade || 'N/A',
                                total_quantity: item.quantity,
                                total_revenue: item.quantity * item.price,
                                sales_count: 1,
                                avg_price: item.price,
                            });
                        }
                    });
                });

                // Calculate percentages
                const totalRevenue = Array.from(productMap.values()).reduce(
                    (sum, p) => sum + p.total_revenue,
                    0
                );

                const productsWithPercentage = Array.from(productMap.values())
                    .map(p => ({
                        ...p,
                        percentageOfTotal: totalRevenue > 0 ? (p.total_revenue / totalRevenue) * 100 : 0,
                    }))
                    .sort((a, b) => b.total_revenue - a.total_revenue)
                    .slice(0, 10);

                setProducts(productsWithPercentage);
            } catch (error) {
                console.error('Failed to fetch top products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopProducts();
    }, [sales]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Loading product data...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                    Best performing products by revenue and quantity
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Type/Grade</TableHead>
                            <TableHead className="text-right">Quantity Sold</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Avg Price</TableHead>
                            <TableHead>% of Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`/products/${product.id}.jpg`} />
                                            <AvatarFallback>{getInitials(product.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ID: {product.id.slice(-8)}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge variant="outline">{product.type}</Badge>
                                        {product.grade && product.grade !== 'N/A' && (
                                            <Badge variant="secondary">{product.grade}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {product.total_quantity.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {product.total_revenue.toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right">
                                    {product.avg_price.toLocaleString()} FCFA
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Progress value={product.percentageOfTotal} className="h-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {product.percentageOfTotal.toFixed(1)}%
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No product data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}