"use client"

import { useState, useEffect } from 'react'
import type { Metadata } from 'next'
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Truck,
    Shield,
    RotateCcw,
    ChevronRight,
    X,
    AlertCircle,
    Tag,
    Package,
    Heart,
    Clock,
    RefreshCw,
    Star,
    ShoppingBag,
    CreditCard,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePos } from '@/contexts/cart-context' // Updated import
import { Product, ProductGrade, ProductType } from '@/types'
import { toast } from 'sonner'

interface SavedItem {
    id: string
    product: Product
    quantity: number
    savedAt: string
}

interface ShippingOption {
    id: string
    name: string
    price: number
    estimatedDays: string
    icon: React.ReactNode
    description: string
}

interface RelatedProduct {
    id: string
    name: string
    price: number
    image: string
    rating: number
    reviewCount: number
}


export default function CartPage() {
    const {
        cart,
        discount,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        applyDiscount,
        removeDiscount,
        calculateTotals,
        getAvailableQuantity,
        getCartItemCount
    } = usePos() // Now using the correct context

    // Saved for later items (local storage only)
    const [savedItems, setSavedItems] = useState<SavedItem[]>([])
    const [promoCode, setPromoCode] = useState('')
    const [selectedShipping, setSelectedShipping] = useState<string>('standard')
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

    // Load saved items from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('agro-saved-items')
        if (saved) {
            try {
                setSavedItems(JSON.parse(saved))
            } catch (error) {
                console.error('Error loading saved items:', error)
            }
        }
    }, [])

    // Save items to localStorage when they change
    useEffect(() => {
        if (savedItems.length > 0) {
            localStorage.setItem('agro-saved-items', JSON.stringify(savedItems))
        } else {
            localStorage.removeItem('agro-saved-items')
        }
    }, [savedItems])

    const shippingOptions: ShippingOption[] = [
        {
            id: 'standard',
            name: 'Standard Shipping',
            price: 49.99,
            estimatedDays: '5-7 business days',
            icon: <Truck className="w-5 h-5" />,
            description: 'Economical delivery'
        },
        {
            id: 'express',
            name: 'Express Shipping',
            price: 99.99,
            estimatedDays: '2-3 business days',
            icon: <Clock className="w-5 h-5" />,
            description: 'Priority handling'
        },
        {
            id: 'free',
            name: 'Free Shipping',
            price: 0,
            estimatedDays: '7-10 business days',
            icon: <Package className="w-5 h-5" />,
            description: 'Free on orders over LSL 1000'
        }
    ]

    const handleSaveForLater = (product: Product) => {
        const savedItem: SavedItem = {
            id: product?.id,
            product,
            quantity: 1,
            savedAt: new Date().toISOString()
        }
        setSavedItems(prev => [...prev, savedItem])
        removeFromCart(product?.id)
        toast.success("Item saved for later")
    }

    const handleMoveToCart = (savedItem: SavedItem) => {
        addToCart(savedItem.product)
        setSavedItems(prev => prev.filter(item => item.id !== savedItem.id))
        toast.success("Item moved to cart")
    }

    const handleRemoveSavedItem = (id: string) => {
        setSavedItems(prev => prev.filter(item => item.id !== id))
        toast.info("Item removed from saved list")
    }

    const handleApplyPromoCode = () => {
        if (promoCode.toUpperCase() === 'AGRO10') {
            applyDiscount({ type: 'percentage', value: 10 })
            toast.success("Promo code applied: 10% discount")
        } else if (promoCode.toUpperCase() === 'FREESHIP') {
            setSelectedShipping('free')
            toast.success("Promo code applied: Free shipping")
        } else {
            toast.error("Invalid promo code")
        }
        setPromoCode('')
    }

    const handleSecureCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty")
            return
        }

        setIsCheckoutLoading(true)
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Navigate to checkout
        window.location.href = '/checkout'
        setIsCheckoutLoading(false)
    }

    const { subtotal, totalDiscount, total } = calculateTotals()
    const shippingPrice = selectedShipping === 'free' ? 0 :
        shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0
    const tax = (subtotal - totalDiscount) * 0.15
    const finalTotal = total + shippingPrice + tax

    if (cart.length === 0 && savedItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1b2358] mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Add some quality tires or farm bales to get started
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/products">
                                <Button className="bg-[#1b2358] hover:bg-[#151d4a] px-8">
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Shop Products
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="px-8">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    View Special Offers
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
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1b2358] mb-2">Shopping Cart</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            <span>{getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} in cart</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-[#FBB320]" />
                            <span>{savedItems.length} saved item{savedItems.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Cart Items & Features */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="cart" className="mb-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="cart" className="data-[state=active]:bg-[#1b2358]">
                                    Cart Items ({cart.length})
                                </TabsTrigger>
                                <TabsTrigger value="saved" className="data-[state=active]:bg-[#FBB320] data-[state=active]:text-[#1b2358]">
                                    Saved for Later ({savedItems.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="cart">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-[#1b2358]">Cart Items</h2>
                                    {cart.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            onClick={clearCart}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Clear Cart
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {cart.map((item) => {
                                        const availableQuantity = getAvailableQuantity(item.product)
                                        const unitPrice = item.unitPrice || item.product?.basePrice

                                        return (
                                            <Card key={item.id}>
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row gap-6">
                                                        {/* Product Image/Icon */}
                                                        <div className="flex items-center justify-center w-full md:w-32 h-32 bg-gray-100 rounded-lg">
                                                            <div className="text-5xl">
                                                                {item.product?.type === 'TIRE' ? '🚗' : '🌾'}
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h3 className="font-bold text-[#1b2358]">{item.product?.name}</h3>
                                                                        <Badge className={
                                                                            item.product?.type === 'TIRE'
                                                                                ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                                                                                : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                                                                        }>
                                                                            {item.product?.type === 'TIRE' ? 'Tire' : 'Bale'}
                                                                        </Badge>
                                                                        <Badge variant="outline" className={
                                                                            availableQuantity > 0
                                                                                ? 'border-green-500 text-green-600'
                                                                                : 'border-red-500 text-red-600'
                                                                        }>
                                                                            {availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                                        </Badge>
                                                                    </div>

                                                                    {item.product?.description && (
                                                                        <p className="text-sm text-gray-600 mb-2">{item.product?.description}</p>
                                                                    )}

                                                                    {item.product?.grade && (
                                                                        <p className="text-sm text-gray-600">Grade: {item.product?.grade}</p>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleSaveForLater(item.product)}
                                                                        className="text-gray-400 hover:text-[#FBB320]"
                                                                        title="Save for later"
                                                                    >
                                                                        <Heart className="w-5 h-5" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeFromCart(item.product?.id)}
                                                                        className="text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <X className="w-5 h-5" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Price & Quantity */}
                                                            <div className="flex items-center justify-between mt-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center border rounded-lg">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => decreaseQuantity(item.product?.id)}
                                                                            className="h-8 w-8"
                                                                            disabled={item.quantity <= 1}
                                                                        >
                                                                            <Minus className="w-3 h-3" />
                                                                        </Button>
                                                                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => increaseQuantity(item.product?.id)}
                                                                            className="h-8 w-8"
                                                                            disabled={item.quantity >= availableQuantity}
                                                                        >
                                                                            <Plus className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                    {item.quantity >= availableQuantity && availableQuantity > 0 && (
                                                                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            <span>Only {availableQuantity} available</span>
                                                                        </div>
                                                                    )}
                                                                    {availableQuantity === 0 && (
                                                                        <div className="flex items-center gap-1 text-sm text-red-600">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            <span>Out of stock</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="text-right">
                                                                    <div className="text-xl font-bold text-[#1b2358]">
                                                                        LSL {(unitPrice * item.quantity).toFixed(2)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        LSL {unitPrice} each
                                                                    </div>
                                                                    {item.discount > 0 && (
                                                                        <div className="text-sm text-green-600">
                                                                            -LSL {item.discount.toFixed(2)} discount
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </TabsContent>

                            <TabsContent value="saved">
                                <div className="mb-4">
                                    <h2 className="text-lg font-bold text-[#1b2358] mb-2">Saved for Later</h2>
                                    <p className="text-gray-600">Items you've saved to purchase later</p>
                                </div>

                                {savedItems.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-600 mb-2">No saved items</h3>
                                            <p className="text-gray-500">Save items you're interested in for later</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                       // In the saved items mapping section, update this code:
                                        {savedItems.map((item) => {
                                            // Add null/undefined checks
                                            if (!item || !item.product) {
                                                return null; // Skip invalid items
                                            }

                                            const product = item.product;
                                            const availableQuantity = getAvailableQuantity(product);

                                            return (
                                                <Card key={item.id}>
                                                    <CardContent className="p-6">
                                                        <div className="flex flex-col md:flex-row gap-6">
                                                            <div className="flex items-center justify-center w-full md:w-24 h-24 bg-gray-100 rounded-lg">
                                                                <div className="text-4xl">
                                                                    {product?.type === 'TIRE' ? '🚗' : '🌾'}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div>
                                                                        <h3 className="font-bold text-[#1b2358] mb-1">{product?.name}</h3>
                                                                        <Badge className={
                                                                            product?.type === 'TIRE'
                                                                                ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                                                                                : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                                                                        }>
                                                                            {product?.type === 'TIRE' ? 'Tire' : 'Bale'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-lg font-bold text-[#1b2358]">
                                                                            LSL {product?.basePrice?.toFixed(2) || '0.00'}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className={
                                                                            availableQuantity > 0
                                                                                ? 'border-green-500 text-green-600'
                                                                                : 'border-red-500 text-red-600'
                                                                        }>
                                                                            {availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                                        </Badge>
                                                                        {product?.grade && (
                                                                            <span className="text-sm text-gray-600">Grade: {product?.grade}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleMoveToCart(item)}
                                                                            className="text-[#1b2358] border-[#1b2358] hover:bg-[#1b2358] hover:text-white"
                                                                        >
                                                                            Move to Cart
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleRemoveSavedItem(item.id)}
                                                                            className="text-red-600 hover:text-red-700"
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Shipping Options */}
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Truck className="w-5 h-5 text-[#1b2358]" />
                                    <h3 className="font-bold text-[#1b2358]">Shipping Options</h3>
                                </div>

                                <div className="space-y-3">
                                    {shippingOptions.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedShipping === option.id
                                                ? 'border-[#1b2358] bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    value={option.id}
                                                    checked={selectedShipping === option.id}
                                                    onChange={(e) => setSelectedShipping(e.target.value)}
                                                    className="h-4 w-4 text-[#1b2358] focus:ring-[#1b2358]"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${option.id === 'free' ? 'bg-[#FBB320]' : 'bg-[#1b2358]'
                                                        }`}>
                                                        {option.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{option.name}</p>
                                                        <p className="text-sm text-gray-600">{option.description}</p>
                                                        <p className="text-sm text-gray-500">{option.estimatedDays}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">
                                                    {option.price === 0 ? 'FREE' : `LSL ${option.price.toFixed(2)}`}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Promo Code Section */}
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Tag className="w-5 h-5 text-[#FBB320]" />
                                    <h3 className="font-bold text-[#1b2358]">Promo Code</h3>
                                </div>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Enter promo code (AGRO10 or FREESHIP)"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        disabled={!!discount}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleApplyPromoCode}
                                        disabled={!!discount || !promoCode.trim()}
                                        className="bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c] disabled:opacity-50"
                                    >
                                        {discount ? 'Applied' : 'Apply'}
                                    </Button>
                                </div>
                                {discount && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="text-green-700 font-medium">
                                                    {discount.type === 'percentage' ? `${discount.value}% Off` : `LSL ${discount.value} Off`}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeDiscount}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <p className="text-sm text-green-600 mt-1">
                                            You save LSL {totalDiscount.toFixed(2)} on this order
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-[#1b2358] mb-6">Order Summary</h2>

                                {/* Price Breakdown */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({getCartItemCount()} items)</span>
                                        <span className="font-medium">LSL {subtotal.toFixed(2)}</span>
                                    </div>

                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span className="font-medium">-LSL {totalDiscount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">
                                            {shippingPrice === 0 ? 'FREE' : `LSL ${shippingPrice.toFixed(2)}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">VAT (15%)</span>
                                        <span className="font-medium">LSL {tax.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Separator className="mb-6" />

                                {/* Total */}
                                <div className="flex justify-between mb-6">
                                    <div>
                                        <span className="text-lg font-bold text-[#1b2358]">Total</span>
                                        <p className="text-sm text-gray-600">Including VAT</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[#1b2358]">
                                            LSL {finalTotal.toFixed(2)}
                                        </div>
                                        {shippingPrice === 0 && (
                                            <div className="text-sm text-green-600">
                                                Free shipping applied
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Secure Checkout Button */}
                                <Button
                                    onClick={handleSecureCheckout}
                                    disabled={cart.length === 0 || isCheckoutLoading}
                                    className={`w-full h-12 text-lg mb-4 ${cart.length === 0 || isCheckoutLoading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#1b2358] hover:bg-[#151d4a]'
                                        }`}
                                >
                                    {isCheckoutLoading ? (
                                        <span className="flex items-center justify-center">
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <Shield className="w-5 h-5 mr-2" />
                                            Secure Checkout
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </span>
                                    )}
                                </Button>

                                <div className="text-center mb-6">
                                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        256-bit SSL encrypted • Secure payment gateway
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Continue Shopping */}
                        <div className="mt-6">
                            <Link href="/products">
                                <Button variant="outline" className="w-full">
                                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}