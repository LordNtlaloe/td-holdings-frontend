import { Product, ProductFormData, Store } from "@/types";

export const transformProductToFormData = (product: Product): ProductFormData => {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        type: product.type,
        grade: product.grade,
        commodity: product.commodity,
        // Transform tire-specific fields
        tireCategory: product.tireCategory,
        tireUsage: product.tireUsage,
        tireSize: product.tireSize,
        loadIndex: product.loadIndex,
        speedRating: product.speedRating,
        warrantyPeriod: product.warrantyPeriod,
        // Transform bale-specific fields
        baleWeight: product.baleWeight,
        baleCategory: product.baleCategory,
        originCountry: product.originCountry,
        importDate: product.importDate,
        // Transform inventories
        storeAssignments: product.inventories?.map(inv => ({
            storeId: inv.storeId,
            store: inv.store,
            quantity: inv.quantity,
            reorderLevel: inv.reorderLevel,
            optimalLevel: inv.optimalLevel,
            storePrice: inv.storePrice,
            isAssigned: true
        })),
        isActive: product.isActive,
    };
};

export const transformStoresForForm = (stores: Store[]) => {
    return stores.map(store => ({
        id: store.id,
        name: store.name,
        isMainStore: store.isMainStore || false
    }));
};

export const transformPriceStatsToRanges = (priceStats: any) => {
    const minPrice = priceStats?.minPrice || 0;
    const maxPrice = priceStats?.maxPrice || 1000;
    const rangeSize = Math.ceil((maxPrice - minPrice) / 5) || 1;

    const ranges = [];
    for (let i = 0; i < 5; i++) {
        const start = minPrice + (i * rangeSize);
        const end = minPrice + ((i + 1) * rangeSize);
        ranges.push({
            range: `LSL${start.toFixed(0)}-LSL${end.toFixed(0)}`,
            count: 0,
        });
    }
    return ranges;
};