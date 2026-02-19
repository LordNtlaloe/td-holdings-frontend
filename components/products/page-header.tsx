'use client';

import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Plus } from "lucide-react";
import { Role } from "@/types";

interface ProductsPageHeaderProps {
    isAdminOrManager: boolean;
    isCashier: boolean;
    onRefresh: () => void;
    onExport: () => void;
    onAddProduct: () => void;
    loading?: boolean;
}

export const ProductsPageHeader = ({
    isAdminOrManager,
    isCashier,
    onRefresh,
    onExport,
    onAddProduct,
    loading = false,
}: ProductsPageHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">
                    {isCashier
                        ? "View products in your store"
                        : "Manage your product catalog across all stores"}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
                {isAdminOrManager && (
                    <>
                        <Button variant="outline" onClick={onExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button onClick={onAddProduct}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};