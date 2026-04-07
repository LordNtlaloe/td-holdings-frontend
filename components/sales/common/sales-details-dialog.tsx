'use client';

import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Sale } from '@/types/sales';
import { PaymentMethodBadge } from './payment-method-badge';
import { User, Store, Calendar, Hash } from 'lucide-react';

interface SaleDetailsDialogProps {
    sale: Sale | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Sale Details</DialogTitle>
                    <DialogDescription>Complete information about this transaction</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6">
                    {/* Invoice + date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Hash className="mr-2 h-4 w-4" /> Invoice Number
                            </div>
                            <p className="font-medium">#{sale.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" /> Date & Time
                            </div>
                            <p className="font-medium">{format(new Date(sale.createdAt), 'PPP p')}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Customer + employee */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Customer Information</h4>
                            {sale.customerName ? (
                                <div className="space-y-1">
                                    <p className="text-sm">{sale.customerName}</p>
                                    {sale.customerEmail && (
                                        <p className="text-sm text-muted-foreground">{sale.customerEmail}</p>
                                    )}
                                    {sale.customerPhone && (
                                        <p className="text-sm text-muted-foreground">{sale.customerPhone}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Walk-in customer</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Employee & Store</h4>
                            <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {sale.employee?.user?.firstName ?? 'Unknown'}&nbsp;
                                    {sale.employee?.user?.lastName ?? ''}
                                </div>
                                <div className="flex items-center text-sm">
                                    <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {sale.store?.name ?? 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment + totals */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h4 className="text-sm font-medium mb-1">Payment Method</h4>
                            <PaymentMethodBadge method={sale.paymentMethod} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-1">Subtotal</h4>
                            <p className="text-sm">{sale.subtotal.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-1">Tax</h4>
                            <p className="text-sm">{sale.tax.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-1">Total</h4>
                            <p className="text-lg font-bold">{sale.total.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-1">Status</h4>
                            {sale.voidedSale ? (
                                <Badge variant="destructive">Voided</Badge>
                            ) : (
                                <Badge variant="default" className="bg-green-500">Completed</Badge>
                            )}
                        </div>
                    </div>

                    {/* Void info */}
                    {sale.voidedSale && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-red-600">Void Information</h4>
                                <p className="text-sm">Reason: {sale.voidedSale.reason}</p>
                                <p className="text-sm text-muted-foreground">
                                    Voided by:{' '}
                                    {sale.voidedSale.voidedByUser?.firstName ?? 'Unknown'}&nbsp;
                                    {sale.voidedSale.voidedByUser?.lastName ?? ''} on{' '}
                                    {format(new Date(sale.voidedSale.createdAt), 'PPP p')}
                                </p>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Items */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Items</h4>
                        <ScrollArea className="h-48">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.saleItems?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product?.name ?? 'Unknown Product'}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {item.price.toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(item.quantity * item.price).toLocaleString()} FCFA
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}