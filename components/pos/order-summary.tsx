'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartItem } from "@/types/pos";
import { Store, Employee } from "@/types";
import { Percent, MoreVertical, ShoppingCart, Truck, Receipt, AlertCircle } from "lucide-react";
import { CartItemComponent } from "./cart-item";
import { AnimatePresence, motion } from "framer-motion";

interface OrderSummaryProps {
    cart: CartItem[];
    store: Store | null;
    employee: Employee | null;
    user: any;
    transactionType: "retail" | "wholesale" | "transfer";
    subtotal: number;
    tax: number;
    totalDiscount: number;
    total: number;
    discount: any;
    onIncreaseQuantity: (productId: string) => void;
    onDecreaseQuantity: (productId: string) => void;
    onRemoveFromCart: (productId: string) => void;
    onClearCart: () => void;
    onOpenDiscountDialog: () => void;
    onRemoveDiscount: () => void;
    onProcessPayment: () => void;
    onProcessTransfer: () => void;
    loading?: boolean;
}

export const OrderSummary = ({
    cart,
    store,
    employee,
    user,
    transactionType,
    subtotal,
    tax,
    totalDiscount,
    total,
    discount,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveFromCart,
    onClearCart,
    onOpenDiscountDialog,
    onRemoveDiscount,
    onProcessPayment,
    onProcessTransfer,
    loading = false,
}: OrderSummaryProps) => {
    const totalWithTax = total + tax;

    return (
        <aside className="w-95 bg-card border-l border-border flex flex-col">
            {/* Order Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-foreground text-xl font-semibold">Order Summary</h2>
                    <Badge variant="outline">
                        #{Math.random().toString(36).substr(2, 8).toUpperCase()}
                    </Badge>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Transaction Type</span>
                        <Badge variant="secondary">
                            {transactionType === "retail"
                                ? "Retail Sale"
                                : transactionType === "wholesale"
                                    ? "Wholesale"
                                    : "Stock Transfer"}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Store</span>
                        <span className="text-foreground text-sm font-medium">
                            {store?.name ?? "—"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Cashier</span>
                        <span className="text-foreground text-sm font-medium">
                            {employee?.user?.firstName ?? user?.firstName}{" "}
                            {employee?.user?.lastName ?? user?.lastName}
                        </span>
                    </div>

                    {employee?.id && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Employee ID</span>
                            <span className="text-xs font-mono text-muted-foreground">
                                {employee.id.slice(0, 8)}…
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 px-6 py-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-muted rounded mb-2 animate-pulse" />
                                    <div className="h-3 w-24 bg-muted rounded mb-2 animate-pulse" />
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                                        <div className="flex items-center gap-1">
                                            <div className="h-6 w-6 bg-muted rounded animate-pulse" />
                                            <div className="h-4 w-6 bg-muted rounded animate-pulse" />
                                            <div className="h-6 w-6 bg-muted rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <CartItemComponent
                                        item={item}
                                        onIncrease={onIncreaseQuantity}
                                        onDecrease={onDecreaseQuantity}
                                        onRemove={onRemoveFromCart}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Cart is empty</h3>
                                <p className="text-sm text-muted-foreground">Add products to get started</p>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* Summary Footer */}
            <div className="border-t border-border p-6 space-y-4">
                {/* Discount */}
                <Card className="bg-muted">
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Percent className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-foreground text-sm font-medium">
                                        {discount
                                            ? `${discount.type === "percentage" ? `${discount.value}%` : `M${discount.value}`} Discount`
                                            : "Add Discount"}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {discount?.type === "percentage"
                                            ? `Saves M${(subtotal * (discount.value / 100)).toFixed(2)}`
                                            : "Apply discount to order"}
                                    </p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={onOpenDiscountDialog}>
                                        Apply Discount
                                    </DropdownMenuItem>
                                    {discount && (
                                        <DropdownMenuItem onClick={onRemoveDiscount} className="text-destructive">
                                            Remove Discount
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                {/* Totals */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">M{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">VAT (15%)</span>
                        <span className="text-foreground">M{tax.toFixed(2)}</span>
                    </div>
                    {discount && totalDiscount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="text-green-500">-M{totalDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                        <span className="text-foreground font-semibold">Total Amount</span>
                        <span className="text-foreground text-xl font-bold">M{totalWithTax.toFixed(2)}</span>
                    </div>
                </div>

                {/* Missing employee/store warning */}
                {!employee && (
                    <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                            Employee profile not found — payment processing unavailable.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                    {transactionType === "transfer" ? (
                        <Button
                            size="lg"
                            className="w-full gap-2"
                            onClick={onProcessTransfer}
                            disabled={cart.length === 0 || !store}
                        >
                            <Truck className="w-4 h-4" />
                            Process Transfer
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="w-full gap-2"
                            onClick={onProcessPayment}
                            disabled={cart.length === 0 || !employee}
                        >
                            <Receipt className="w-4 h-4" />
                            Process {transactionType === "wholesale" ? "Wholesale" : "Sale"}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={onClearCart}
                        disabled={cart.length === 0}
                    >
                        Clear Cart
                    </Button>
                </div>
            </div>
        </aside>
    );
};