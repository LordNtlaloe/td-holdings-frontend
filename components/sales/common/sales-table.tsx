// components/sales/common/sales-table.tsx
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Sale } from '@/types/sales';
import { PaymentMethodBadge } from './payment-method-badge';

interface SalesTableProps {
    sales: Sale[];
    loading?: boolean;
    onViewDetails: (sale: Sale) => void;
    onVoidSale: (sale: Sale) => void;
    onPrintReceipt: (sale: Sale) => void;
    showEmployee?: boolean;
    showStore?: boolean;
}

export function SalesTable({
    sales,
    loading,
    onViewDetails,
    onVoidSale,
    onPrintReceipt,
    showEmployee = false,
    showStore = false,
}: SalesTableProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    // Helper function to safely format date
    const formatDate = (date: Date | string) => {
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            return format(dateObj, 'MMM dd, yyyy HH:mm');
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Helper function to get item count
    const getItemCount = (sale: Sale) => {
        return sale.saleItems?.length || sale._count?.saleItems || 0;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date & Time</TableHead>
                        {showEmployee && <TableHead>Employee</TableHead>}
                        {showStore && <TableHead>Store</TableHead>}
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={showEmployee && showStore ? 10 : 8} className="text-center py-8 text-muted-foreground">
                                No sales found
                            </TableCell>
                        </TableRow>
                    ) : (
                        sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell className="font-medium">
                                    #{sale.id.slice(-8).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    {formatDate(sale.createdAt)}
                                </TableCell>
                                {showEmployee && (
                                    <TableCell>
                                        {sale.employee?.user?.firstName || 'N/A'}
                                    </TableCell>
                                )}
                                {showStore && (
                                    <TableCell>
                                        {sale.store?.name || 'N/A'}
                                    </TableCell>
                                )}
                                <TableCell>
                                    {sale.customerName || (
                                        <span className="text-muted-foreground">Walk-in</span>
                                    )}
                                </TableCell>
                                <TableCell>{getItemCount(sale)}</TableCell>
                                <TableCell className="font-medium">
                                    {sale.total.toLocaleString()} FCFA
                                </TableCell>
                                <TableCell>
                                    <PaymentMethodBadge method={sale.paymentMethod as any} />
                                </TableCell>
                                <TableCell>
                                    {sale.voidedSale ? (
                                        <Badge variant="destructive">Voided</Badge>
                                    ) : (
                                        <Badge variant="default" className="bg-green-500">Completed</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onViewDetails(sale)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onPrintReceipt(sale)}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Print Receipt
                                            </DropdownMenuItem>
                                            {!sale.voidedSale && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => onVoidSale(sale)}
                                                        className="text-red-600"
                                                    >
                                                        <AlertCircle className="mr-2 h-4 w-4" />
                                                        Void Sale
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}