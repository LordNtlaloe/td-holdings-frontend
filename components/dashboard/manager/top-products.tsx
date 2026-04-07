'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import SalesDashboardAPI from '@/lib/api/sales-dashboard';
import type { TopSellingProduct } from '@/lib/api/sales-dashboard';

interface TopProductsProps {
    token: string;
    storeId?: string;
    period?: 'today' | 'week' | 'month';
}

export function TopProducts({ token, storeId, period = 'week' }: TopProductsProps) {
    const [products, setProducts] = useState<TopSellingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [maxRevenue, setMaxRevenue] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await SalesDashboardAPI.getTopProducts(token, { storeId, period });
                setProducts(data);

                // Calculate max revenue for percentage scaling
                if (data.length > 0) {
                    setMaxRevenue(Math.max(...data.map(p => p.revenue)));
                }
            } catch (error) {
                console.error('Failed to fetch top products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProducts();
        }
    }, [token, storeId, period]);

    if (loading) {
        return (
            <div className="flex h-75 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <p className="text-center text-muted-foreground py-8">No product data available</p>
        );
    }

    return (
        <div className="space-y-8">
            {products.map((product) => {
                const percentage = (product.revenue / maxRevenue) * 100;

                return (
                    <div key={product.id} className="space-y-2">
                        <div className="flex items-center">
                            <Avatar className="h-9 w-9">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} />
                                ) : (
                                    <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className="ml-4 space-y-1 flex-1">
                                <p className="text-sm font-medium leading-none">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {product.quantity} units · LSL {product.revenue.toLocaleString()}
                                </p>
                            </div>
                            <div className="font-medium">{Math.round(percentage)}%</div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>
                );
            })}
        </div>
    );
}