"use client"

import { useState } from 'react'
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Product, ProductType } from '@/types'
import ProductAPI from '@/lib/api/products'
import { toast } from 'sonner'
import Image from 'next/image'
import Tires from "@/public/Images/tires.png"
import Bales from "@/public/Images/bales.png"

interface ProductCardProps {
    product: Product
    viewMode: 'grid' | 'list'
    onQuickView?: () => void
    onAddToCart?: (product: Product) => void
    onToggleWishlist?: (productId: string) => void
}

export default function ProductCard({
    product,
    viewMode,
    onQuickView,
    onAddToCart,
    onToggleWishlist
}: ProductCardProps) {
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    const renderStars = (rating?: number) => {
        const ratingValue = rating || 0
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(ratingValue)
                    ? 'fill-[#FBB320] text-[#FBB320]'
                    : 'fill-gray-200 text-gray-200'
                    }`}
            />
        ))
    }

    // Use images instead of emojis
    const productImage = product.type === ProductType.TIRE ? Tires : Bales
    const categoryColor = product.type === ProductType.TIRE ? 'bg-[#1b2358]' : 'bg-[#FBB320]'
    const categoryHoverColor = product.type === ProductType.TIRE ? 'hover:bg-[#151d4a]' : 'hover:bg-[#e6a21c]'

    // Calculate stock status from inventory
    const totalInventory = ProductAPI.calculateTotalInventory(product)
    const stockStatus = ProductAPI.getStockStatusInfo(totalInventory)
    const stockLabel = stockStatus.label
    const stockColor = product.inventories && product.inventories.length > 0 ?
        (totalInventory > 10 ? 'bg-green-500 hover:bg-green-600' :
            totalInventory > 0 ? 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]' :
                'bg-red-500 hover:bg-red-600') :
        'bg-gray-500 hover:bg-gray-600'

    // Format price using ProductAPI utility
    const formattedPrice = ProductAPI.formatCurrency(product.basePrice)

    const handleAddToCart = async () => {
        if (!onAddToCart) return;

        setIsAddingToCart(true)
        try {
            onAddToCart(product)
        } catch (error) {
            toast.error("Failed to add to cart")
        } finally {
            setIsAddingToCart(false)
        }
    }

    const handleToggleWishlist = () => {
        setIsInWishlist(!isInWishlist)
        if (onToggleWishlist) {
            onToggleWishlist(product.id)
        }
        toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
    }

    if (viewMode === 'list') {
        return (
            <Card className="hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                    {/* Image with Quick View overlay */}
                    <div className="md:w-1/4 p-6 bg-gray-100 flex items-center justify-center relative group">
                        <div className="relative w-full h-48">
                            <Image
                                src={productImage}
                                alt={product.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                        {onQuickView && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button
                                    onClick={onQuickView}
                                    variant="secondary"
                                    className="bg-white text-[#1b2358] hover:bg-white/90"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Quick View
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="md:w-3/4 p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`${categoryColor} ${categoryHoverColor}`}>
                                        {product.type === ProductType.TIRE ? 'Tire' : 'Bale'}
                                    </Badge>
                                    {product.grade && (
                                        <Badge className={ProductAPI.getProductGradeInfo(product.grade).color}>
                                            {ProductAPI.getProductGradeInfo(product.grade).label}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className={stockColor}>
                                        {stockLabel}
                                    </Badge>
                                    {totalInventory > 0 && (
                                        <span className="text-sm text-gray-500">
                                            Qty: {totalInventory}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-[#1b2358] mb-2">{product.name}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1">
                                        {renderStars(product.rating)}
                                    </div>
                                    {product.reviewCount && product.reviewCount > 0 && (
                                        <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {product.description || 'No description available'}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {product.type === ProductType.TIRE && product && (
                                        <>
                                            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                                                {ProductAPI.getTireCategoryLabel(product.tireCategory)}
                                            </span>
                                            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                                                {ProductAPI.getTireUsageLabel(product.tireUsage)}
                                            </span>
                                            {product.tireSize && (
                                                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                                                    Size: {product.tireSize}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {product.type === ProductType.BALE && product && (
                                        <>
                                            {product.baleWeight && (
                                                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                                                    Weight: {product.baleWeight}kg
                                                </span>
                                            )}
                                            {product.baleCategory && (
                                                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                                                    {product.baleCategory}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="md:w-48 flex flex-col items-end">
                                <div className="mb-4">
                                    <div className="text-2xl font-bold text-[#1b2358]">
                                        {formattedPrice}
                                    </div>
                                    {product.commodity && (
                                        <div className="text-sm text-gray-500">
                                            Commodity: {product.commodity}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <Button
                                        className={`w-full ${categoryColor} ${categoryHoverColor}`}
                                        onClick={handleAddToCart}
                                        disabled={totalInventory <= 0 || isAddingToCart}
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {isAddingToCart ? 'Adding...' : totalInventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="flex-1"
                                            onClick={handleToggleWishlist}
                                        >
                                            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                                        </Button>
                                        {onQuickView && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="flex-1"
                                                onClick={onQuickView}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    // Grid View
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-[#1b2358]/10 hover:border-[#1b2358]/30">
            <div className="relative">
                <div className="h-48 bg-gray-100 flex items-center justify-center p-4 relative group/image">
                    <div className="relative w-full h-full">
                        <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>

                    {/* Quick View Overlay */}
                    {onQuickView && (
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                            <Button
                                onClick={onQuickView}
                                variant="secondary"
                                size="sm"
                                className="bg-white text-[#1b2358] hover:bg-white/90"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Quick View
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stock Badge */}
                <Badge className={`absolute top-3 left-3 ${stockColor}`}>
                    {stockLabel}
                </Badge>

                {/* Grade Badge */}
                {product.grade && (
                    <Badge className="absolute top-10 left-3 bg-gray-800 hover:bg-gray-900">
                        {ProductAPI.getProductGradeInfo(product.grade).label}
                    </Badge>
                )}

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white hover:bg-gray-100"
                        onClick={handleToggleWishlist}
                    >
                        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    {onQuickView && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white hover:bg-gray-100"
                            onClick={onQuickView}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={`${product.type === ProductType.TIRE ? 'bg-[#1b2358]/10 border-[#1b2358]/20' : 'bg-[#FBB320]/10 border-[#FBB320]/20'} text-[#1b2358]`}>
                        {product.type === ProductType.TIRE ? 'Tire' : 'Bale'}
                    </Badge>
                    <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                        {product.reviewCount && product.reviewCount > 0 && (
                            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                        )}
                    </div>
                </div>
                <h3 className="font-bold text-[#1b2358] line-clamp-1 mb-1">{product.name}</h3>
                {product.commodity && (
                    <p className="text-sm text-gray-500 mb-1">{product.commodity}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description || 'No description available'}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                    {product.type === ProductType.TIRE && product && (
                        <>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {ProductAPI.getTireCategoryLabel(product.tireCategory)}
                            </span>
                            {product.tireSize && (
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                    {product.tireSize}
                                </span>
                            )}
                        </>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold text-[#1b2358]">{formattedPrice}</div>
                        {totalInventory > 0 && (
                            <div className="text-sm text-gray-500">
                                Available: {totalInventory}
                            </div>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className={`${categoryColor} ${categoryHoverColor}`}
                        onClick={handleAddToCart}
                        disabled={totalInventory <= 0 || isAddingToCart}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {isAddingToCart && (
                            <span className="ml-1">...</span>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}