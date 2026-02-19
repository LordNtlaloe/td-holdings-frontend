// components/product/filters-sidebar.tsx
"use client"

import { Filter, X, Check, Truck, Leaf, DollarSign, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { filterOptions, FilterState } from '@/data/products'
import { useState } from 'react'

interface FiltersSidebarProps {
    category?: 'tires' | 'bales' | 'all'
    onFilterChange: (filters: FilterState) => void
}

export default function FiltersSidebar({ category = 'all', onFilterChange }: FiltersSidebarProps) {
    const [filters, setFilters] = useState<FilterState>({
        category,
        season: [],
        vehicleType: [],
        baleType: [],
        inStock: false,
        onSale: false
    })

    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const updateFilters = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const toggleArrayFilter = (arrayKey: 'season' | 'vehicleType' | 'baleType', value: string) => {
        const currentArray = filters[arrayKey]
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value]
        updateFilters(arrayKey, newArray)
    }

    const clearFilters = () => {
        const clearedFilters: FilterState = {
            category: 'all',
            season: [],
            vehicleType: [],
            baleType: [],
            inStock: false,
            onSale: false
        }
        setFilters(clearedFilters)
        onFilterChange(clearedFilters)
    }

    const activeFilterCount = [
        filters.category !== 'all',
        filters.season.length,
        filters.vehicleType.length,
        filters.baleType.length,
        filters.minRating,
        filters.priceRange,
        filters.inStock,
        filters.onSale
    ].filter(Boolean).length

    const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="space-y-3">
            <h4 className="font-medium text-[#1b2358]">{title}</h4>
            {children}
        </div>
    )

    const FilterButton = ({
        onClick,
        isActive,
        children,
        icon: Icon
    }: {
        onClick: () => void
        isActive: boolean
        children: React.ReactNode
        icon?: React.ElementType
    }) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full p-2 rounded text-sm ${isActive ? 'bg-[#1b2358]/10 text-[#1b2358]' : 'hover:bg-gray-100'
                }`}
        >
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{children}</span>
            </div>
            {isActive && <Check className="w-4 h-4" />}
        </button>
    )

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Category */}
            <FilterSection title="Category">
                <div className="space-y-1">
                    <FilterButton
                        onClick={() => updateFilters('category', 'all')}
                        isActive={filters.category === 'all'}
                    >
                        All Products
                    </FilterButton>
                    <FilterButton
                        onClick={() => updateFilters('category', 'tires')}
                        isActive={filters.category === 'tires'}
                        icon={Truck}
                    >
                        Tires
                    </FilterButton>
                    <FilterButton
                        onClick={() => updateFilters('category', 'bales')}
                        isActive={filters.category === 'bales'}
                        icon={Leaf}
                    >
                        Bales
                    </FilterButton>
                </div>
            </FilterSection>

            <Separator />

            {/* Tire Filters */}
            {(filters.category === 'tires' || filters.category === 'all') && (
                <>
                    <FilterSection title="Season">
                        <div className="space-y-1">
                            {filterOptions.tireSeasons.map((season) => (
                                <FilterButton
                                    key={season}
                                    onClick={() => toggleArrayFilter('season', season)}
                                    isActive={filters.season.includes(season)}
                                >
                                    {season.replace('-', ' ')}
                                </FilterButton>
                            ))}
                        </div>
                    </FilterSection>

                    <FilterSection title="Vehicle Type">
                        <div className="space-y-1">
                            {filterOptions.vehicleTypes.map((type) => (
                                <FilterButton
                                    key={type}
                                    onClick={() => toggleArrayFilter('vehicleType', type)}
                                    isActive={filters.vehicleType.includes(type)}
                                >
                                    {type}
                                </FilterButton>
                            ))}
                        </div>
                    </FilterSection>
                    <Separator />
                </>
            )}

            {/* Bale Filters */}
            {(filters.category === 'bales' || filters.category === 'all') && (
                <>
                    <FilterSection title="Bale Type">
                        <div className="space-y-1">
                            {filterOptions.baleTypes.map((type) => (
                                <FilterButton
                                    key={type}
                                    onClick={() => toggleArrayFilter('baleType', type)}
                                    isActive={filters.baleType.includes(type)}
                                >
                                    {type}
                                </FilterButton>
                            ))}
                        </div>
                    </FilterSection>
                    <Separator />
                </>
            )}

            {/* Price Range */}
            <FilterSection title="Price Range">
                <div className="space-y-1">
                    {filterOptions.priceRanges.map((range) => (
                        <FilterButton
                            key={range.label}
                            onClick={() => updateFilters('priceRange', range)}
                            isActive={filters.priceRange?.min === range.min}
                            icon={DollarSign}
                        >
                            {range.label}
                        </FilterButton>
                    ))}
                </div>
            </FilterSection>

            <Separator />

            {/* Rating */}
            <FilterSection title="Minimum Rating">
                <div className="space-y-1">
                    {filterOptions.ratings.map((rating) => (
                        <FilterButton
                            key={rating}
                            onClick={() => updateFilters('minRating', rating)}
                            isActive={filters.minRating === rating}
                            icon={Star}
                        >
                            {rating}+ Stars
                        </FilterButton>
                    ))}
                </div>
            </FilterSection>

            <Separator />

            {/* Stock & Sale */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm">In Stock Only</span>
                    <ToggleSwitch
                        isOn={filters.inStock}
                        onClick={() => updateFilters('inStock', !filters.inStock)}
                        color="bg-[#1b2358]"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm">On Sale</span>
                    <ToggleSwitch
                        isOn={filters.onSale}
                        onClick={() => updateFilters('onSale', !filters.onSale)}
                        color="bg-[#FBB320]"
                    />
                </div>
            </div>

            {/* Active Filters */}
            <div className="pt-6 border-t">
                <h4 className="font-medium text-[#1b2358] mb-3">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                    {filters.category !== 'all' && (
                        <Badge className="bg-[#1b2358] hover:bg-[#151d4a]">
                            {filters.category === 'tires' ? 'Tires' : 'Bales'}
                        </Badge>
                    )}
                    {filters.season.map(season => (
                        <Badge key={season} variant="outline" className="border-[#1b2358]/20">
                            {season}
                        </Badge>
                    ))}
                    {filters.vehicleType.map(type => (
                        <Badge key={type} variant="outline" className="border-[#1b2358]/20">
                            {type}
                        </Badge>
                    ))}
                    {filters.baleType.map(type => (
                        <Badge key={type} variant="outline" className="border-[#FBB320]/30">
                            {type}
                        </Badge>
                    ))}
                    {filters.priceRange && (
                        <Badge variant="outline" className="border-[#1b2358]/20">
                            Price: LSL {filters.priceRange.min}-{filters.priceRange.max === Infinity ? '+' : filters.priceRange.max}
                        </Badge>
                    )}
                    {filters.minRating && (
                        <Badge variant="outline" className="border-[#FBB320]/30">
                            {filters.minRating}+ Stars
                        </Badge>
                    )}
                    {filters.inStock && <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>}
                    {filters.onSale && <Badge className="bg-red-500 hover:bg-red-600">On Sale</Badge>}
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden mb-6">
                <Button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-full bg-[#1b2358] hover:bg-[#151d4a]"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
                    <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-[#1b2358]">Filters</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <FilterContent />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Filters */}
            <div className="hidden lg:block sticky top-24">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-[#1b2358]" />
                            <h3 className="font-bold text-[#1b2358]">Filters</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear All
                        </Button>
                    </div>
                    <FilterContent />
                </div>
            </div>
        </>
    )
}

// Helper Components
const ToggleSwitch = ({ isOn, onClick, color }: { isOn: boolean; onClick: () => void; color: string }) => (
    <button
        onClick={onClick}
        className={`w-12 h-6 rounded-full transition-colors ${isOn ? color : 'bg-gray-300'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${isOn ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
)