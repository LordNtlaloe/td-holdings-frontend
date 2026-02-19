'use client';

import { LowStockProduct } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { ProductTable } from "./products-table";

interface AlertsTabProps {
    lowStockProducts: LowStockProduct[];
    onViewProduct: (product: any) => void;
    onEditProduct?: (product: any) => void;
    isCashier: boolean;
}

export const AlertsTab = ({
    lowStockProducts,
    onViewProduct,
    onEditProduct,
    isCashier,
}: AlertsTabProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>
                    {isCashier
                        ? "Products in your store that need restocking"
                        : "Products that need restocking across all stores"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {lowStockProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">
                            No low stock alerts at this time
                        </p>
                    </div>
                ) : (
                    <ProductTable
                        products={lowStockProducts.map((p) => p.product)}
                        onView={onViewProduct}
                        onEdit={onEditProduct}
                        showActions={false}
                    />
                )}
            </CardContent>
        </Card>
    );
};