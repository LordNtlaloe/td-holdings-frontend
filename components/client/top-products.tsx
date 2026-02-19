// components/client/top-products.tsx
"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, Flame, Trophy, BarChart3, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, ProductType } from '@/types'
import ProductAPI from '@/lib/api/products'
import QuickViewModal from './product-quickview-modal'
import ProductCard from './product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePos } from '@/contexts/cart-context'

interface TopProductsProps {
    title?: string
    showTabs?: boolean
    maxProducts?: number
}

// Helper function to simulate sorting/filtering
const getSortedProducts = (products: Product[], sortBy: 'top' | 'best' | 'trending' | 'type' = 'top', category?: 'tires' | 'bales') => {
    let filtered = [...products]

    // Filter by category if specified
    if (category === 'tires') {
        filtered = filtered.filter(p => p.type === ProductType.TIRE)
    } else if (category === 'bales') {
        filtered = filtered.filter(p => p.type === ProductType.BALE)
    }

    // Sort based on criteria - using actual properties from your Product type
    switch (sortBy) {
        case 'best':
            // Sort by inventory or rating (since you don't have purchaseCount)
            return filtered.sort((a, b) => {
                const aInventory = ProductAPI.calculateTotalInventory(a)
                const bInventory = ProductAPI.calculateTotalInventory(b)
                return bInventory - aInventory
            })
        case 'trending':
            // Sort by rating
            return filtered.sort((a, b) => {
                const aRating = a.rating || 0
                const bRating = b.rating || 0
                return bRating - aRating
            })
        default: // 'top'
            // Sort by base price or rating
            return filtered.sort((a, b) => b.basePrice - a.basePrice)
    }
}

export default function TopProducts({
    title = "Top Products",
    showTabs = true,
    maxProducts = 8
}: TopProductsProps) {
    const [activeTab, setActiveTab] = useState('all')
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Use the POS context for cart functionality
    const { addToCart } = usePos()

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Fetch products from API with pagination
                const response = await ProductAPI.getProducts('', {
                    limit: 50,
                    sortBy: 'createdAt',
                })

                // The response should have a data property with products array
                const fetchedProducts = response.data || []
                setProducts(fetchedProducts)

                console.log(`🟦 TopProducts: Fetched ${fetchedProducts.length} products`)

            } catch (err: any) {
                console.error('🔴 Error fetching products:', err)
                setError(err.message || 'Failed to load products')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

    // Get filtered products based on active tab
    const getActiveProducts = () => {
        if (isLoading || error) return []

        let filteredProducts: Product[] = []

        switch (activeTab) {
            case 'best':
                filteredProducts = getSortedProducts(products, 'best').slice(0, maxProducts)
                break
            case 'trending':
                filteredProducts = getSortedProducts(products, 'trending').slice(0, maxProducts)
                break
            case 'tires':
                filteredProducts = getSortedProducts(products, 'top', 'tires').slice(0, maxProducts)
                break
            case 'bales':
                filteredProducts = getSortedProducts(products, 'top', 'bales').slice(0, maxProducts)
                break
            default: // 'all'
                filteredProducts = getSortedProducts(products, 'top').slice(0, maxProducts)
                break
        }

        return filteredProducts
    }

    const activeProducts = getActiveProducts()

    const handleQuickView = (product: Product) => {
        setQuickViewProduct(product)
        setIsQuickViewOpen(true)
    }

    // Updated handleAddToCart using the POS context
    const handleAddToCart = (product: Product, quantity: number, selectedSize?: string) => {
        // Add the product to cart using the POS context
        addToCart(product)
        console.log('Added to cart:', { product, quantity, selectedSize })
    }

    // This function is used by QuickViewModal
    const handleAddToWishlist = (product: Product) => {
        console.log('Added to wishlist:', product)
        // Implement actual wishlist logic here
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="w-full bg-linear-to-b from-white to-gray-50 py-8 md:py-12">
                <div className="container mx-auto px-3 sm:px-4">
                    {/* Header Skeleton */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
                        <div>
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Tabs Skeleton */}
                    {showTabs && (
                        <div className="mb-8">
                            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
                        </div>
                    )}

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="w-full bg-linear-to-b from-white to-gray-50 py-8 md:py-12">
                <div className="container mx-auto px-3 sm:px-4 text-center">
                    <div className="text-red-500 mb-4">Error loading products: {error}</div>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="w-full bg-linear-to-b from-white to-gray-50 py-8 md:py-12">
                <div className="container mx-auto px-3 sm:px-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-[#FBB320]" />
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1b2358]">
                                    {title}
                                </h2>
                            </div>
                            <p className="text-gray-600">Most purchased products by our customers</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-gray-600">Best Sellers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-gray-600">Trending</span>
                                </div>
                            </div>
                            <Button variant="outline" className="text-[#1b2358] border-[#1b2358]/20">
                                View All Products
                                <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    {showTabs ? (
                        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
                                <TabsTrigger value="all" className="data-[state=active]:bg-[#1b2358] data-[state=active]:text-white">
                                    All Top
                                </TabsTrigger>
                                <TabsTrigger value="best" className="data-[state=active]:bg-[#1b2358] data-[state=active]:text-white">
                                    Best Sellers
                                </TabsTrigger>
                                <TabsTrigger value="trending" className="data-[state=active]:bg-[#1b2358] data-[state=active]:text-white">
                                    Trending
                                </TabsTrigger>
                                <TabsTrigger value="tires" className="data-[state=active]:bg-[#1b2358] data-[state=active]:text-white">
                                    Top Tires
                                </TabsTrigger>
                                <TabsTrigger value="bales" className="data-[state=active]:bg-[#1b2358] data-[state=active]:text-white">
                                    Top Bales
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-0">
                                <ProductGrid
                                    products={activeProducts}
                                    onQuickView={handleQuickView}
                                    onAddToCart={addToCart} // Pass addToCart function
                                />
                            </TabsContent>

                            <TabsContent value="best" className="mt-0">
                                <ProductGrid
                                    products={activeProducts}
                                    onQuickView={handleQuickView}
                                    onAddToCart={addToCart}
                                />
                            </TabsContent>

                            <TabsContent value="trending" className="mt-0">
                                <ProductGrid
                                    products={activeProducts}
                                    onQuickView={handleQuickView}
                                    onAddToCart={addToCart}
                                />
                            </TabsContent>

                            <TabsContent value="tires" className="mt-0">
                                <ProductGrid
                                    products={activeProducts}
                                    onQuickView={handleQuickView}
                                    onAddToCart={addToCart}
                                />
                            </TabsContent>

                            <TabsContent value="bales" className="mt-0">
                                <ProductGrid
                                    products={activeProducts}
                                    onQuickView={handleQuickView}
                                    onAddToCart={addToCart}
                                />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <ProductGrid
                            products={activeProducts}
                            onQuickView={handleQuickView}
                            onAddToCart={addToCart}
                        />
                    )}

                    {/* No products message */}
                    {products.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No products available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={isQuickViewOpen}
                onClose={() => {
                    setIsQuickViewOpen(false)
                    setQuickViewProduct(null)
                }}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
            />
        </>
    )
}

