// components/product/quick-view-modal.tsx
"use client"

import { useState } from 'react'
import {
    X,
    ShoppingCart,
    Heart,
    Share2,
    Check,
    Truck,
    Shield,
    RotateCcw,
    Star,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Package,
    Leaf,
    Truck as TruckIcon,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Product, ProductType } from '@/types'
import { cn } from '@/lib/utils'
import ProductAPI from '@/lib/api/products'
import bales from "@/public/Images/bales.png"
import tires from "@/public/Images/tires.png"

interface QuickViewModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    onAddToCart: (product: Product, quantity: number, selectedSize?: string) => void
    onAddToWishlist: (product: Product) => void
}

export default function QuickViewModal({
    product,
    isOpen,
    onClose,
    onAddToCart,
    onAddToWishlist
}: QuickViewModalProps) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    if (!product) return null

    // Mock images for gallery
    const productImages = [
        bales,
        tires
    ]

    // Delivery options - defined inside component
    const deliveryOptions = [
        { value: 'standard', label: 'Standard (3-5 days)', price: 0, freeOver: 1000 },
        { value: 'express', label: 'Express (1-2 days)', price: 99.99, freeOver: null },
        { value: 'same-day', label: 'Same Day (Maseru)', price: 199.99, freeOver: null }
    ]

    // Mock features based on product type
    const getProductFeatures = () => {
        if (product.type === ProductType.TIRE) {
            return [
                'Durable construction for long-lasting performance',
                'Excellent traction on various road surfaces',
                'Fuel-efficient design',
                'Enhanced safety features'
            ]
        } else {
            return [
                'Premium quality hay/alfalfa',
                'Properly cured and stored',
                'High nutritional value for livestock',
                'Consistent quality across bales'
            ]
        }
    }

    const features = getProductFeatures()

    // Calculate stock status
    const totalInventory = ProductAPI.calculateTotalInventory(product)
    const stockStatus = ProductAPI.getStockStatusInfo(totalInventory)
    const stockLabel = stockStatus.label
    const stockColor = totalInventory > 10 ? 'bg-green-500 hover:bg-green-600' :
        totalInventory > 0 ? 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]' :
            'bg-red-500 hover:bg-red-600'

    // Format price - FIXED: properly convert basePrice to number
    const safeBasePrice = typeof product.basePrice === 'number' 
        ? product.basePrice 
        : parseFloat(String(product.basePrice || '0')) || 0
    const formattedPrice = ProductAPI.formatCurrency(safeBasePrice)

    // Create size/weight options based on product type
    const getSizeOptions = () => {
        if (product.type === ProductType.TIRE && product.tireSize) {
            return [product.tireSize]
        } else if (product.type === ProductType.BALE && product.baleWeight) {
            return [`${product.baleWeight}kg`]
        }
        // Default options if specific size/weight not available
        return product.type === ProductType.TIRE 
            ? ['205/55R16', '215/60R16', '225/45R17', '235/55R18']
            : ['40kg', '50kg', '60kg', '70kg']
    }

    const sizeOptions = getSizeOptions()

    const handleAddToCart = () => {
        setIsAddingToCart(true)
        setTimeout(() => {
            onAddToCart(product, quantity, selectedSize || sizeOptions[0])
            setIsAddingToCart(false)
            // Auto close after adding to cart
            setTimeout(() => onClose(), 1000)
        }, 800)
    }

    const handleAddToWishlist = () => {
        setIsInWishlist(!isInWishlist)
        onAddToWishlist(product)
    }

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out ${product.name} on TD Holdings Supply!`,
            url: window.location.href,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
                alert('Product link copied to clipboard!')
            }
        } catch (err) {
            console.log('Error sharing:', err)
        }
    }

    const renderStars = (rating?: number) => {
        const ratingValue = rating || 0
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(ratingValue)
                    ? 'fill-[#FBB320] text-[#FBB320]'
                    : 'fill-gray-200 text-gray-200'
                    }`}
            />
        ))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[50vw] max-h-[90vh] overflow-y-auto p-0 w-full">
                <div className="relative">
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg"
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    <div className="grid lg:grid-cols-2">
                        {/* Left Column - Product Images */}
                        <div className="bg-gray-50 p-6">
                            {/* Main Image */}
                            <div className="relative h-96 bg-white rounded-lg mb-4 overflow-hidden group">
                                <div className="w-full h-full flex items-center justify-center text-8xl">
                                    {product.type === ProductType.TIRE ? '🛞' : '🌾'}
                                </div>

                                {/* Image Navigation */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedImage(prev => (prev - 1 + productImages.length) % productImages.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedImage(prev => (prev + 1) % productImages.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>

                                {/* Zoom Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-lg"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </Button>

                                {/* Stock Badge */}
                                <Badge className={`absolute top-2 left-2 ${stockColor}`}>
                                    {stockLabel}
                                </Badge>

                                {/* Grade Badge */}
                                {product.grade && (
                                    <Badge className="absolute top-2 left-20 bg-gray-800 hover:bg-gray-900">
                                        {ProductAPI.getProductGradeInfo(product.grade).label}
                                    </Badge>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {productImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={cn(
                                            "shrink-0 w-20 h-20 bg-white rounded-lg border-2 flex items-center justify-center text-2xl hover:border-[#1b2358] transition-colors",
                                            selectedImage === index ? "border-[#1b2358]" : "border-transparent"
                                        )}
                                    >
                                        {image.width}
                                    </button>
                                ))}
                            </div>

                            {/* Product Badges */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge className={
                                    product.type === ProductType.TIRE
                                        ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                                        : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                                }>
                                    {product.type === ProductType.TIRE ? (
                                        <TruckIcon className="w-3 h-3 mr-1" />
                                    ) : (
                                        <Leaf className="w-3 h-3 mr-1" />
                                    )}
                                    {product.type === ProductType.TIRE ? 'Tire' : 'Farm Bale'}
                                </Badge>

                                {/* Best Seller badge - uncomment if you add this property to Product type */}
                                {/* {product.bestSeller && (
                                    <Badge className="bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c]">
                                        Best Seller
                                    </Badge>
                                )} */}

                                {/* Trending badge - uncomment if you add this property to Product type */}
                                {/* {product.trending && (
                                    <Badge className="bg-purple-500 hover:bg-purple-600">
                                        Trending
                                    </Badge>
                                )} */}
                            </div>
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="p-8">
                            <DialogTitle className="text-2xl font-bold text-[#1b2358] mb-2">
                                {product.name}
                            </DialogTitle>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-1">
                                    {renderStars(product.rating)}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
                                </span>
                                {/* Purchase count - uncomment if you add this property to Product type */}
                                {/* {product.purchaseCount && product.purchaseCount > 0 && (
                                    <>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-green-600 font-medium">
                                            {product.purchaseCount} sold
                                        </span>
                                    </>
                                )} */}
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-[#1b2358]">
                                        {formattedPrice}
                                    </span>
                                    {/* Original price - uncomment if you add this property to Product type */}
                                    {/* {product.originalPrice && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">
                                                {ProductAPI.formatCurrency(product.originalPrice)}
                                            </span>
                                            <Badge className="bg-red-500 hover:bg-red-600">
                                                Save {ProductAPI.formatCurrency(product.originalPrice - safeBasePrice)}
                                            </Badge>
                                        </>
                                    )} */}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    VAT inclusive • Free shipping on orders over LSL 1000
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 mb-6">{product.description || 'No description available'}</p>

                            {/* Size/Weight Selection */}
                            {sizeOptions.length > 0 && (
                                <div className="mb-6">
                                    <Label className="block text-sm font-medium text-gray-700 mb-3">
                                        {product.type === ProductType.TIRE ? 'Select Size' : 'Select Weight'}
                                    </Label>
                                    <RadioGroup
                                        value={selectedSize}
                                        onValueChange={setSelectedSize}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {sizeOptions.map((option) => (
                                            <div key={option}>
                                                <RadioGroupItem
                                                    value={option}
                                                    id={option}
                                                    className="peer sr-only"
                                                />
                                                <Label
                                                    htmlFor={option}
                                                    className={cn(
                                                        "inline-flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-all",
                                                        "peer-data-[state=checked]:border-[#1b2358] peer-data-[state=checked]:bg-[#1b2358]/5",
                                                        "hover:border-[#1b2358] hover:bg-gray-50",
                                                        selectedSize === option
                                                            ? "border-[#1b2358] bg-[#1b2358]/5 text-[#1b2358] font-medium"
                                                            : "border-gray-300"
                                                    )}
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    {!selectedSize && sizeOptions.length > 0 && (
                                        <p className="text-sm text-yellow-600 mt-2">
                                            Please select a {product.type === ProductType.TIRE ? 'size' : 'weight'} to proceed
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Quantity & Add to Cart */}
                            <div className="mb-8">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity
                                        </Label>
                                        <div className="flex items-center border rounded-lg">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                                className="h-10 w-10"
                                            >
                                                <span className="text-lg">-</span>
                                            </Button>
                                            <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setQuantity(prev => Math.min(prev + 1, 99))}
                                                className="h-10 w-10"
                                            >
                                                <span className="text-lg">+</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={isAddingToCart || totalInventory <= 0}
                                            className={cn(
                                                "w-full h-12 text-lg",
                                                isAddingToCart
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : "bg-[#1b2358] hover:bg-[#151d4a]"
                                            )}
                                        >
                                            {isAddingToCart ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Adding...
                                                </>
                                            ) : totalInventory <= 0 ? (
                                                'Out of Stock'
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                                    Add to Cart • {ProductAPI.formatCurrency(safeBasePrice * quantity)}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleAddToWishlist}
                                >
                                    <Heart className={cn(
                                        "w-4 h-4 mr-2",
                                        isInWishlist && "fill-red-500 text-red-500"
                                    )} />
                                    {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>

                            {/* Delivery Options */}
                            <div className="mb-6">
                                <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                                    <Truck className="w-5 h-5" />
                                    Delivery Options
                                </h4>
                                <div className="space-y-2">
                                    {deliveryOptions.map((option) => (
                                        <div key={option.value} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full border border-gray-400"></div>
                                                <span className="text-sm">{option.label}</span>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-medium",
                                                option.price === 0 ? "text-green-600" : "text-gray-700"
                                            )}>
                                                {option.price === 0 ? 'FREE' : `LSL ${option.price.toFixed(2)}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="mb-6">
                                <h4 className="font-bold text-[#1b2358] mb-3">Key Features</h4>
                                <div className="space-y-2">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-[#1b2358]" />
                                    <div>
                                        <p className="text-xs font-medium">1 Year Warranty</p>
                                        <p className="text-xs text-gray-500">Guaranteed quality</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <RotateCcw className="w-5 h-5 text-[#1b2358]" />
                                    <div>
                                        <p className="text-xs font-medium">30-Day Returns</p>
                                        <p className="text-xs text-gray-500">Easy returns</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Package className="w-5 h-5 text-[#1b2358]" />
                                    <div>
                                        <p className="text-xs font-medium">In Stock</p>
                                        <p className="text-xs text-gray-500">Ready to ship</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Truck className="w-5 h-5 text-[#1b2358]" />
                                    <div>
                                        <p className="text-xs font-medium">Free Delivery</p>
                                        <p className="text-xs text-gray-500">Over LSL 1000</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Alert */}
                            {totalInventory > 0 && totalInventory <= 10 && (
                                <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-500">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                                            <p className="text-xs text-yellow-700">
                                                Only {totalInventory} item{totalInventory !== 1 ? 's' : ''} left. Order now to avoid disappointment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}