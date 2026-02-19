// components/checkout/payment-success-modal.tsx
"use client"

import {
    CheckCircle,
    Download,
    Mail,
    Printer,
    Share2,
    Truck,
    Home,
    ShoppingBag,
    Clock,
    MapPin,
    Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface PaymentSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    orderDetails: {
        orderId: string
        total: number
        paymentMethod: string
        estimatedDelivery: string
        items: Array<{
            name: string
            quantity: number
            price: number
            image: string
        }>
        shippingAddress: string
        customerEmail: string
    }
}

export default function PaymentSuccessModal({ isOpen, onClose, orderDetails }: PaymentSuccessModalProps) {
    const handlePrint = () => {
        window.print()
    }

    const handleShare = () => {
        const text = `I just ordered from TD Holdings! Order ID: ${orderDetails.orderId}`
        if (navigator.share) {
            navigator.share({
                title: 'My TD Holdings Order',
                text: text,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(text)
            alert('Order details copied to clipboard!')
        }
    }

    const sendEmailConfirmation = () => {
        alert('Email confirmation sent!')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#1b2358]">Payment Successful!</h2>
                                <p className="text-gray-600">Thank you for your order</p>
                            </div>
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Order #{orderDetails.orderId} has been confirmed
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-[#1b2358]">Order Summary</h3>
                            <Badge className="bg-green-500 hover:bg-green-600">
                                Paid
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {orderDetails.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xl">{item.image}</div>
                                        <div>
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="font-medium">
                                        LSL {(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Paid</span>
                            <span className="text-[#1b2358]">LSL {orderDetails.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Truck className="w-6 h-6 text-blue-600" />
                                <h4 className="font-bold text-[#1b2358]">Delivery</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                Estimated delivery: <span className="font-medium">{orderDetails.estimatedDelivery}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {orderDetails.shippingAddress}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="w-6 h-6 text-green-600" />
                                <h4 className="font-bold text-[#1b2358]">Processing</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                Your order is being processed and will ship soon
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                <Clock className="w-3 h-3" />
                                Usually ships within 24 hours
                            </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <ShoppingBag className="w-6 h-6 text-purple-600" />
                                <h4 className="font-bold text-[#1b2358]">Tracking</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                You'll receive tracking information via email
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {orderDetails.customerEmail}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" onClick={handleShare}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" onClick={sendEmailConfirmation}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email Receipt
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>

                    {/* Continue Shopping */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-gray-600 mb-4">
                            A confirmation email has been sent to {orderDetails.customerEmail}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/account/orders">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    View Order Status
                                </Button>
                            </Link>
                            <Link href="/products">
                                <Button className="bg-[#1b2358] hover:bg-[#151d4a] w-full sm:w-auto">
                                    <Home className="w-4 h-4 mr-2" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}