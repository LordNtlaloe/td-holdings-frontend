"use client"

import { useState, useEffect } from 'react'
import {
    Lock,
    CreditCard,
    Phone,
    MapPin,
    User,
    Mail,
    Truck,
    Shield,
    Check,
    AlertCircle,
    ChevronLeft,
    Eye,
    EyeOff,
    Package,
    Timer,
    Building,
    ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePos } from '@/contexts/cart-context'

export default function CheckoutPage() {
    const router = useRouter()
    const [paymentMethod, setPaymentMethod] = useState('mpesa')
    const [showPassword, setShowPassword] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [deliveryOption, setDeliveryOption] = useState('standard')

    // Get cart data from context
    const {
        cart,
        discount,
        calculateTotals,
        isLoading // Add loading state
    } = usePos()

    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: 'Maseru',
        district: '',
        postalCode: '',
        notes: ''
    })

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        mpesaNumber: '+266 '
    })

    // Redirect if cart is empty - but wait for loading to complete
    useEffect(() => {
        if (!isLoading && cart.length === 0) {
            router.push('/cart')
        }
    }, [cart.length, isLoading, router])

    // Calculate order summary FROM ACTUAL CART
    const calculateOrderSummary = () => {
        // Use cart context data instead of hardcoded data
        const { subtotal, totalDiscount, total } = calculateTotals()

        // Shipping costs based on delivery option
        const shipping = deliveryOption === 'standard' ? 0 :
            deliveryOption === 'express' ? 99.99 : 199.99

        const tax = (subtotal - totalDiscount) * 0.15
        const finalTotal = total + shipping + tax

        return {
            subtotal,
            discount: totalDiscount,
            shipping,
            tax,
            total: finalTotal
        }
    }

    const orderSummary = calculateOrderSummary()

    const districts = [
        'Maseru', 'Berea', 'Leribe', 'Butha-Buthe', 'Mokhotlong',
        'Qacha\'s Nek', 'Quthing', 'Mafeteng', 'Mohale\'s Hoek', 'Thaba-Tseka'
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        try {
            // Create order data
            const orderData = {
                customer: shippingInfo,
                payment: paymentInfo,
                paymentMethod,
                deliveryOption,
                items: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || item.product.basePrice,
                    total: (item.unitPrice || item.product.basePrice) * item.quantity
                })),
                orderSummary: calculateOrderSummary(),
                orderDate: new Date().toISOString(),
                orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }

            // Save order data to localStorage
            localStorage.setItem('lastOrder', JSON.stringify(orderData))

            // Clear cart after successful order
            // usePos.clearCar

            // Navigate to confirmation page with order data
            router.push(`/checkout/success?orderId=${orderData.orderId}`)

        } catch (error) {
            console.error('Checkout error:', error)
            setIsProcessing(false)
        }
    }
    const validateForm = () => {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city']
        return requiredFields.every(field => shippingInfo[field as keyof typeof shippingInfo]?.trim())
    }

    // Show loading while cart data is being loaded
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b2358] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your cart...</p>
                </div>
            </div>
        )
    }

    // Show empty cart message
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1b2358] mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Add some items to your cart before proceeding to checkout
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/products">
                                <Button className="bg-[#1b2358] hover:bg-[#151d4a] px-8">
                                    Continue Shopping
                                </Button>
                            </Link>
                            <Link href="/cart">
                                <Button variant="outline" className="px-8">
                                    View Cart
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center w-full max-w-2xl">
                            <Link href="/cart" className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                                    1
                                </div>
                                <span className="text-sm font-medium mt-2 text-gray-400">Cart</span>
                            </Link>

                            <div className="flex-1 h-1 bg-gray-200 mx-4">
                                <div className="h-full bg-[#1b2358] w-full"></div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#1b2358] text-white flex items-center justify-center">
                                    2
                                </div>
                                <span className="text-sm font-medium mt-2">Checkout</span>
                            </div>

                            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>

                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-300 flex items-center justify-center">
                                    3
                                </div>
                                <span className="text-sm text-gray-400 mt-2">Confirmation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1b2358]">Secure Checkout</h1>
                        <p className="text-gray-600">Complete your order in 3 simple steps</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Contact & Shipping */}
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <User className="w-5 h-5 text-[#1b2358]" />
                                            <h2 className="text-xl font-bold text-[#1b2358]">Contact & Shipping Details</h2>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name *</Label>
                                                <Input
                                                    id="firstName"
                                                    placeholder="John"
                                                    value={shippingInfo.firstName}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name *</Label>
                                                <Input
                                                    id="lastName"
                                                    placeholder="Farmer"
                                                    value={shippingInfo.lastName}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={shippingInfo.email}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+266 1234 5678"
                                                    value={shippingInfo.phone}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="address">Street Address *</Label>
                                            <Input
                                                id="address"
                                                placeholder="123 Farm Road, Ha Thetsane"
                                                value={shippingInfo.address}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City/Town *</Label>
                                                <Input
                                                    id="city"
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="district">District</Label>
                                                <select
                                                    id="district"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={shippingInfo.district}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                                                >
                                                    <option value="">Select District</option>
                                                    {districts.map(district => (
                                                        <option key={district} value={district}>{district}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode">Postal Code</Label>
                                                <Input
                                                    id="postalCode"
                                                    placeholder="100"
                                                    value={shippingInfo.postalCode}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                                            <Textarea
                                                id="notes"
                                                value={shippingInfo.notes}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                                                placeholder="Gate code, landmarks, safe place if not home..."
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Delivery Options */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Truck className="w-5 h-5 text-[#1b2358]" />
                                            <h2 className="text-xl font-bold text-[#1b2358]">Delivery Options</h2>
                                        </div>

                                        <RadioGroup
                                            value={deliveryOption}
                                            onValueChange={setDeliveryOption}
                                            className="space-y-3"
                                        >
                                            <div className={`border rounded-lg p-4 cursor-pointer ${deliveryOption === 'standard' ? 'border-[#1b2358] bg-blue-50' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value="standard" id="standard" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Label htmlFor="standard" className="font-medium text-base">
                                                                Standard Delivery
                                                            </Label>
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                FREE
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600">3-5 business days • Tracked</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <Timer className="w-3 h-3 inline mr-1" />
                                                            Best for non-urgent farm supplies
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`border rounded-lg p-4 cursor-pointer ${deliveryOption === 'express' ? 'border-[#1b2358] bg-blue-50' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value="express" id="express" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <Label htmlFor="express" className="font-medium text-base">
                                                                Express Delivery
                                                            </Label>
                                                            <div className="font-bold text-[#1b2358]">LSL 99.99</div>
                                                        </div>
                                                        <p className="text-sm text-gray-600">1-2 business days • Priority</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <Timer className="w-3 h-3 inline mr-1" />
                                                            Recommended for urgent tire replacements
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`border rounded-lg p-4 cursor-pointer ${deliveryOption === 'same-day' ? 'border-[#1b2358] bg-blue-50' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value="same-day" id="same-day" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <Label htmlFor="same-day" className="font-medium text-base">
                                                                Same-Day Delivery
                                                            </Label>
                                                            <div className="font-bold text-[#1b2358]">LSL 199.99</div>
                                                        </div>
                                                        <p className="text-sm text-gray-600">Order before 2PM • Maseru only</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <Timer className="w-3 h-3 inline mr-1" />
                                                            For emergency agricultural needs
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </CardContent>
                                </Card>

                                {/* Payment Method */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <CreditCard className="w-5 h-5 text-[#1b2358]" />
                                            <h2 className="text-xl font-bold text-[#1b2358]">Payment Method</h2>
                                        </div>

                                        <RadioGroup
                                            value={paymentMethod}
                                            onValueChange={setPaymentMethod}
                                            className="space-y-4"
                                        >
                                            {/* M-Pesa (Primary for Lesotho) */}
                                            <div className={`border rounded-lg p-4 ${paymentMethod === 'mpesa' ? 'border-[#FBB320] bg-yellow-50' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value="mpesa" id="mpesa" className="border-[#FBB320] text-[#FBB320]" />
                                                    <Label htmlFor="mpesa" className="font-medium flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <Phone className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        M-Pesa Mobile Money
                                                    </Label>
                                                    <div className="ml-auto">
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            Popular in Lesotho
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {paymentMethod === 'mpesa' && (
                                                    <div className="space-y-4 pl-11 mt-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="mpesaNumber">M-Pesa Number *</Label>
                                                            <Input
                                                                id="mpesaNumber"
                                                                placeholder="+266 1234 5678"
                                                                value={paymentInfo.mpesaNumber}
                                                                onChange={(e) => setPaymentInfo({ ...paymentInfo, mpesaNumber: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="p-3 bg-green-50 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                                <p className="text-sm text-green-700">
                                                                    You will receive a USSD prompt on your phone to confirm payment.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Credit Card */}
                                            <div className={`border rounded-lg p-4 ${paymentMethod === 'credit-card' ? 'border-[#1b2358] bg-blue-50' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value="credit-card" id="credit-card" />
                                                    <Label htmlFor="credit-card" className="font-medium flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        Credit/Debit Card
                                                    </Label>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Visa</div>
                                                        <div className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">M/C</div>
                                                    </div>
                                                </div>

                                                {paymentMethod === 'credit-card' && (
                                                    <div className="space-y-4 pl-11 mt-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="cardNumber">Card Number *</Label>
                                                            <Input
                                                                id="cardNumber"
                                                                placeholder="1234 5678 9012 3456"
                                                                value={paymentInfo.cardNumber}
                                                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="cardName">Name on Card *</Label>
                                                            <Input
                                                                id="cardName"
                                                                placeholder="John Farmer"
                                                                value={paymentInfo.cardName}
                                                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="expiryDate">Expiry Date *</Label>
                                                                <Input
                                                                    id="expiryDate"
                                                                    placeholder="MM/YY"
                                                                    value={paymentInfo.expiryDate}
                                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="cvv">CVV *</Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        id="cvv"
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="123"
                                                                        value={paymentInfo.cvv}
                                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                                                                        className="pr-10"
                                                                        required
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                    >
                                                                        {showPassword ? (
                                                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                                                        ) : (
                                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Cash on Delivery */}
                                            <div className={`border rounded-lg p-4 ${paymentMethod === 'cod' ? 'border-[#1b2358] bg-blue-50' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value="cod" id="cod" />
                                                    <Label htmlFor="cod" className="font-medium flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <Building className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                        Cash on Delivery
                                                    </Label>
                                                    <div className="ml-auto">
                                                        <Badge variant="outline" className="text-gray-600">
                                                            +LSL 20 fee
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {paymentMethod === 'cod' && (
                                                    <div className="pl-11 mt-4">
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-sm text-gray-700">
                                                                Pay with cash when your order arrives. An additional LSL 20 handling fee applies.
                                                                Available only in major towns.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </RadioGroup>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column - Order Summary & Checkout */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Package className="w-5 h-5 text-[#1b2358]" />
                                        <h2 className="text-xl font-bold text-[#1b2358]">Order Summary</h2>
                                    </div>

                                    {/* Order Items Preview - USING REAL CART DATA */}
                                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-start gap-3 pb-3 border-b">
                                                <div className="text-2xl bg-gray-100 p-2 rounded-lg">
                                                    {item.product.type === 'TIRE' ? '🚗' : '🌾'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs h-5">
                                                            {item.product.type === 'TIRE' ? 'Tire' : 'Bale'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">×{item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium whitespace-nowrap">
                                                    LSL {((item.unitPrice || item.product.basePrice) * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="mb-6" />

                                    {/* Price Breakdown - USING REAL CALCULATIONS */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal ({cart.length} items)</span>
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
                                            <span className="font-medium">
                                                {orderSummary.shipping === 0
                                                    ? 'FREE'
                                                    : `LSL ${orderSummary.shipping.toFixed(2)}`
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">VAT (15%)</span>
                                            <span className="font-medium">LSL {orderSummary.tax.toFixed(2)}</span>
                                        </div>

                                        {paymentMethod === 'cod' && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>COD Fee</span>
                                                <span className="font-medium">+LSL 20.00</span>
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="mb-6" />

                                    {/* Total */}
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <span className="text-lg font-bold text-[#1b2358]">Total</span>
                                            <p className="text-sm text-gray-500">Including VAT</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[#1b2358]">
                                                LSL {orderSummary.total.toFixed(2)}
                                            </div>
                                            {orderSummary.shipping === 0 && (
                                                <div className="text-sm text-green-600">Free shipping applied</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Secure Checkout Button */}
                                    <Button
                                        type="submit"
                                        disabled={isProcessing || !validateForm()}
                                        className={`w-full h-14 text-lg mb-6 ${!validateForm()
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#1b2358] hover:bg-[#151d4a]'
                                            }`}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                                                Processing Payment...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <Lock className="w-5 h-5 mr-3" />
                                                Pay Securely
                                                <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
                                            </span>
                                        )}
                                    </Button>

                                    {/* Security Badges */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <div>
                                                <p className="text-xs font-medium">SSL Secure</p>
                                                <p className="text-xs text-gray-500">256-bit</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Check className="w-4 h-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs font-medium">Guaranteed</p>
                                                <p className="text-xs text-gray-500">30-day return</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Need Help */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-bold text-[#1b2358] mb-3">Need Help?</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Phone className="w-4 h-4 text-[#1b2358]" />
                                                <div>
                                                    <p className="text-sm font-medium">Call Our Farm Experts</p>
                                                    <p className="text-sm text-gray-600">+266 1234 5678</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Mail className="w-4 h-4 text-[#1b2358]" />
                                                <div>
                                                    <p className="text-sm font-medium">Email Support</p>
                                                    <p className="text-sm text-gray-600">support@TD Holdings.com</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Back to Cart */}
                            <div className="mt-6">
                                <Link href="/cart">
                                    <Button variant="outline" className="w-full">
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Cart
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}