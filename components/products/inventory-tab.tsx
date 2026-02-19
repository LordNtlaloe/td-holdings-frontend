'use client';

import { Product, Store } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { ProductTable } from "./products-table";
import { toast } from "sonner";
import { StoreSelector } from "./store-selector";

interface InventoryTabProps {
    products: Product[];
    stores: Store[];
    accessToken: string | null;
    onViewProduct: (product: Product) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (product: Product) => void;
    onArchiveProduct: (product: Product) => void;
}

export const InventoryTab = ({
    products,
    stores,
    accessToken,
    onViewProduct,
    onEditProduct,
    onDeleteProduct,
    onArchiveProduct,
}: InventoryTabProps) => {
    const handleViewStoreInventory = (store: Store) => {
        toast.info("Store Inventory", {
            description: `Viewing inventory for ${store.name}`,
        });
        // You could navigate to store-specific inventory view
        // router.push(`/stores/${store.id}/inventory`);
    };

    if (!accessToken || stores.length === 0) {
        return (
            <Card>
                <CardContent>
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">
                            No stores found or not authenticated
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Store Inventory</CardTitle>
                <CardDescription>
                    View inventory distribution across stores
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <StoreSelector
                        stores={stores}
                        onViewStore={handleViewStoreInventory}
                    />

                    <ProductTable
                        products={products}
                        stores={stores}
                        onView={onViewProduct}
                        onEdit={onEditProduct}
                        onDelete={onDeleteProduct}
                        onArchive={onArchiveProduct}
                        showStoreDetails={true}
                    />
                </div>
            </CardContent>
        </Card>
    );
};