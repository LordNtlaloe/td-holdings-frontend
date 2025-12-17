import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { ProductCard } from '@/components/products/products-card';
import { ProductTable } from '@/components/products/products-table';
import { Product } from '@/types';

interface ProductContentProps {
    products: Product[];
    viewMode: 'grid' | 'table';
    filters: any;
    onShowCreateForm: () => void;
    onEdit: (product: Product) => void;
    onArchive: (productId: string) => void;
    onManageInventory: (productId: string) => void;
    onView: (productId: string) => void;
    userRole?: string;
}

export function ProductContent({
    products,
    viewMode,
    filters,
    onShowCreateForm,
    onEdit,
    onArchive,
    onManageInventory,
    onView,
    userRole
}: ProductContentProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2">
                    {filters.search || filters.type || filters.grade || filters.commodity ?
                        'Try adjusting your filters' :
                        'Get started by adding your first product'}
                </p>
                {!filters.search && !filters.type && !filters.grade && !filters.commodity && (
                    <Button className="mt-4" onClick={onShowCreateForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                )}
            </div>
        );
    }

    return viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onManageInventory={onManageInventory}
                    onView={() => onView(product.id)}
                    showActions={userRole === 'ADMIN' || userRole === 'MANAGER'}
                />
            ))}
        </div>
    ) : (
        <ProductTable
            products={products}
            onEdit={onEdit}
            onArchive={onArchive}
            onManageInventory={onManageInventory}
            onView={onView}
        />
    );
}