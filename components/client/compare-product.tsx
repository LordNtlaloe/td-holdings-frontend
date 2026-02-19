// components/product/compare-products.tsx
"use client"

import { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3,
  DollarSign,
  Truck,
  Leaf,
  TrendingUp,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { products, Product } from '@/data/products'
import Link from 'next/link'

export default function CompareProducts() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonCategory, setComparisonCategory] = useState<'tires' | 'bales' | 'all'>('all')
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  // Initialize with some products for demo
  useEffect(() => {
    // Add initial products for comparison
    const initialProducts = products.slice(0, 3)
    setSelectedProducts(initialProducts)
    setShowComparison(true)
  }, [])

  const filteredProducts = comparisonCategory === 'all'
    ? products
    : products.filter(p => p.category === comparisonCategory)

  const addProduct = (product: Product) => {
    if (selectedProducts.length >= 4) {
      alert('Maximum 4 products can be compared at once')
      return
    }

    if (selectedProducts.find(p => p.id === product.id)) {
      alert('Product already in comparison')
      return
    }

    setSelectedProducts(prev => [...prev, product])
    setShowComparison(true)
  }

  const removeProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
    if (selectedProducts.length <= 1) {
      setShowComparison(false)
    }
  }

  const clearComparison = () => {
    setSelectedProducts([])
    setShowComparison(false)
  }

  const getComparisonFeatures = () => {
    const allFeatures = new Set<string>()

    selectedProducts.forEach(product => {
      product.features.forEach(feature => {
        allFeatures.add(feature)
      })

      // Add product-specific attributes as features
      if (product.brand) allFeatures.add(`Brand: ${product.brand}`)
      if (product.size) allFeatures.add(`Size: ${product.size}`)
      if (product.weight) allFeatures.add(`Weight: ${product.weight}`)
      if (product.season) allFeatures.add(`Season: ${product.season}`)
      if (product.vehicleType) allFeatures.add(`Vehicle Type: ${product.vehicleType}`)
      if (product.baleType) allFeatures.add(`Bale Type: ${product.baleType}`)
    })

    return Array.from(allFeatures)
  }

  const getFeatureValue = (product: Product, feature: string) => {
    // Check if feature matches any product attribute
    if (feature.startsWith('Brand:')) {
      return product.brand || 'N/A'
    }
    if (feature.startsWith('Size:')) {
      return product.size || 'N/A'
    }
    if (feature.startsWith('Weight:')) {
      return product.weight || 'N/A'
    }
    if (feature.startsWith('Season:')) {
      return product.season || 'N/A'
    }
    if (feature.startsWith('Vehicle Type:')) {
      return product.vehicleType || 'N/A'
    }
    if (feature.startsWith('Bale Type:')) {
      return product.baleType || 'N/A'
    }

    // Check if it's a regular feature
    return product.features.includes(feature) ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : 'No'
  }

  const getBestValue = (feature: string, products: Product[]) => {
    if (feature.includes('Price') || feature.includes('Rating')) {
      const values = products.map(p => {
        if (feature.includes('Price')) return p.price
        if (feature.includes('Rating')) return p.rating
        return 0
      })
      const max = Math.max(...values)
      const min = Math.min(...values)
      return { best: max, worst: min }
    }
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating)
          ? 'fill-[#FBB320] text-[#FBB320]'
          : 'fill-gray-200 text-gray-200'
          }`}
      />
    ))
  }

  if (!showComparison || selectedProducts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1b2358] mb-3">Compare Products</h1>
          <p className="text-gray-600">Select products to compare features side-by-side</p>
        </div>

        <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Selected</h3>
          <p className="text-gray-600 mb-6">Add products to start comparing</p>
          <Button
            onClick={() => setShowComparison(true)}
            className="bg-[#1b2358] hover:bg-[#151d4a]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Products to Compare
          </Button>
        </div>
      </div>
    )
  }

  const comparisonFeatures = getComparisonFeatures()
  const displayFeatures = showAllFeatures
    ? comparisonFeatures
    : comparisonFeatures.slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1b2358] mb-2">Compare Products</h1>
          <p className="text-gray-600">
            Side-by-side comparison of {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={comparisonCategory} onValueChange={(value: any) => setComparisonCategory(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="tires">Tires Only</SelectItem>
              <SelectItem value="bales">Bales Only</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={clearComparison}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Products List Sidebar */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-bold text-[#1b2358] mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Products to Compare
              </h3>

              <div className="space-y-3 mb-6">
                {filteredProducts
                  .filter(p => !selectedProducts.find(sp => sp.id === p.id))
                  .slice(0, 8)
                  .map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#1b2358] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{product.image}</div>
                        <div>
                          <p className="font-medium text-[#1b2358] text-sm line-clamp-1">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              product.category === 'tires'
                                ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                                : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                            }>
                              {product.category === 'tires' ? 'Tire' : 'Bale'}
                            </Badge>
                            <span className="text-sm font-bold text-[#1b2358]">
                              LSL {product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addProduct(product)}
                        disabled={selectedProducts.length >= 4}
                        className="bg-[#1b2358] hover:bg-[#151d4a]"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
              </div>

              {selectedProducts.length > 0 && (
                <div className="pt-6 border-t">
                  <h4 className="font-medium text-[#1b2358] mb-3">Selected Products</h4>
                  <div className="space-y-2">
                    {selectedProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-xl">{product.image}</div>
                          <span className="text-sm font-medium text-gray-700 line-clamp-1">
                            {product.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProduct(product.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProducts.length >= 4 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-yellow-700">
                      Maximum of 4 products can be compared at once. Remove one to add another.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison Tips */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Comparison Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-1.5"></div>
                  <span>Compare similar product categories for accurate results</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-1.5"></div>
                  <span>Look for value (price vs features) not just lowest price</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-1.5"></div>
                  <span>Consider your specific needs and usage patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-1.5"></div>
                  <span>Check warranty and after-sales support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Comparison Header */}
            <div className="bg-gray-50 p-4 border-b">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedProducts.map((product, index) => (
                  <div key={product.id} className="relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeProduct(product.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-white shadow-sm border z-10"
                    >
                      <X className="w-3 h-3" />
                    </Button>

                    <div className="text-center">
                      <div className="text-4xl mb-3">{product.image}</div>
                      <h3 className="font-bold text-[#1b2358] mb-2 line-clamp-2 text-sm">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Badge className={
                          product.category === 'tires'
                            ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                            : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                        }>
                          {product.category === 'tires' ? (
                            <Truck className="w-3 h-3 mr-1" />
                          ) : (
                            <Leaf className="w-3 h-3 mr-1" />
                          )}
                          {product.category === 'tires' ? 'Tire' : 'Bale'}
                        </Badge>

                        <Badge variant="outline" className={
                          product.stock === 'In Stock'
                            ? 'border-green-500 text-green-600'
                            : product.stock === 'Low Stock'
                              ? 'border-yellow-500 text-yellow-600'
                              : 'border-red-500 text-red-600'
                        }>
                          {product.stock}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {renderStars(product.rating)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {product.rating} ({product.reviewCount} reviews)
                        </p>
                      </div>

                      <div className="mb-4">
                        <div className="text-xl font-bold text-[#1b2358]">
                          LSL {product.price.toFixed(2)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            LSL {product.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-[#1b2358] hover:bg-[#151d4a] w-full">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="divide-y">
              {/* Key Metrics */}
              <div className="p-4 bg-blue-50">
                <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Key Metrics Comparison
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white">
                        <th className="p-3 text-left font-medium text-gray-700">Metric</th>
                        {selectedProducts.map((product, index) => (
                          <th key={index} className="p-3 text-center font-medium text-gray-700">
                            Product {index + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Price (LSL)</td>
                        {selectedProducts.map((product, index) => (
                          <td key={index} className="p-3 text-center">
                            <div className="font-bold text-[#1b2358]">
                              {product.price.toFixed(2)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Customer Rating</td>
                        {selectedProducts.map((product, index) => (
                          <td key={index} className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {renderStars(product.rating)}
                              <span className="ml-1 font-medium">{product.rating.toFixed(1)}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Reviews</td>
                        {selectedProducts.map((product, index) => (
                          <td key={index} className="p-3 text-center">
                            {product.reviewCount}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Units Sold</td>
                        {selectedProducts.map((product, index) => (
                          <td key={index} className="p-3 text-center">
                            {product.purchaseCount}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Value Score*</td>
                        {selectedProducts.map((product, index) => (
                          <td key={index} className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              {((product.rating * product.purchaseCount) / product.price).toFixed(1)}
                              <TrendingUp className="w-3 h-3" />
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *Value Score = (Rating × Units Sold) ÷ Price
                </p>
              </div>

              {/* Features Comparison */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[#1b2358]">Features & Specifications</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="text-sm"
                  >
                    {showAllFeatures ? 'Show Less' : 'Show All'}
                    {showAllFeatures ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {displayFeatures.map((feature, featureIndex) => {
                        const bestValue = getBestValue(feature, selectedProducts)
                        return (
                          <tr
                            key={featureIndex}
                            className={`${featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <td className="p-3 font-medium text-gray-700 min-w-50">
                              {feature}
                            </td>
                            {selectedProducts.map((product, productIndex) => {
                              const value = getFeatureValue(product, feature)
                              const isBest = bestValue && (
                                (feature.includes('Price') && product.price === bestValue.worst) ||
                                (feature.includes('Rating') && product.rating === bestValue.best)
                              )

                              return (
                                <td
                                  key={productIndex}
                                  className={`p-3 text-center ${isBest ? 'bg-green-50' : ''}`}
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    {typeof value === 'string' ? (
                                      <span className={isBest ? 'font-bold text-green-700' : ''}>
                                        {value}
                                      </span>
                                    ) : (
                                      value
                                    )}
                                    {isBest && (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-1">
                                        Best
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {!showAllFeatures && comparisonFeatures.length > 8 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing 8 of {comparisonFeatures.length} features
                  </p>
                )}
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-linear-to-r from-[#1b2358]/5 to-[#FBB320]/5">
                <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Recommendations
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <h5 className="font-bold text-[#1b2358] mb-2">Product {index + 1}</h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Best For:</span>
                            <p className="mt-1">
                              {product.category === 'tires'
                                ? product.season === 'winter'
                                  ? 'Winter driving conditions'
                                  : product.vehicleType === 'truck'
                                    ? 'Commercial/heavy duty use'
                                    : 'General purpose driving'
                                : product.baleType === 'alfalfa'
                                  ? 'High-value livestock'
                                  : 'General livestock feeding'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Consider:</span>
                            <p className="mt-1">
                              {product.stock === 'Low Stock' && 'Limited stock available'}
                              {product.discount && `Currently ${product.discount}% off`}
                              {!product.discount && product.stock !== 'Low Stock' && 'Good value for money'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Need help deciding? Contact our product experts.</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={clearComparison}>
                    Start New Comparison
                  </Button>
                  <Link href="/contact">
                    <Button className="bg-[#1b2358] hover:bg-[#151d4a]">
                      Contact Expert
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}