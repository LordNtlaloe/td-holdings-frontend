'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Loader2, Search } from 'lucide-react';
import SalesDashboardAPI, { RecentActivity } from '@/lib/api/sales-dashboard';

interface RecentTransactionsProps {
    storeId?: string;
    token: string;
    limit?: number;
}

const typeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    SALE:   { label: 'Sale',   variant: 'default'     },
    RETURN: { label: 'Return', variant: 'secondary'   },
    VOID:   { label: 'Void',   variant: 'destructive' },
};

export function RecentTransactions({ storeId, token, limit = 20 }: RecentTransactionsProps) {
    const [transactions, setTransactions] = useState<RecentActivity[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await SalesDashboardAPI.getRecentActivity(token, { storeId, limit });
                setTransactions(data);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) load();
    }, [token, storeId, limit]);

    const filtered = transactions.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.customer?.toLowerCase().includes(q) ||
            t.employee.toLowerCase().includes(q) ||
            t.type.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter by customer, employee, type…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                </div>
            ) : (
                <ScrollArea className="h-105">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(t => {
                                const cfg = typeConfig[t.type] ?? { label: t.type, variant: 'outline' as const };
                                const isNegative = t.type === 'RETURN' || t.type === 'VOID';
                                return (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <Badge variant={cfg.variant} className="text-xs">
                                                {cfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {t.customer || <span className="text-muted-foreground italic">Walk-in</span>}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {t.employee}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground font-mono tabular-nums">
                                            {new Date(t.timestamp).toLocaleTimeString('en-ZA', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold tabular-nums text-sm ${
                                            isNegative ? 'text-red-600' : 'text-emerald-600'
                                        }`}>
                                            {isNegative ? '−' : '+'}LSL {Math.abs(t.amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                <a href={`/sales/${t.id}`}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            )}
        </div>
    );
}