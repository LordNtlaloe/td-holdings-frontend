'use client';

import { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProductTable } from "./products-table";

interface RecentProductsTableProps {
    products: Product[];
    onView: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
    showActions?: boolean;
}

export const RecentProductsTable = ({
    products,
    onView,
    onEdit,
    onDelete,
    showActions = false,
}: RecentProductsTableProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>
                    Recently added or updated products
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProductTable
                    products={products}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    showActions={showActions}
                />
            </CardContent>
        </Card>
    );
};