// Product Grid Component - UPDATED to include onAddToCart prop
interface ProductGridProps {
    products: Product[]
    onQuickView: (product: Product) => void
    onAddToCart?: (product: Product) => void // Make it optional to maintain compatibility
}

function ProductGrid({ products, onQuickView, onAddToCart }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No products found in this category.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
                // Ensure basePrice is a valid number
                const safeProduct = {
                    ...product,
                    basePrice: typeof product.basePrice === 'number' ? product.basePrice :
                        parseFloat(String(product.basePrice || '0')) || 0
                };

                // Calculate inventory for display
                const totalInventory = ProductAPI.calculateTotalInventory(safeProduct)

                return (
                    <div key={safeProduct.id} className="relative">
                        {/* Top Seller Badge - based on inventory or rating */}
                        {totalInventory > 50 && (
                            <Badge className="absolute top-2 left-2 z-10 bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c]">
                                <Trophy className="w-3 h-3 mr-1" />
                                Top Seller
                            </Badge>
                        )}

                        {/* Trending Badge - based on rating */}
                        {(safeProduct.rating || 0) >= 4 && (
                            <Badge className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600">
                                <Flame className="w-3 h-3 mr-1" />
                                Popular
                            </Badge>
                        )}

                        {/* Inventory Info Overlay */}
                        {totalInventory > 0 && (
                            <div className="absolute bottom-2 left-2 z-10">
                                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {totalInventory} in stock
                                </div>
                            </div>
                        )}

                        <ProductCard
                            product={safeProduct}
                            viewMode="grid"
                            onQuickView={() => onQuickView(safeProduct)}
                            onAddToCart={onAddToCart} // Pass addToCart function to ProductCard
                        />
                    </div>
                )
            })}
        </div>
    )
}