"use client";

import { useState, useEffect } from "react";
import SalesAPI from "@/lib/api/sales";
import { CreateSaleFormValues, Sale } from "@/types";
import { CreditCard, DollarSign, Smartphone, Banknote, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { usePos } from "@/contexts/cart-context";
import { PaymentMethodType as PaymentMethod } from "@/types";

// shadcn/ui components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// Define the expected response type from createSale
interface CreateSaleResponse {
    success: boolean;
    message: string;
    data: {
        sale: Sale;
        receipt: string;
    };
}

interface PaymentDialogProps {
    store?: {
        id: string;
        name: string;
        isMainStore?: boolean;
    } | null;
    employee?: {
        id: string;
        user?: {
            firstName?: string;
            lastName?: string;
        };
    } | null;
}

export function PaymentDialog({ store, employee }: PaymentDialogProps) {
    const {
        cart,
        calculateTotals,
        clearCart,
        isPaymentDialogVisible,
        closePaymentDialog,
    } = usePos();

    const { accessToken, user } = useAuth();

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [amountReceived, setAmountReceived] = useState("");
    const [processing, setProcessing] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [completedSale, setCompletedSale] = useState<Sale | null>(null);

    const { subtotal, totalDiscount, tax, totalWithTax } = calculateTotals();
    const change = parseFloat(amountReceived) - totalWithTax;

    // Reset form when dialog opens
    useEffect(() => {
        if (isPaymentDialogVisible) {
            setAmountReceived("");
            setCustomerName("");
            setCustomerEmail("");
            setCustomerPhone("");
            setCompletedSale(null);
            setPaymentMethod(PaymentMethod.CASH);
        }
    }, [isPaymentDialogVisible]);

    const handlePayment = async () => {
        if (!accessToken || !user) {
            toast.error("Please log in to process payment");
            return;
        }

        if (!employee || !store) {
            toast.error("Employee or store information missing");
            console.error("Missing employee or store:", { employee, store });
            return;
        }

        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        if (paymentMethod === "CASH" && (!amountReceived || parseFloat(amountReceived) < totalWithTax)) {
            toast.error("Please enter a valid amount received");
            return;
        }

        setProcessing(true);

        try {
            // Prepare sale data matching your backend expectations
            const saleData: CreateSaleFormValues = {
                employeeId: employee.id,
                storeId: store.id,
                userId: user.id,
                subtotal: subtotal,
                tax: tax,
                total: totalWithTax,
                paymentMethod: paymentMethod,
                customerName: customerName || undefined,
                customerEmail: customerEmail || undefined,
                customerPhone: customerPhone || undefined,
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.unitPrice || item.product.basePrice
                }))
            };

            console.log("Processing payment with data:", saleData);

            // Create sale via API - Type it as CreateSaleResponse
            const response = await SalesAPI.createSale(accessToken, saleData) as CreateSaleResponse;

            console.log("Sale created successfully - Full response:", JSON.stringify(response, null, 2));

            // Extract the sale from the response data
            const sale = response.data.sale;
            
            if (!sale) {
                console.error("No sale data in response:", response);
                throw new Error("No sale data received from server");
            }

            setCompletedSale(sale);

            toast.success("Payment processed successfully!", {
                description: `Sale #${sale.id.slice(-8).toUpperCase()} completed`,
            });

            // Clear cart after successful payment
            clearCart();

        } catch (error: any) {
            console.error("Payment processing error:", error);
            toast.error("Payment failed", {
                description: error.message || "Please try again",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintReceipt = () => {
        if (completedSale) {
            // You can implement actual printing logic here
            // For now, just open print dialog
            window.print();
        }
    };

    const handleClose = () => {
        closePaymentDialog();
        // Reset all state
        setAmountReceived("");
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCompletedSale(null);
        setPaymentMethod(PaymentMethod.CASH);
    };

    const paymentMethods = [
        { id: "CASH" as PaymentMethod, label: "Cash", icon: Banknote },
        { id: "CARD" as PaymentMethod, label: "Card", icon: CreditCard },
        { id: "MOBILE" as PaymentMethod, label: "Mobile", icon: Smartphone },
        { id: "CREDIT" as PaymentMethod, label: "Credit", icon: DollarSign },
    ];

    const quickAmounts = [
        totalWithTax,
        Math.ceil(totalWithTax / 10) * 10,
        Math.ceil(totalWithTax / 50) * 50,
        Math.ceil(totalWithTax / 100) * 100,
    ];

    return (
        <Dialog open={isPaymentDialogVisible} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-150 p-0 gap-0 bg-background">
                {completedSale ? (
                    /* Success State */
                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <svg 
                                    className="w-10 h-10 text-green-500" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M5 13l4 4L19 7" 
                                    />
                                </svg>
                            </div>

                            <div>
                                <DialogTitle className="text-2xl text-center">
                                    Payment Successful!
                                </DialogTitle>
                                <DialogDescription className="text-center mt-2">
                                    Sale #{completedSale.id.slice(-8).toUpperCase()}
                                </DialogDescription>
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total Paid</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        M{completedSale.total.toFixed(2)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium">
                                        {paymentMethods.find(m => m.id === completedSale.paymentMethod)?.label || completedSale.paymentMethod}
                                    </span>
                                </div>
                                {completedSale.customerName && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Customer</span>
                                        <span className="font-medium">{completedSale.customerName}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={handlePrintReceipt}
                            >
                                <Printer className="w-4 h-4" />
                                Print Receipt
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleClose}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="p-6 pb-4 border-b">
                            <DialogTitle>Payment</DialogTitle>
                            <DialogDescription>
                                {store?.name} • {employee?.user?.firstName} {employee?.user?.lastName}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {/* Customer Information */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Customer Information (Optional)</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">Name</Label>
                                        <Input
                                            id="customerName"
                                            placeholder="Customer Name"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="customerEmail">Email</Label>
                                            <Input
                                                id="customerEmail"
                                                type="email"
                                                placeholder="Email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customerPhone">Phone</Label>
                                            <Input
                                                id="customerPhone"
                                                type="tel"
                                                placeholder="Phone"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="space-y-3">
                                <Label>Payment Method</Label>
                                <Tabs
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                                    className="w-full"
                                >
                                    <TabsList className="grid grid-cols-5 h-auto p-1">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <TabsTrigger
                                                    key={method.id}
                                                    value={method.id}
                                                    className="flex flex-col items-center gap-1 py-2 px-1 h-auto"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-xs">{method.label}</span>
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Amount Section */}
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Total Amount</span>
                                        <span className="text-3xl font-bold">
                                            M{totalWithTax.toFixed(2)}
                                        </span>
                                    </div>

                                    {paymentMethod === "CASH" && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="amountReceived">Amount Received</Label>
                                                <Input
                                                    id="amountReceived"
                                                    type="number"
                                                    value={amountReceived}
                                                    onChange={(e) => setAmountReceived(e.target.value)}
                                                    placeholder="0.00"
                                                    className="text-lg"
                                                    autoFocus
                                                    min={totalWithTax}
                                                    step="0.01"
                                                />
                                            </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                {quickAmounts.map((amount, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAmountReceived(amount.toFixed(2))}
                                                        className="text-xs"
                                                    >
                                                        M{amount.toFixed(0)}
                                                    </Button>
                                                ))}
                                            </div>

                                            {amountReceived && (
                                                <div className="flex items-center justify-between pt-4 border-t">
                                                    <span className="text-muted-foreground">Change</span>
                                                    <span
                                                        className={`text-2xl font-bold ${
                                                            change >= 0 ? "text-green-600" : "text-red-600"
                                                        }`}
                                                    >
                                                        M{change.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card>
                                <CardContent className="p-6 space-y-3">
                                    <h3 className="font-semibold">Order Summary</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Items ({cart.length})</span>
                                        <span>M{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Tax (15%)</span>
                                        <span>M{tax.toFixed(2)}</span>
                                    </div>
                                    {totalDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-600">Discount</span>
                                            <span className="text-green-600">-M{totalDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-xl font-bold text-green-600">
                                            M{totalWithTax.toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handlePayment}
                                    disabled={
                                        processing ||
                                        cart.length === 0 ||
                                        !employee ||
                                        !store ||
                                        (paymentMethod === "CASH" && (!amountReceived || change < 0))
                                    }
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        "Complete Payment"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}