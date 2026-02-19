"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Grid3x3, List, Filter, X, Search } from 'lucide-react'
import { Product, ProductFilters, SortOrder } from '@/types'
import ProductAPI from '@/lib/api/products'
import ProductCard from './product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from '@/components/ui/separator'
import { useProductFilterAttributes } from '@/hooks/use-product-attributes'
import { usePos } from '@/contexts/cart-context'
import { toast } from 'sonner'

interface ProductsListProps {
    storeId?: string
    initialFilters?: ProductFilters
    token?: string // Optional token for authenticated requests
}

export default function ProductsList({ storeId, initialFilters, token }: ProductsListProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<ProductFilters>({
        page: 1,
        limit: 12,
        sortBy: 'name',
        sortOrder: 'asc' as SortOrder,
        ...initialFilters
    })
    const [localSearch, setLocalSearch] = useState(filters.name || '')
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

    const { attributes, isLoading: attributesLoading } = useProductFilterAttributes()
    const { addToCart } = usePos()

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.name) {
                handleFilterChange('name', localSearch)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [localSearch, filters.name])

    // Fetch products with filters
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Prepare filter params
            const filterParams: any = {
                page: filters.page,
                limit: filters.limit,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            }

            // Add search filter
            if (filters.name) {
                filterParams.search = filters.name
            }

            // Add other filters
            if (filters.type) filterParams.type = filters.type
            if (filters.grade) filterParams.grade = filters.grade
            if (filters.tireCategory) filterParams.tireCategory = filters.tireCategory
            if (filters.tireUsage) filterParams.tireUsage = filters.tireUsage
            if (filters.commodity) filterParams.commodity = filters.commodity
            if (filters.minPrice !== undefined) filterParams.minPrice = filters.minPrice
            if (filters.maxPrice !== undefined) filterParams.maxPrice = filters.maxPrice
            if (filters.inStock !== undefined) filterParams.inStock = filters.inStock

            // Add store filter if specified
            if (storeId) filterParams.storeId = storeId

            // Use public catalog for unauthenticated users
            const response = await ProductAPI.getProducts("", filterParams)

            // Handle different response formats
            if (Array.isArray(response)) {
                setProducts(response)
            } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
                setProducts((response as any).data)
            } else if (response && typeof response === 'object' && 'products' in response) {
                // Type guard for response with products property
                const responseWithProducts = response as { products?: Product[] }
                setProducts(responseWithProducts.products || [])
            } else {
                setProducts([])
            }
        } catch (err: any) {
            console.error('Error fetching products:', err)
            setError(err.message || 'Failed to load products')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [filters, storeId, token])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // Handle filter changes
    const handleFilterChange = (field: keyof ProductFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 1 // Reset to first page when filters change
        }))
    }

    // Handle reset filters
    const handleResetFilters = () => {
        setLocalSearch('')
        setFilters({
            page: 1,
            limit: 12,
            sortBy: 'name',
            sortOrder: 'asc' as SortOrder,
            ...initialFilters
        })
    }

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }))
    }

    const handleAddToCart = (product: Product) => {
        addToCart(product);
    }

    const handleToggleWishlist = (productId: string) => {
        console.log('Toggle wishlist:', productId)
    }

    const handleQuickView = (product: Product) => {
        console.log('Quick view:', product)
    }

    // Get display name for filter values
    const getFilterDisplayValue = (key: string, value: any): string => {
        switch (key) {
            case 'type':
                return value === 'TIRE' ? 'Tires' : value === 'BALE' ? 'Bales' : value || ''
            case 'grade':
                return value === 'A' ? 'Grade A' :
                    value === 'B' ? 'Grade B' :
                        value === 'C' ? 'Grade C' : value || ''
            case 'tireCategory':
                return value === 'NEW' ? 'New' :
                    value === 'SECOND_HAND' ? 'Used' : value || ''
            case 'tireUsage':
                return value === 'FOUR_BY_FOUR' ? '4x4' :
                    value === 'REGULAR' ? 'Regular' :
                        value === 'TRUCK' ? 'Truck' : value || ''
            case 'minPrice':
                return value ? `Min: $${value}` : ''
            case 'maxPrice':
                return value ? `Max: $${value}` : ''
            case 'inStock':
                return value === true ? 'In Stock' : value === false ? 'Out of Stock' : ''
            default:
                return String(value || '')
        }
    }

    // Check if there are active filters
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false
        return value !== undefined && value !== '' && value !== null
    })

    // Loading state
    if (loading && products.length === 0) {
        return (
            <div className="container mx-auto px-3 sm:px-4">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left sidebar skeleton */}
                    <div className="hidden lg:block lg:w-72 xl:w-80">
                        <div className="sticky top-24 space-y-5">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    </div>

                    {/* Main content skeleton */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32 mt-2" />
                            </div>
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-80 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error && products.length === 0) {
        return (
            <div className="container mx-auto px-3 sm:px-4 py-8 text-center">
                <div className="text-red-500 mb-3">Error: {error}</div>
                <Button
                    onClick={() => fetchProducts()}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                >
                    Retry
                </Button>
            </div>
        )
    }

    // Filter sidebar component
    const FilterSidebar = () => (
        <div className="space-y-5">
            {/* Search */}
            <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-700 font-medium">Search Products</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        id="search"
                        placeholder="Product name, commodity..."
                        className="pl-10 border-gray-300 focus:border-[#1b2358] focus:ring-[#1b2358]/20"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Product Type</Label>
                {attributesLoading ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select
                        value={filters.type || ''}
                        onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                    >
                        <SelectTrigger className="border-gray-300 focus:border-[#1b2358] focus:ring-[#1b2358]/20">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {attributes?.productTypes?.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                    {type === 'TIRE' ? 'Tires' : type === 'BALE' ? 'Bales' : type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Product Grade */}
            <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Product Grade</Label>
                {attributesLoading ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select
                        value={filters.grade || ''}
                        onValueChange={(value) => handleFilterChange('grade', value === 'all' ? undefined : value)}
                    >
                        <SelectTrigger className="border-gray-300 focus:border-[#1b2358] focus:ring-[#1b2358]/20">
                            <SelectValue placeholder="All grades" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All grades</SelectItem>
                            {attributes?.productGrades?.map((grade: string) => (
                                <SelectItem key={grade} value={grade}>
                                    {grade === 'A' ? 'Grade A' :
                                        grade === 'B' ? 'Grade B' :
                                            grade === 'C' ? 'Grade C' : grade}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                        min="0"
                        step="0.01"
                        className="border-gray-300 focus:border-[#1b2358] focus:ring-[#1b2358]/20"
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                        min="0"
                        step="0.01"
                        className="border-gray-300 focus:border-[#1b2358] focus:ring-[#1b2358]/20"
                    />
                </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Stock Status</Label>
                <Select
                    value={filters.inStock === undefined ? '' : filters.inStock.toString()}
                    onValueChange={(value) => handleFilterChange('inStock', value === 'all' ? undefined : value === 'true')}
                >
                    <SelectTrigger className="border-gray-300 focus:border-[#1b2358] focus:ring-[#1b2358]/20">
                        <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        <SelectItem value="true">In Stock</SelectItem>
                        <SelectItem value="false">Out of Stock</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 hover:text-red-500"
                    onClick={handleResetFilters}
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                </Button>
            )}
        </div>
    )

    return (
        <div className="container mx-auto px-3 sm:px-4 py-8 ml-45">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
                <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-2 bg-[#1b2358] text-white hover:bg-[#151d4a]">
                                {Object.keys(filters).filter(k =>
                                    !['page', 'limit', 'sortBy', 'sortOrder'].includes(k) &&
                                    filters[k as keyof ProductFilters]
                                ).length}
                            </Badge>
                        )}
                    </span>
                    {isMobileFiltersOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                </Button>

                {/* Mobile Filters Panel */}
                {isMobileFiltersOpen && (
                    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
                        <FilterSidebar />
                    </div>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm text-gray-600 self-center">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => {
                        if (!value || key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return null

                        const displayValue = getFilterDisplayValue(key, value)
                        if (!displayValue) return null

                        return (
                            <Badge key={key} variant="secondary" className="gap-1 bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">
                                <span className="font-medium capitalize">{key}:</span> {displayValue}
                                <button
                                    onClick={() => handleFilterChange(key as keyof ProductFilters, undefined)}
                                    className="ml-1 hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )
                    })}
                </div>
            )}

            {/* Main Content */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Left Sidebar - Filters (Desktop) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 bg-white p-5 rounded-lg border shadow-sm">
                        <FilterSidebar />
                    </div>
                </div>

                {/* Right Side - Products */}
                <div className="lg:col-span-3">
                    {/* Header with results count and view toggle */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white rounded-lg border shadow-sm">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-[#1b2358]">Products</h2>
                            <p className="text-sm text-gray-500">
                                {products.length} {products.length === 1 ? 'product' : 'products'} found
                            </p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden sm:block text-sm text-gray-600">
                                Sort by:
                            </div>
                            <Select
                                value={filters.sortBy || 'name'}
                                onValueChange={(value) => handleFilterChange('sortBy', value)}
                            >
                                <SelectTrigger className="w-32 sm:w-36 bg-white border-gray-200 focus:border-[#1b2358] focus:ring-[#1b2358]/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="basePrice">Price</SelectItem>
                                    <SelectItem value="createdAt">Newest</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-1 border rounded-md p-1 bg-gray-50">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-[#1b2358] hover:bg-[#151d4a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className={`h-8 w-8 ${viewMode === 'list' ? 'bg-[#1b2358] hover:bg-[#151d4a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Products Grid/List */}
                    {products.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-white">
                            <p className="text-gray-600 text-lg mb-2">No products found</p>
                            <p className="text-gray-500 text-sm mb-4">
                                Try adjusting your filters or search term
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleResetFilters}
                                className="border-gray-300 hover:bg-gray-50"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
                                : 'space-y-4 md:space-y-6'
                            }>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        viewMode={viewMode}
                                        onQuickView={() => handleQuickView(product)}
                                        onAddToCart={handleAddToCart}
                                        onToggleWishlist={handleToggleWishlist}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8 pt-6 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(filters.page! - 1)}
                                    disabled={filters.page === 1}
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Page {filters.page}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(filters.page! + 1)}
                                    disabled={products.length < (filters.limit || 12)}
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}