'use client';

import { useState } from "react";
import { Product, ProductFilters } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3x3, Table as TableIcon, Package } from "lucide-react";
import { ProductFilter } from "./product-filters";
import { ProductTable } from "./products-table";
import { ProductCard } from "./products-card";

interface ProductsTabProps {
    products: Product[];
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
    onResetFilters: () => void;
    onViewProduct: (product: Product) => void;
    onEditProduct?: (product: Product) => void;
    onDeleteProduct?: (product: Product) => void;
    onArchiveProduct?: (product: Product) => void;
    isAdminOrManager: boolean;
}

export const ProductsTab = ({
    products,
    filters,
    onFilterChange,
    onResetFilters,
    onViewProduct,
    onEditProduct,
    onDeleteProduct,
    onArchiveProduct,
    isAdminOrManager,
}: ProductsTabProps) => {
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Product Catalog</CardTitle>
                        <CardDescription>
                            {products.length} products found
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <ProductFilter
                            filters={filters}
                            onFilterChange={onFilterChange}
                            onReset={onResetFilters}
                        />
                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                className="rounded-r-none"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="sm"
                                className="rounded-l-none"
                                onClick={() => setViewMode("table")}
                            >
                                <TableIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                        <p className="text-muted-foreground mt-2">
                            {filters.name || filters.type || filters.grade
                                ? "Try adjusting your filters"
                                : "Get started by adding your first product"}
                        </p>
                    </div>
                ) : viewMode === "table" ? (
                    <ProductTable
                        products={products}
                        onView={onViewProduct}
                        onEdit={isAdminOrManager ? onEditProduct : undefined}
                        onDelete={isAdminOrManager ? onDeleteProduct : undefined}
                        onArchive={isAdminOrManager ? onArchiveProduct : undefined}
                        showActions={isAdminOrManager}
                    />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onView={onViewProduct}
                                onEdit={isAdminOrManager ? onEditProduct : undefined}
                                onDelete={isAdminOrManager ? onDeleteProduct : undefined}
                                onArchive={isAdminOrManager ? onArchiveProduct : undefined}
                                showActions={isAdminOrManager}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};