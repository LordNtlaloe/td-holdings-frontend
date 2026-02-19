'use client';

import { Product } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Package } from "lucide-react";
import { ProductCard } from "./products-card";

interface ProductsGridProps {
    products: Product[];
    cart: any[];
    transactionType: "retail" | "wholesale" | "transfer";
    onAddToCart: (product: Product) => void;
    getProductAvailability: (product: Product) => number;
    loading?: boolean;
}

export const ProductsGrid = ({
    products,
    cart,
    transactionType,
    onAddToCart,
    getProductAvailability,
    loading = false,
}: ProductsGridProps) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="overflow-hidden h-full flex flex-col">
                        <div className="h-40 bg-muted animate-pulse" />
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="h-5 w-32 bg-muted rounded mb-2 animate-pulse" />
                            <div className="h-4 w-full bg-muted rounded mb-2 animate-pulse" />
                            <div className="h-4 w-3/4 bg-muted rounded mb-2 animate-pulse" />
                            <div className="h-4 w-1/2 bg-muted rounded mb-4 animate-pulse" />
                            <div className="h-10 w-full bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                    {products.map((product, index) => {
                        const availability = getProductAvailability(product);
                        const cartItem = cart.find((item) => item.product.id === product.id);

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15, delay: index * 0.02 }}
                            >
                                <ProductCard
                                    product={product}
                                    availability={availability}
                                    isInCart={!!cartItem}
                                    cartQuantity={cartItem?.quantity}
                                    transactionType={transactionType}
                                    onAddToCart={onAddToCart}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {products.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
            )}
        </>
    );
};