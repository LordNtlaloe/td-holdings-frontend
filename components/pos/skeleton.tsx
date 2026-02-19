'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProductCardSkeleton = () => (
    <Card className="overflow-hidden h-full flex flex-col">
        <Skeleton className="h-40 w-full" />
        <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
    </Card>
);

const CartItemSkeleton = () => (
    <div className="flex gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
            <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-10" />
            </div>
            <div className="space-y-2 mt-2">
                <Skeleton className="h-3 w-24" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-6 w-6 rounded" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const POSSkeleton = () => {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Left Sidebar Skeleton */}
            <aside className="w-18 bg-card border-r border-border flex flex-col items-center py-6 space-y-4">
                <Skeleton className="w-10 h-10 rounded-full mb-4" />
                <nav className="flex-1 flex flex-col space-y-2 w-full">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="w-full h-14 rounded-none" />
                    ))}
                </nav>
                <Skeleton className="w-full h-14 rounded-none" />
            </aside>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Skeleton */}
                <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="w-4 h-4" />
                        </div>
                    </div>
                </header>

                {/* Filters Bar Skeleton */}
                <div className="bg-card px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-96" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10" />
                            <Skeleton className="h-10 w-64" />
                        </div>
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <ScrollArea className="flex-1 bg-background p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Sidebar Skeleton */}
            <aside className="w-95 bg-card border-l border-border flex flex-col">
                {/* Order Header Skeleton */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-5">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Items Skeleton */}
                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <CartItemSkeleton key={i} />
                        ))}
                    </div>
                </ScrollArea>

                {/* Footer Skeleton */}
                <div className="border-t border-border p-6 space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                        <Skeleton className="h-5 w-full my-2" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </aside>
        </div>
    );
};