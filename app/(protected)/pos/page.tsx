// app/(protected)/pos/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, Search, Trash2, Plus, Minus, Receipt, CreditCard, DollarSign, Store, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { usePos } from '@/context/CartContext';
import { PaymentDialog } from '@/components/pos/payment-dialog';
import { toast } from 'sonner';
import { getAllProducts } from '@/lib/products-api';
import { createSale, printReceipt } from '@/lib/sales-api';
import { useCurrentUser } from '@/hooks/use-current-user';

// Define proper types for cart items and receipt items
interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    discount: number;
}

interface ReceiptItem {
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
}

interface Receipt {
    saleNumber: string;
    date: string;
    cashier: string;
    store: string;
    paymentMethod: string;
    amountReceived?: number;
    changeAmount?: number;
    items: ReceiptItem[];
    subtotal: number;
    totalDiscount: number;
    total: number;
}

export default function POSPage() {
    const {
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        applyDiscount,
        calculateTotals,
        clearCart,
        isPaymentDialogVisible,
        openPaymentDialog,
        closePaymentDialog,
        currentStore,
        currentEmployee = useCurrentUser(),
        currentReceipt,
        setCurrentReceipt
    } = usePos();

    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showReceipt, setShowReceipt] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const fetchedProducts = await getAllProducts();
            console.log('Fetched products:', fetchedProducts);
            setProducts(fetchedProducts || []);
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.commodity?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.type === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const { subtotal, totalDiscount, total } = calculateTotals();
    // Update just the handleProcessPayment function in page.tsx:
    const handleProcessPayment = async (paymentData: {
        paymentMethod: string;
        amountReceived?: number;
        customerInfo?: {
            name?: string;
            email?: string;
            phone?: string;
        };
    }) => {
        console.log('🟡 POS Page: handleProcessPayment called with:', paymentData);

        if (cart.length === 0) {
            console.error('🔴 POS Page: Cart is empty');
            toast.error('Cart is empty');
            return;
        }

        if (!currentEmployee) {
            console.error('🔴 POS Page: No cashier selected');
            toast.error('No cashier selected');
            return;
        }

        try {
            setProcessingPayment(true);
            console.log('🟡 POS Page: Processing payment started');

            // Calculate totals
            const taxRate = 0.05;
            const calculatedSubtotal = subtotal - totalDiscount;
            const tax = calculatedSubtotal * taxRate;
            const calculatedTotal = calculatedSubtotal + tax;

            console.log('🟡 POS Page: Calculated totals:', {
                subtotal,
                totalDiscount,
                calculatedSubtotal,
                tax,
                calculatedTotal
            });

            // Validate cash payment
            if (paymentData.paymentMethod === 'CASH' && paymentData.amountReceived) {
                console.log('🟡 POS Page: Validating cash payment');
                console.log('🟡 POS Page: Amount received:', paymentData.amountReceived);
                console.log('🟡 POS Page: Total needed:', calculatedTotal);

                if (paymentData.amountReceived < calculatedTotal) {
                    console.error('🔴 POS Page: Insufficient amount received');
                    toast.error('Insufficient amount received');
                    setProcessingPayment(false);
                    return;
                }
            }

            // Prepare sale data
            const saleData = {
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                customerInfo: {
                    name: paymentData.customerInfo?.name || 'Walk-in Customer',
                    email: paymentData.customerInfo?.email,
                    phone: paymentData.customerInfo?.phone,
                },
                paymentMethod: paymentData.paymentMethod,
                amountReceived: paymentData.amountReceived,
                subtotal: calculatedSubtotal,
                tax: tax,
                total: calculatedTotal,
                employeeId: currentEmployee?.user?.id,
            };

            console.log('🟡 POS Page: Sending sale data to API:', saleData);

            // Create sale
            const result = await createSale(saleData);
            console.log('🟡 POS Page: createSale result:', result);

            if (!result.success) {
                console.error('🔴 POS Page: createSale failed:', result.error);
                toast.error(result.error || 'Failed to process payment');
                setProcessingPayment(false);
                return;
            }

            // Calculate change for cash payments
            const changeAmount = paymentData.paymentMethod === 'CASH' && paymentData.amountReceived
                ? paymentData.amountReceived - calculatedTotal
                : 0;

            console.log('🟡 POS Page: Change amount:', changeAmount);

            // Create receipt
            const receipt: Receipt = {
                saleNumber: result.saleId || `SALE-${Date.now()}`,
                date: new Date().toISOString(),
                cashier: `${currentEmployee?.user?.firstName} ${currentEmployee?.user?.lastName}`,
                store: currentStore?.name || 'Main Store',
                paymentMethod: paymentData.paymentMethod,
                amountReceived: paymentData.amountReceived,
                changeAmount: changeAmount,
                items: cart.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    discount: item.discount || 0,
                    subtotal: (item.product.price * item.quantity) - (item.discount || 0),
                })),
                subtotal: calculatedSubtotal,
                totalDiscount: totalDiscount,
                total: calculatedTotal,
            };

            console.log('🟡 POS Page: Receipt created:', receipt);

            // Print receipt if print data is available
            if (result.receipt) {
                try {
                    console.log('🟡 POS Page: Printing receipt from API response');
                    const printResult = await printReceipt(result.receipt);
                    console.log('🟡 POS Page: printReceipt result:', printResult);
                    if (printResult.success) {
                        toast.success('Payment processed and receipt printed!');
                    } else {
                        toast.warning('Payment processed but receipt printing failed');
                    }
                } catch (printError) {
                    console.error('🔴 POS Page: Print error:', printError);
                    toast.success('Payment processed (printing failed)');
                }
            } else {
                // Fallback: print the receipt we created
                console.log('🟡 POS Page: Using fallback printing');
                try {
                    const printData = {
                        orderId: receipt.saleNumber,
                        items: receipt.items.map(item => ({
                            name: item.productName,
                            price: item.price,
                            qty: item.quantity,
                            total: item.subtotal,
                        })),
                        subtotal: receipt.subtotal,
                        tax: 0,
                        total: receipt.total,
                        customerName: paymentData.customerInfo?.name || 'Walk-in Customer',
                        paymentMethod: receipt.paymentMethod,
                        branch: {
                            name: receipt.store,
                            location: currentStore?.location || 'N/A',
                            phone: currentStore?.phone || '',
                        },
                        cashier: receipt.cashier,
                        timestamp: receipt.date,
                    };

                    console.log('🟡 POS Page: Fallback print data:', printData);
                    await printReceipt(printData);
                    toast.success('Payment processed and receipt printed!');
                } catch (printError) {
                    console.error('🔴 POS Page: Fallback print error:', printError);
                    toast.success('Payment processed successfully!');
                }
            }

            // Save receipt and clear cart
            console.log('🟡 POS Page: Saving receipt and clearing cart');
            setCurrentReceipt(receipt);
            clearCart();
            closePaymentDialog();
            setShowReceipt(true);

            console.log('🟢 POS Page: Payment processing completed successfully');

        } catch (error: any) {
            console.error('🔴 POS Page: Payment processing error:', error);
            console.error('🔴 POS Page: Error stack:', error.stack);
            toast.error(error.message || 'Failed to process payment');
        } finally {
            console.log('🟡 POS Page: Finally block - setting processing to false');
            setProcessingPayment(false);
        }
    };

    const handleReprintReceipt = async () => {
        if (!currentReceipt) return;

        try {
            const receiptData = {
                orderId: currentReceipt.saleNumber,
                items: currentReceipt.items.map(item => ({
                    name: item.productName,
                    price: item.price,
                    qty: item.quantity,
                    total: item.subtotal,
                })),
                subtotal: currentReceipt.subtotal,
                tax: 0, // You can calculate this if needed
                total: currentReceipt.total,
                customerName: 'Walk-in Customer',
                paymentMethod: currentReceipt.paymentMethod,
                branch: {
                    name: currentReceipt.store,
                    location: currentStore?.location || 'N/A',
                    phone: '',
                },
                cashier: currentReceipt.cashier,
                timestamp: currentReceipt.date,
            };

            const result = await printReceipt(receiptData);
            if (result.success) {
                toast.success('Receipt reprinted successfully!');
            } else {
                toast.error(result.error || 'Failed to reprint receipt');
            }
        } catch (error: any) {
            console.error('Reprint error:', error);
            toast.error(error.message || 'Failed to reprint receipt');
        }
    };

    const categories = [
        { value: 'all', label: 'All Products' },
        { value: 'TIRE', label: 'Tires' },
        { value: 'BALE', label: 'Bales' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Point of Sale</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            <span>{currentStore?.name || 'Select Store'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{currentEmployee?.user?.firstName} {currentEmployee?.user?.lastName}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowReceipt(true)}
                        disabled={!currentReceipt}
                    >
                        <Receipt className="w-4 h-4 mr-2" />
                        View Last Receipt
                    </Button>
                    <Button
                        variant="outline"
                        onClick={loadProducts}
                    >
                        Refresh Products
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Products */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                                <TabsList className="grid w-full grid-cols-3">
                                    {categories.map(category => (
                                        <TabsTrigger key={category.value} value={category.value}>
                                            {category.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading products...
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No products found</p>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm ? 'Try a different search term' : 'No products available'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                                    {filteredProducts.map(product => (
                                        <Card
                                            key={product.id}
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => addToCart(product, 1)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-semibold">{product.name || 'Unnamed Product'}</h3>
                                                        <Badge variant={product.quantity > 0 ? 'default' : 'destructive'}>
                                                            {product.quantity ?? 0} in stock
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{product.type || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span>Grade {product.grade || 'N/A'}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {product.commodity || 'No commodity'}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(product, 1);
                                                            }}
                                                            disabled={product.quantity === 0}
                                                        >
                                                            <Plus className="w-4 h-4 mr-1" />
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Cart */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Shopping Cart
                                </div>
                                {cart.length > 0 && (
                                    <Badge variant="secondary">{cart.length} items</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground mb-1">Your cart is empty</p>
                                    <p className="text-sm text-muted-foreground">
                                        Add products from the list to get started
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                                        {cart.map((item: CartItem) => (
                                            <div key={item.id} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{item.product.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatCurrency(item.product.price)} each
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.product.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => decreaseQuantity(item.product.id)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="w-8 text-center">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => increaseQuantity(item.product.id)}
                                                            disabled={item.quantity >= item.product.quantity}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            {formatCurrency(item.product.price * item.quantity)}
                                                        </p>
                                                        {item.discount > 0 && (
                                                            <p className="text-sm text-green-600">
                                                                -{formatCurrency(item.discount)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cart Summary */}
                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-{formatCurrency(totalDiscount)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Total</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>

                                    {/* Cart Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            className="flex-1"
                                            onClick={openPaymentDialog}
                                            disabled={processingPayment}
                                        >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            {processingPayment ? 'Processing...' : 'Process Payment'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={clearCart}
                                            disabled={processingPayment}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Receipt Dialog */}
            {showReceipt && currentReceipt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Order Receipt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order #:</span>
                                    <span className="font-mono">{currentReceipt.saleNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span>{new Date(currentReceipt.date).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cashier:</span>
                                    <span>{currentReceipt.cashier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Store:</span>
                                    <span>{currentReceipt.store}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Method:</span>
                                    <span>{currentReceipt.paymentMethod}</span>
                                </div>
                                {currentReceipt.amountReceived && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Amount Received:</span>
                                            <span>{formatCurrency(currentReceipt.amountReceived)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Change:</span>
                                            <span>{formatCurrency(currentReceipt.changeAmount || 0)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Items:</h3>
                                <div className="space-y-3">
                                    {currentReceipt.items.map((item: ReceiptItem, index: number) => (
                                        <div key={index} className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>{item.productName} × {item.quantity}</span>
                                                <span>{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                            {item.discount > 0 && (
                                                <div className="flex justify-between text-green-600 text-xs">
                                                    <span>Discount</span>
                                                    <span>-{formatCurrency(item.discount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-medium">
                                                <span>Subtotal</span>
                                                <span>{formatCurrency(item.subtotal)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(currentReceipt.subtotal)}</span>
                                </div>
                                {currentReceipt.totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Total Discount:</span>
                                        <span>-{formatCurrency(currentReceipt.totalDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(currentReceipt.total)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleReprintReceipt}
                                >
                                    <Receipt className="w-4 h-4 mr-2" />
                                    Reprint
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => setShowReceipt(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Payment Dialog */}
            <PaymentDialog
                open={isPaymentDialogVisible}
                onOpenChange={closePaymentDialog}
                total={total}
                cart={cart}
                onPaymentSuccess={handleProcessPayment}
                store={currentStore}
                cashier={`${currentEmployee?.user?.firstName} ${currentEmployee?.user?.lastName}`}
                employeeId={currentEmployee?.user?.id}
                processing={processingPayment}
            />
        </div>
    );
}