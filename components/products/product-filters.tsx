import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, DollarSign } from 'lucide-react';
import { ProductFilters as ProductFiltersType, ProductType, ProductGrade } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ProductFiltersProps {
    filters: ProductFiltersType;
    onFilterChange: (filters: Partial<ProductFiltersType>) => void;
}

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-8 w-[200px] lg:w-[300px]"
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
                />
            </div>

            <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                    onFilterChange({
                        type: value === 'all' ? undefined : value as ProductType,
                        page: 1
                    })
                }
            >
                <SelectTrigger className="w-[150px]">
                    <Package className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value={ProductType.TIRE}>Tires</SelectItem>
                    <SelectItem value={ProductType.BALE}>Bales</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.grade || 'all'}
                onValueChange={(value) =>
                    onFilterChange({
                        grade: value === 'all' ? undefined : value as ProductGrade,
                        page: 1
                    })
                }
            >
                <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value={ProductGrade.A}>Grade A</SelectItem>
                    <SelectItem value={ProductGrade.B}>Grade B</SelectItem>
                    <SelectItem value={ProductGrade.C}>Grade C</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                    type="number"
                    placeholder="Min Price"
                    className="w-[120px]"
                    value={filters.minPrice || ''}
                    onChange={(e) => onFilterChange({
                        minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        page: 1
                    })}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                    type="number"
                    placeholder="Max Price"
                    className="w-[120px]"
                    value={filters.maxPrice || ''}
                    onChange={(e) => onFilterChange({
                        maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        page: 1
                    })}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="in-stock"
                    checked={filters.inStock || false}
                    onCheckedChange={(checked) => onFilterChange({ inStock: checked, page: 1 })}
                />
                <Label htmlFor="in-stock" className="text-sm">
                    In Stock Only
                </Label>
            </div>
        </div>
    );
}