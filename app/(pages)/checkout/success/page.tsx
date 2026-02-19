"use client"

import { useState, useEffect } from 'react'
import {
    CheckCircle,
    Truck,
    Package,
    Shield,
    Printer,
    Download,
    Home,
    ShoppingBag,
    MapPin,
    Clock,
    Mail,
    Phone,
    CreditCard,
    Share2,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface OrderItem {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    total: number
}

interface ShippingInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    district: string
    postalCode: string
    notes: string
}

interface OrderSummary {
    subtotal: number
    discount: number
    shipping: number
    tax: number
    total: number
}

interface OrderData {
    orderId: string
    orderDate: string
    customer: ShippingInfo
    payment: any
    paymentMethod: string
    deliveryOption: string
    items: OrderItem[]
    orderSummary: OrderSummary
}

export default function ConfirmationPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [order, setOrder] = useState<OrderData | null>(null)
    const [isPrinting, setIsPrinting] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds

    const orderId = searchParams.get('orderId')

    // Load order data from localStorage
    useEffect(() => {
        const savedOrder = localStorage.getItem('lastOrder')
        if (savedOrder) {
            try {
                const orderData: OrderData = JSON.parse(savedOrder)

                // Only use the order if the orderId matches
                if (orderId === orderData.orderId) {
                    setOrder(orderData)
                } else {
                    // If orderId doesn't match, try to find by orderId
                    const allOrders = localStorage.getItem('orderHistory')
                    if (allOrders) {
                        const orders: OrderData[] = JSON.parse(allOrders)
                        const foundOrder = orders.find(o => o.orderId === orderId)
                        if (foundOrder) {
                            setOrder(foundOrder)
                        } else {
                            // Redirect if no order found
                            router.push('/checkout')
                        }
                    } else {
                        router.push('/checkout')
                    }
                }
            } catch (error) {
                console.error('Error loading order:', error)
                router.push('/checkout')
            }
        } else {
            // No order data found, redirect to checkout
            router.push('/checkout')
        }
    }, [orderId, router])

    // Countdown timer for order editing
    useEffect(() => {
        if (timeLeft <= 0) return

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft])

    const handlePrintReceipt = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setIsPrinting(false)
        }, 500)
    }

    const handleDownloadInvoice = () => {
        setIsDownloading(true)
        // In a real app, generate and download PDF
        setTimeout(() => {
            alert('Invoice downloaded successfully!')
            setIsDownloading(false)
        }, 1000)
    }

    const handleShareOrder = () => {
        if (navigator.share) {
            navigator.share({
                title: `Order Confirmation: ${order?.orderId}`,
                text: `I just placed an order at TD Holdings! Order #${order?.orderId}`,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getEstimatedDelivery = () => {
        const orderDate = order ? new Date(order.orderDate) : new Date()
        const deliveryDays = order?.deliveryOption === 'express' ? 2 :
            order?.deliveryOption === 'same-day' ? 0 : 5
        const deliveryDate = new Date(orderDate)
        deliveryDate.setDate(deliveryDate.getDate() + deliveryDays)

        return deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        })
    }

    const getShippingCost = () => {
        if (!order) return 0
        return order.deliveryOption === 'standard' ? 0 :
            order.deliveryOption === 'express' ? 99.99 : 199.99
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#1b2358] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your order confirmation...</p>
                </div>
            </div>
        )
    }

    const { customer, items, orderSummary } = order
    const estimatedDelivery = getEstimatedDelivery()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b print:hidden">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center w-full max-w-2xl">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                                    1
                                </div>
                                <span className="text-sm font-medium mt-2 text-gray-400">Cart</span>
                            </div>

                            <div className="flex-1 h-1 bg-gray-200 mx-4">
                                <div className="h-full bg-[#1b2358] w-full"></div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                                    2
                                </div>
                                <span className="text-sm font-medium mt-2 text-gray-400">Checkout</span>
                            </div>

                            <div className="flex-1 h-1 bg-gray-200 mx-4">
                                <div className="h-full bg-[#1b2358] w-full"></div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#1b2358] text-white flex items-center justify-center">
                                    3
                                </div>
                                <span className="text-sm font-medium mt-2">Confirmation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 print:py-2">
                {/* Success Header */}
                <div className="text-center mb-10 print:mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1b2358] mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-4">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Order #{order.orderId}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Paid
                        </Badge>
                        <Badge className="bg-[#FBB320] text-[#1b2358] hover:bg-[#FBB320]">
                            {items.length} items
                        </Badge>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 print:grid-cols-1">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-8 print:space-y-6">
                        {/* Order Timeline */}
                        <Card className="print:shadow-none">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-[#1b2358] mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Order Timeline
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="w-0.5 h-12 bg-green-200 mt-1"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-[#1b2358]">Order Confirmed</h3>
                                                <span className="text-sm text-gray-500">Just now</span>
                                            </div>
                                            <p className="text-gray-600">Payment received and order confirmed</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Package className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-gray-700">Processing</h3>
                                                <span className="text-sm text-gray-500">Expected today</span>
                                            </div>
                                            <p className="text-gray-500">Preparing your items for dispatch</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Truck className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-gray-500">Shipped</h3>
                                                <span className="text-sm text-gray-400">Estimated {estimatedDelivery}</span>
                                            </div>
                                            <p className="text-gray-400">Will be shipped via {order.deliveryOption === 'express' ? 'Express' : 'Standard'} Delivery</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Window Notice */}
                                {timeLeft > 0 && (
                                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-medium text-yellow-800">Quick Edit Window</h3>
                                                    <div className="font-mono font-bold text-yellow-700">
                                                        {formatTime(timeLeft)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-yellow-700">
                                                    You can still modify your order within {formatTime(timeLeft)} minutes.
                                                    Contact support immediately if you need to make changes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card className="print:shadow-none">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-[#1b2358] mb-6">Order Details</h2>

                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                                            <div className="text-3xl bg-gray-100 p-3 rounded-lg">
                                                {/* Simple icon based on product name */}
                                                {item.productName.toLowerCase().includes('tire') ? '🚗' : '🌾'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-[#1b2358]">{item.productName}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className={
                                                                item.productName.toLowerCase().includes('tire')
                                                                    ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                                                                    : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                                                            }>
                                                                {item.productName.toLowerCase().includes('tire') ? 'Tire' : 'Bale'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-[#1b2358]">
                                                            LSL {item.total.toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            LSL {item.unitPrice.toFixed(2)} × {item.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-6" />

                                {/* Price Summary */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">LSL {orderSummary.subtotal.toFixed(2)}</span>
                                    </div>
                                    {orderSummary.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span className="font-medium">-LSL {orderSummary.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium text-green-600">
                                            {orderSummary.shipping === 0 ? 'FREE' : `LSL ${orderSummary.shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">VAT (15%)</span>
                                        <span className="font-medium">LSL {orderSummary.tax.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-[#1b2358]">LSL {orderSummary.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping & Payment Info */}
                        <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
                            <Card className="print:shadow-none">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-[#1b2358]" />
                                        <h3 className="font-bold text-[#1b2358]">Shipping Address</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                                        <p className="text-gray-600">{customer.address}</p>
                                        <p className="text-gray-600">{customer.city}, {customer.district || 'Lesotho'}</p>
                                        {customer.postalCode && (
                                            <p className="text-gray-600">Postal Code: {customer.postalCode}</p>
                                        )}
                                        <div className="pt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4" />
                                                <span>{customer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4" />
                                                <span>{customer.email}</span>
                                            </div>
                                        </div>
                                        {customer.notes && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-sm font-medium text-gray-700">Delivery Instructions:</p>
                                                <p className="text-sm text-gray-600">{customer.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="print:shadow-none">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCard className="w-5 h-5 text-[#1b2358]" />
                                        <h3 className="font-bold text-[#1b2358]">Payment Details</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Payment Method</p>
                                            <p className="font-medium">
                                                {order.paymentMethod === 'mpesa' ? 'M-Pesa Mobile Money' :
                                                    order.paymentMethod === 'credit-card' ? 'Credit/Debit Card' :
                                                        'Cash on Delivery'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Payment Status</p>
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                Paid
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Order Date</p>
                                            <p className="font-medium">{new Date(order.orderDate).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Delivery Method</p>
                                            <p className="font-medium">
                                                {order.deliveryOption === 'standard' ? 'Standard Delivery' :
                                                    order.deliveryOption === 'express' ? 'Express Delivery' :
                                                        'Same-Day Delivery'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Actions & Next Steps */}
                    <div className="lg:col-span-1 print:hidden">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-[#1b2358] mb-6">Next Steps</h2>

                                {/* Action Buttons */}
                                <div className="space-y-3 mb-8">
                                    <Button
                                        onClick={handlePrintReceipt}
                                        className="w-full bg-white border border-[#1b2358] text-[#1b2358] hover:bg-[#1b2358] hover:text-white"
                                        disabled={isPrinting}
                                    >
                                        <Printer className="w-4 h-4 mr-2" />
                                        {isPrinting ? 'Printing...' : 'Print Receipt'}
                                    </Button>

                                    <Button
                                        onClick={handleDownloadInvoice}
                                        className="w-full bg-[#1b2358] hover:bg-[#151d4a]"
                                        disabled={isDownloading}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {isDownloading ? 'Downloading...' : 'Download Invoice (PDF)'}
                                    </Button>

                                    <Button
                                        onClick={handleShareOrder}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share Order Details
                                    </Button>
                                </div>

                                {/* Help & Support */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium text-blue-800 mb-1">Delivery Updates</h3>
                                                <p className="text-sm text-blue-700">
                                                    We'll send SMS updates to {customer.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium text-green-800 mb-1">Order Protection</h3>
                                                <p className="text-sm text-green-700">
                                                    30-day return policy & damage protection included
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-3">
                                            <h3 className="font-medium text-gray-800">Need Help?</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">Call Support</p>
                                                        <p className="text-gray-600">+266 1234 5678</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">Email Support</p>
                                                        <p className="text-gray-600">support@tdholdings.com</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Continue Shopping Buttons */}
                                <div className="mt-8 space-y-3">
                                    <Link href="/" className="block">
                                        <Button className="w-full">
                                            <Home className="w-4 h-4 mr-2" />
                                            Back to Homepage
                                        </Button>
                                    </Link>
                                    <Link href="/products" className="block">
                                        <Button variant="outline" className="w-full">
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            Continue Shopping
                                        </Button>
                                    </Link>
                                </div>

                                {/* Order Summary for Mobile/Quick View */}
                                <div className="mt-8 pt-8 border-t">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">Order Total</p>
                                        <p className="text-3xl font-bold text-[#1b2358]">
                                            LSL {orderSummary.total.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Includes LSL {orderSummary.tax.toFixed(2)} VAT
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Estimated Delivery Card */}
                        <Card className="mt-6 bg-linear-to-r from-[#1b2358] to-[#2a3478] text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Truck className="w-6 h-6" />
                                    <h3 className="text-lg font-bold">Estimated Delivery</h3>
                                </div>
                                <div className="text-center py-3">
                                    <p className="text-2xl font-bold mb-1">{estimatedDelivery}</p>
                                    <p className="text-sm opacity-90">
                                        {order.deliveryOption === 'standard' ? '3-5 business days' :
                                            order.deliveryOption === 'express' ? '1-2 business days' :
                                                'Same day (Maseru only)'}
                                    </p>
                                </div>
                                <div className="mt-4 text-sm opacity-90">
                                    <p className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        {order.deliveryOption === 'standard' ? 'Standard Shipping • Free' :
                                            order.deliveryOption === 'express' ? 'Express Shipping • LSL 99.99' :
                                                'Same-Day Delivery • LSL 199.99'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center text-gray-600 text-sm print:mt-8">
                    <p className="mb-2">
                        A confirmation email has been sent to <strong>{customer.email}</strong>
                    </p>
                    <p>
                        For any questions about your order, please reference order number{' '}
                        <strong className="font-mono">{order.orderId}</strong>
                    </p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:mb-6 {
                        margin-bottom: 1.5rem !important;
                    }
                    .print\\:py-2 {
                        padding-top: 0.5rem !important;
                        padding-bottom: 0.5rem !important;
                    }
                    .print\\:grid-cols-1 {
                        grid-template-columns: 1fr !important;
                    }
                    .print\\:grid-cols-2 {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .print\\:space-y-6 > * + * {
                        margin-top: 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    )
}