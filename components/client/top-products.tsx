// components/client/top-products.tsx
"use client"

import { useState } from 'react'
import { TrendingUp, Flame, Trophy, BarChart3, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { getTopSellingProducts, getBestSellers, getTrendingProducts, getTopByCategory, Product } from '@/data/products'
import QuickViewModal from './product-quickview-modal'
import ProductCard from './product-card'

interface TopProductsProps {
    title?: string
    showTabs?: boolean
    maxProducts?: number
}

export default function TopProducts({
    title = "Top Products",
    showTabs = true,
    maxProducts = 8
}: TopProductsProps) {
    const [activeTab, setActiveTab] = useState('all')
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

    const topSelling = getTopSellingProducts(maxProducts)
    const bestSellers = getBestSellers(maxProducts)
    const trending = getTrendingProducts(maxProducts)
    const topTires = getTopByCategory('tires', 4)
    const topBales = getTopByCategory('bales', 4)

    const getActiveProducts = () => {
        switch (activeTab) {
            case 'best': return bestSellers
            case 'trending': return trending
            case 'tires': return topTires
            case 'bales': return topBales
            default: return topSelling
        }
    }

    const activeProducts = getActiveProducts()

    const handleQuickView = (product: Product) => {
        setQuickViewProduct(product)
        setIsQuickViewOpen(true)
    }

    const handleAddToCart = (product: Product, quantity: number, selectedSize?: string) => {
        console.log('Added to cart:', { product, quantity, selectedSize })
    }

    const handleAddToWishlist = (product: Product) => {
        console.log('Added to wishlist:', product)
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
                                <ProductGrid products={topSelling} onQuickView={handleQuickView} />
                            </TabsContent>

                            <TabsContent value="best" className="mt-0">
                                <ProductGrid products={bestSellers} onQuickView={handleQuickView} />
                            </TabsContent>

                            <TabsContent value="trending" className="mt-0">
                                <ProductGrid products={trending} onQuickView={handleQuickView} />
                            </TabsContent>

                            <TabsContent value="tires" className="mt-0">
                                <ProductGrid products={topTires} onQuickView={handleQuickView} />
                            </TabsContent>

                            <TabsContent value="bales" className="mt-0">
                                <ProductGrid products={topBales} onQuickView={handleQuickView} />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <ProductGrid products={activeProducts} onQuickView={handleQuickView} />
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

// Product Grid Component
interface ProductGridProps {
    products: Product[]
    onQuickView: (product: Product) => void
}

function ProductGrid({ products, onQuickView }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No products found in this category.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <div key={product.id} className="relative">
                    {/* Rank Badge for top 3 */}
                    {product.purchaseCount > 200 && (
                        <Badge className="absolute top-2 left-2 z-10 bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c]">
                            <Trophy className="w-3 h-3 mr-1" />
                            Top Seller
                        </Badge>
                    )}

                    {/* Trending Badge */}
                    {product.trending && (
                        <Badge className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600">
                            <Flame className="w-3 h-3 mr-1" />
                            Trending
                        </Badge>
                    )}

                    {/* Sales Info Overlay */}
                    <div className="absolute bottom-2 left-2 z-10">
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {product.purchaseCount} sold
                        </div>
                    </div>

                    <ProductCard
                        product={product}
                        viewMode="grid"
                        onQuickView={() => onQuickView(product)}
                    />
                </div>
            ))}
        </div>
    )
}