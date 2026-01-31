// components/products/product-filter.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, RefreshCw } from "lucide-react";
import { ProductFilters } from "@/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProductFilterAttributes } from "@/hooks/use-product-attributes";

interface ProductFilterProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
    onReset: () => void;
}

export function ProductFilter({
    filters,
    onFilterChange,
    onReset
}: ProductFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(filters.name || '');

    const { attributes, isLoading, error, refresh } = useProductFilterAttributes();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.name) {
                handleInputChange('name', localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch]);

    const handleInputChange = (field: keyof ProductFilters, value: any) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const handleReset = () => {
        setLocalSearch('');
        onReset();
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false;
        return value !== undefined && value !== '' && value !== null;
    });

    // Count active filters (excluding pagination/sorting)
    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false;
        return value !== undefined && value !== '' && value !== null;
    }).length;

    // Get display name for filter values
    const getFilterDisplayValue = (key: string, value: any): string => {
        switch (key) {
            case 'type':
                return value === 'TIRE' ? 'Tires' : value === 'BALE' ? 'Bales' : value || '';
            case 'grade':
                return value === 'A' ? 'Grade A' :
                    value === 'B' ? 'Grade B' :
                        value === 'C' ? 'Grade C' : value || '';
            case 'tireCategory':
                return value === 'NEW' ? 'New' :
                    value === 'SECOND_HAND' ? 'Used' : value || '';
            case 'tireUsage':
                return value === 'FOUR_BY_FOUR' ? '4x4' :
                    value === 'REGULAR' ? 'Regular' :
                        value === 'TRUCK' ? 'Truck' : value || '';
            case 'minPrice':
                return value ? `Min: $${value}` : '';
            case 'maxPrice':
                return value ? `Max: $${value}` : '';
            case 'inStock':
                return value === true ? 'In Stock' : value === false ? 'Out of Stock' : '';
            default:
                return String(value || '');
        }
    };

    // Function to get display label for enum values
    const getDisplayLabel = (type: 'type' | 'grade' | 'tireCategory' | 'tireUsage', value: string): string => {
        const labels: Record<string, string> = {
            // Product types
            'TIRE': 'Tires',
            'BALE': 'Bales',
            // Grades
            'A': 'Grade A',
            'B': 'Grade B',
            'C': 'Grade C',
            // Tire categories
            'NEW': 'New Tires',
            'SECOND_HAND': 'Used Tires',
            // Tire usage
            'FOUR_BY_FOUR': '4x4',
            'REGULAR': 'Regular',
            'TRUCK': 'Truck',
        };
        return labels[value] || value;
    };

    // Filter out empty strings and undefined/null values from attributes
    const filteredAttributes = {
        productTypes: attributes?.productTypes?.filter((type: string) =>
            type && type.trim() !== '' && type !== 'null' && type !== 'undefined'
        ) || [],
        productGrades: attributes?.productGrades?.filter((grade: string) =>
            grade && grade.trim() !== '' && grade !== 'null' && grade !== 'undefined'
        ) || [],
        tireCategories: attributes?.tireCategories?.filter((category: string) =>
            category && category.trim() !== '' && category !== 'null' && category !== 'undefined'
        ) || [],
        tireUsages: attributes?.tireUsages?.filter((usage: string) =>
            usage && usage.trim() !== '' && usage !== 'null' && usage !== 'undefined'
        ) || [],
        commodities: attributes?.commodities?.filter((commodity: string) =>
            commodity && commodity.trim() !== '' && commodity !== 'null' && commodity !== 'undefined'
        ) || [],
        origins: attributes?.origins?.filter((origin: string) =>
            origin && origin.trim() !== '' && origin !== 'null' && origin !== 'undefined'
        ) || [],
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products by name, commodity, or description..."
                        className="pl-8"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Filters</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {isLoading ? "Loading attributes..." :
                                            error ? "Failed to load filters" :
                                                `${filteredAttributes.productTypes.length} types, ${filteredAttributes.productGrades.length} grades available`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => refresh()}
                                        title="Refresh filter options"
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleReset}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">{error}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => refresh()}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Active Filters Summary */}
                                {activeFilterCount > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs">Active Filters</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(filters).map(([key, value]) => {
                                                if (!value || key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return null;

                                                const displayValue = getFilterDisplayValue(key, value);
                                                if (!displayValue) return null;

                                                return (
                                                    <Badge key={key} variant="secondary" className="gap-1">
                                                        <span className="font-medium capitalize">{key}:</span> {displayValue}
                                                        <button
                                                            onClick={() => handleInputChange(key as keyof ProductFilters, undefined)}
                                                            className="ml-1 hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Product Type Filter */}
                                <div>
                                    <Label>Product Type</Label>
                                    {isLoading ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select
                                            value={filters.type || ''}
                                            onValueChange={(value) => handleInputChange('type', value || undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All product types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All types</SelectItem>
                                                {filteredAttributes.productTypes.map((type: string) => (
                                                    <SelectItem key={type} value={type}>
                                                        {getDisplayLabel('type', type)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Product Grade Filter */}
                                <div>
                                    <Label>Product Grade</Label>
                                    {isLoading ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select
                                            value={filters.grade || ''}
                                            onValueChange={(value) => handleInputChange('grade', value || undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All grades" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All grades</SelectItem>
                                                {filteredAttributes.productGrades.map((grade: string) => (
                                                    <SelectItem key={grade} value={grade}>
                                                        {getDisplayLabel('grade', grade)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Tire Category Filter (only shown when type is TIRE or not specified) */}
                                {(filters.type === 'TIRE' || !filters.type) && (
                                    <div>
                                        <Label>Tire Category</Label>
                                        {isLoading ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
                                            <Select
                                                value={filters.tireCategory || ''}
                                                onValueChange={(value) => handleInputChange('tireCategory', value || undefined)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All tire categories" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All categories</SelectItem>
                                                    {filteredAttributes.tireCategories.map((category: string) => (
                                                        <SelectItem key={category} value={category}>
                                                            {getDisplayLabel('tireCategory', category)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                )}

                                {/* Tire Usage Filter (only shown when type is TIRE or not specified) */}
                                {(filters.type === 'TIRE' || !filters.type) && (
                                    <div>
                                        <Label>Tire Usage</Label>
                                        {isLoading ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
                                            <Select
                                                value={filters.tireUsage || ''}
                                                onValueChange={(value) => handleInputChange('tireUsage', value || undefined)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All tire usages" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All usages</SelectItem>
                                                    {filteredAttributes.tireUsages.map((usage: string) => (
                                                        <SelectItem key={usage} value={usage}>
                                                            {getDisplayLabel('tireUsage', usage)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                )}

                                {/* Commodity Filter */}
                                {filteredAttributes.commodities.length > 0 && (
                                    <div>
                                        <Label>Commodity</Label>
                                        {isLoading ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
                                            <Select
                                                value={filters.commodity || ''}
                                                onValueChange={(value) => handleInputChange('commodity', value || undefined)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All commodities" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All commodities</SelectItem>
                                                    {filteredAttributes.commodities.map((commodity: string) => (
                                                        <SelectItem key={commodity} value={commodity}>
                                                            {commodity}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                )}

                                {/* Price Range Filter */}
                                <div className="space-y-2">
                                    <Label>Price Range ($)</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Minimum</Label>
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice || ''}
                                                onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Maximum</Label>
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice || ''}
                                                onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Status Filter */}
                                <div>
                                    <Label>Stock Status</Label>
                                    <Select
                                        value={filters.inStock === undefined ? '' : filters.inStock.toString()}
                                        onValueChange={(value) => handleInputChange('inStock', value === '' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All stock status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All status</SelectItem>
                                            <SelectItem value="true">In Stock</SelectItem>
                                            <SelectItem value="false">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close
                                </Button>
                                <div className="flex items-center gap-2">
                                    {activeFilterCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleReset}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear ({activeFilterCount})
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Quick reset button when filters are active */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        title="Clear all filters"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Active filters bar */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => {
                        if (!value || key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return null;

                        const displayValue = getFilterDisplayValue(key, value);
                        if (!displayValue) return null;

                        return (
                            <Badge key={key} variant="secondary" className="gap-1">
                                <span className="font-medium capitalize">{key}:</span> {displayValue}
                                <button
                                    onClick={() => handleInputChange(key as keyof ProductFilters, undefined)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="ml-auto"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}