'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import SalesReportsAPI from '@/lib/api/sales-report';
import { formatCurrency } from '@/lib/utils';

interface SalesByStoreProps {
    token: string;
    storeId?: string;  // Add storeId for filtering
    dateRange?: { from: Date; to: Date };
}

export function SalesByStore({ token, storeId, dateRange }: SalesByStoreProps) {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const report = await SalesReportsAPI.getSalesReport(token, {
                    groupBy: 'store',
                    storeId, // Pass storeId to API
                    startDate: dateRange?.from,
                    endDate: dateRange?.to
                });

                setStores(report.report || []);
                setTotalRevenue(report.summary?.totalRevenue || 0);
            } catch (error) {
                console.error('Failed to fetch sales by store:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, storeId, dateRange]);

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

    // If storeId is provided, filter to show only that store
    const displayStores = storeId
        ? stores.filter(store => store.storeId === storeId)
        : stores;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales by Store</CardTitle>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Store</TableHead>
                            <TableHead className="text-right">Sales</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Transactions</TableHead>
                            <TableHead className="text-right">Avg Ticket</TableHead>
                            <TableHead className="text-right">% of Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayStores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No sales data found
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayStores.map((store) => {
                                const percentage = totalRevenue > 0 ? (store.revenue / totalRevenue) * 100 : 0;

                                return (
                                    <TableRow key={store.storeId}>
                                        <TableCell className="font-medium">{store.storeName}</TableCell>
                                        <TableCell className="text-right">{store.sales}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(store.revenue)}</TableCell>
                                        <TableCell className="text-right">{store.transactions}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(store.averageTicket)}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
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