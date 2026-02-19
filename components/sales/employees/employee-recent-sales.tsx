// components/sales/employee/employee-recent-sales.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Sale } from '@/types/sales';
import { PaymentMethodBadge } from '../common/payment-method-badge';
import { Eye, ChevronRight, ShoppingBag } from 'lucide-react';

interface EmployeeRecentSalesProps {
    sales: Sale[];
    onViewAll: () => void;
    onViewDetails: (sale: Sale) => void;
}

export function EmployeeRecentSales({ sales, onViewAll, onViewDetails }: EmployeeRecentSalesProps) {
    const recentSales = sales.slice(0, 5);

    // Get initials for avatar
    const getInitials = (name?: string | null) => {
        if (!name) return 'W';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get avatar color based on customer type
    const getAvatarColor = (customerName?: string | null) => {
        if (!customerName) return 'bg-gray-100 text-gray-600';
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-yellow-100 text-yellow-600',
            'bg-pink-100 text-pink-600',
            'bg-indigo-100 text-indigo-600',
        ];
        const index = customerName.length % colors.length;
        return colors[index];
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onViewAll}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-87.5 pr-4">
                    <div className="space-y-3">
                        {recentSales.length > 0 ? (
                            recentSales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="group flex items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md hover:border-primary/20"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <Avatar className={`h-10 w-10 ${getAvatarColor(sale.customerName)}`}>
                                            <AvatarFallback>
                                                {getInitials(sale.customerName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {sale.customerName || 'Walk-in Customer'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{format(new Date(sale.createdAt), 'MMM dd, HH:mm')}</span>
                                                <span>•</span>
                                                <span className="font-mono">
                                                    #{sale.id.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                            {sale.saleItems && sale.saleItems.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {sale.saleItems.length} item{sale.saleItems.length !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 ml-2">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold whitespace-nowrap">
                                                {sale.total.toLocaleString()} FCFA
                                            </p>
                                            <PaymentMethodBadge method={sale.paymentMethod} />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewDetails(sale)}
                                            className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                                            title="View details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium text-lg mb-1">No recent sales</h3>
                                <p className="text-sm text-muted-foreground max-w-50">
                                    When you make sales, they'll appear here
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-4"
                                    onClick={() => window.location.href = '/sales/new'}
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Create New Sale
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}