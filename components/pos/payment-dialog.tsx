// components/pos/payment-dialog.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, DollarSign, Smartphone, Building, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    cart: any[];
    onPaymentSuccess: (paymentData: {
        paymentMethod: string;
        amountReceived?: number;
        customerInfo?: {
            name?: string;
            email?: string;
            phone?: string;
        };
    }) => Promise<void>;
    store: {
        name: string;
        location: string;
        phone?: string;
    } | null;
    cashier: string;
    employeeId?: string;
    processing?: boolean;
}

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash', icon: DollarSign },
    { value: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building },
];

export function PaymentDialog({
    open,
    onOpenChange,
    total,
    cart,
    onPaymentSuccess,
    store,
    cashier,
    employeeId,
    processing = false
}: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amountReceived, setAmountReceived] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [localProcessing, setLocalProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateChange = () => {
        if (paymentMethod !== 'CASH' || !amountReceived) return 0;
        const received = parseFloat(amountReceived);
        return received - total;
    };

    const handleSubmit = async () => {
        try {
            console.log('🟡 PaymentDialog: handleSubmit started');
            console.log('🟡 PaymentDialog: paymentMethod:', paymentMethod);
            console.log('🟡 PaymentDialog: amountReceived:', amountReceived);
            console.log('🟡 PaymentDialog: total:', total);
            console.log('🟡 PaymentDialog: cart length:', cart?.length);

            setError(null);
            setLocalProcessing(true);

            // Validate cart
            if (!cart || cart.length === 0) {
                console.error('🔴 PaymentDialog: Cart is empty');
                setError('Cart is empty');
                toast.error('Cart is empty');
                setLocalProcessing(false);
                return;
            }

            // Validate cash payment
            if (paymentMethod === 'CASH') {
                const received = parseFloat(amountReceived);
                console.log('🟡 PaymentDialog: Cash payment validation');
                console.log('🟡 PaymentDialog: received:', received);
                console.log('🟡 PaymentDialog: isNaN:', isNaN(received));

                if (!amountReceived || isNaN(received)) {
                    console.error('🔴 PaymentDialog: Amount received is invalid');
                    setError('Please enter amount received');
                    toast.error('Please enter amount received');
                    setLocalProcessing(false);
                    return;
                }
                if (received < total) {
                    const needed = total - received;
                    console.error('🔴 PaymentDialog: Insufficient amount. Need:', needed);
                    setError(`Insufficient amount. Need ${formatCurrency(needed)} more.`);
                    toast.error('Insufficient amount received');
                    setLocalProcessing(false);
                    return;
                }
            }

            // Prepare payment data
            const paymentData = {
                paymentMethod,
                amountReceived: paymentMethod === 'CASH' ? parseFloat(amountReceived) : undefined,
                customerInfo: {
                    name: customerInfo.name || undefined,
                    email: customerInfo.email || undefined,
                    phone: customerInfo.phone || undefined,
                }
            };

            console.log('🟡 PaymentDialog: Calling onPaymentSuccess with:', paymentData);

            // Call parent handler
            try {
                await onPaymentSuccess(paymentData);
                console.log('🟢 PaymentDialog: onPaymentSuccess completed successfully');

                // Reset form after successful payment
                setAmountReceived('');
                setCustomerInfo({ name: '', email: '', phone: '' });
                setPaymentMethod('CASH');
                setError(null);

                // Don't close dialog here - let the parent handle it

            } catch (paymentError: any) {
                console.error('🔴 PaymentDialog: onPaymentSuccess error:', paymentError);
                throw paymentError; // Re-throw to be caught by outer try-catch
            }

        } catch (err: any) {
            console.error('🔴 PaymentDialog: handleSubmit error:', err);
            setError(err.message || 'Payment processing failed');
            toast.error(err.message || 'Payment processing failed');
        } finally {
            console.log('🟡 PaymentDialog: handleSubmit finally, setting localProcessing to false');
            setLocalProcessing(false);
        }
    };

    const handleCancel = () => {
        console.log('🟡 PaymentDialog: Cancelling');
        setPaymentMethod('CASH');
        setAmountReceived('');
        setCustomerInfo({ name: '', email: '', phone: '' });
        setError(null);
        onOpenChange(false);
    };

    const changeAmount = calculateChange();
    const isValid = paymentMethod !== 'CASH' || (changeAmount >= 0 && amountReceived !== '');
    const isProcessing = processing || localProcessing;

    console.log('🟡 PaymentDialog: Render - isValid:', isValid, 'isProcessing:', isProcessing, 'open:', open);

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            console.log('🟡 PaymentDialog: onOpenChange called:', newOpen);
            if (!isProcessing) {
                onOpenChange(newOpen);
            }
        }}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Process Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Order Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Total Amount</span>
                                    <span className="font-bold text-lg">{formatCurrency(total)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Customer Information (Optional)</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <Input
                                    placeholder="Customer Name"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    className="flex-1"
                                    disabled={isProcessing}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <Input
                                    placeholder="Phone Number"
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    type="tel"
                                    className="flex-1"
                                    disabled={isProcessing}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <Input
                                    placeholder="Email"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    type="email"
                                    className="flex-1"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Payment Method</h3>
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={(value) => {
                                console.log('🟡 PaymentDialog: Payment method changed to:', value);
                                setPaymentMethod(value);
                            }}
                            className="grid grid-cols-2 gap-2"
                            disabled={isProcessing}
                        >
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <div key={method.value}>
                                        <RadioGroupItem
                                            value={method.value}
                                            id={method.value}
                                            className="sr-only"
                                            disabled={isProcessing}
                                        />
                                        <Label
                                            htmlFor={method.value}
                                            className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${paymentMethod === method.value
                                                ? 'border-primary bg-primary/10'
                                                : ''
                                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Icon className="w-6 h-6 mb-2" />
                                            <span className="text-sm text-center">{method.label}</span>
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    {/* Cash Specific Input */}
                    {paymentMethod === 'CASH' && (
                        <div className="space-y-3">
                            <Label htmlFor="amountReceived">Amount Received *</Label>
                            <Input
                                id="amountReceived"
                                type="number"
                                min={total}
                                step="0.01"
                                value={amountReceived}
                                onChange={(e) => {
                                    console.log('🟡 PaymentDialog: Amount received changed:', e.target.value);
                                    setAmountReceived(e.target.value);
                                }}
                                placeholder={`Enter amount (minimum ${formatCurrency(total)})`}
                                disabled={isProcessing}
                                className={changeAmount < 0 && amountReceived ? 'border-destructive' : ''}
                            />
                            {amountReceived && (
                                <div className="space-y-1">
                                    {changeAmount >= 0 ? (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Change: </span>
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(changeAmount)}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-destructive">
                                            Insufficient amount. Need {formatCurrency(Math.abs(changeAmount))} more.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Cash Buttons for Cash Payments */}
                    {paymentMethod === 'CASH' && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Quick Amount</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    Math.ceil(total),
                                    Math.ceil(total / 50) * 50,
                                    Math.ceil(total / 100) * 100,
                                    Math.ceil(total / 500) * 500
                                ].map((amount, index) => (
                                    <Button
                                        key={index}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            console.log('🟡 PaymentDialog: Quick amount clicked:', amount);
                                            setAmountReceived(amount.toString());
                                        }}
                                        disabled={isProcessing}
                                        className="text-xs"
                                    >
                                        {formatCurrency(amount)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancel}
                            disabled={isProcessing}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleSubmit}
                            disabled={isProcessing || !isValid}
                            type="button"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Processing...
                                </>
                            ) : (
                                `Complete Payment`
                            )}
                        </Button>
                    </div>

                    {/* Debug Info (Remove in production) */}
                    <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                        <div className="flex justify-between">
                            <span>Debug:</span>
                            <span>isValid: {isValid.toString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>isProcessing:</span>
                            <span>{isProcessing.toString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>changeAmount:</span>
                            <span>{changeAmount}</span>
                        </div>
                    </div>

                    {/* Store Info */}
                    {store && (
                        <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                            <div className="flex justify-between">
                                <span>Store:</span>
                                <span className="font-medium">{store.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Location:</span>
                                <span>{store.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cashier:</span>
                                <span>{cashier}</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}