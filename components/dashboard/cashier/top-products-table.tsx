'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import SalesDashboardAPI, { TopSellingProduct } from '@/lib/api/sales-dashboard';

interface TopProductsTableProps {
    storeId?: string;
    token: string;
}

type Period = 'today' | 'week' | 'month';

export function TopProductsTable({ storeId, token }: TopProductsTableProps) {
    const [products, setProducts] = useState<TopSellingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('week');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await SalesDashboardAPI.getTopProducts(token, {
                    storeId,
                    period,
                    limit: 10,
                });
                setProducts(data);
            } catch (err) {
                console.error('Failed to load top products:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) load();
    }, [token, storeId, period]);

    const maxRevenue = Math.max(...products.map(p => p.revenue), 1);

    return (
        <div className="space-y-4">
            <Tabs value={period} onValueChange={v => setPeriod(v as Period)}>
                <TabsList className="h-8">
                    <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs">This Week</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs">This Month</TabsTrigger>
                </TabsList>
            </Tabs>

            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : products.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                    <p className="text-sm text-muted-foreground">No sales data for this period</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Units Sold</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="w-32">Share</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product, i) => (
                            <TableRow key={product.id} className="group">
                                <TableCell className="text-muted-foreground font-mono text-xs">
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-8 w-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium">{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary" className="font-mono">
                                        {product.quantity.toLocaleString()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold tabular-nums text-sm">
                                    LSL {product.revenue.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress
                                            value={(product.revenue / maxRevenue) * 100}
                                            className="h-1.5 flex-1"
                                        />
                                        <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                                            {Math.round((product.revenue / maxRevenue) * 100)}%
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}