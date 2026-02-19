'use client';

import { RefreshCw } from "lucide-react";

export const ProductsLoadingState = () => {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading products...</p>
            </div>
        </div>
    );
};