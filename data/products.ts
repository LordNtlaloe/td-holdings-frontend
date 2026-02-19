// data/products.ts (updated)
export interface Product {
    id: number
    name: string
    category: 'tires' | 'bales'
    subcategory: string
    price: number
    originalPrice?: number
    discount?: number
    stock: 'In Stock' | 'Low Stock' | 'Out of Stock'
    rating: number
    reviewCount: number
    // NEW: Add purchase data
    purchaseCount: number
    monthlySales?: number
    trending?: boolean
    bestSeller?: boolean
    image: string
    features: string[]
    description: string
    brand?: string
    size?: string
    weight?: string
    // Filter attributes
    season?: 'all-season' | 'winter' | 'summer' | 'performance'
    vehicleType?: 'sedan' | 'suv' | 'truck' | 'performance'
    baleType?: 'hay' | 'straw' | 'alfalfa' | 'mixed'
    unit?: 'each' | 'bundle'
}

// data/products.ts (add these type definitions)
export type FilterState = {
    category: 'tires' | 'bales' | 'all'
    season: string[]
    vehicleType: string[]
    baleType: string[]
    priceRange?: { min: number; max: number }
    minRating?: number
    inStock: boolean
    onSale: boolean
}

// data/products.ts (add this after your products array)

// Filter options
export const filterOptions = {
    categories: ['tires', 'bales'] as const,
    tireSeasons: ['all-season', 'winter', 'summer', 'performance'] as const,
    vehicleTypes: ['sedan', 'suv', 'truck', 'performance'] as const,
    baleTypes: ['hay', 'straw', 'alfalfa', 'mixed'] as const,
    priceRanges: [
        { label: 'Under LSL 100', min: 0, max: 100 },
        { label: 'LSL 100 - LSL 200', min: 100, max: 200 },
        { label: 'LSL 200 - LSL 300', min: 200, max: 300 },
        { label: 'Over LSL 300', min: 300, max: Infinity }
    ],
    ratings: [4, 3, 2, 1] as const,
    stockStatus: ['In Stock', 'Low Stock', 'Out of Stock'] as const
}

export const products: Product[] = [
    // Tire Products
    {
        id: 1,
        name: "All-Season Performance Tire",
        category: 'tires',
        subcategory: 'all-season',
        price: 129.99,
        originalPrice: 159.99,
        discount: 19,
        stock: 'In Stock',
        rating: 4.8,
        reviewCount: 124,
        purchaseCount: 245, // Added
        monthlySales: 45, // Added
        trending: true, // Added
        bestSeller: true, // Added
        image: "🚗",
        features: ["All-weather traction", "Fuel efficient", "80,000 km warranty"],
        description: "Premium all-season tires offering excellent performance in various weather conditions.",
        brand: "TD Holdings",
        size: "225/45R17",
        season: 'all-season',
        vehicleType: 'sedan'
    },
    {
        id: 2,
        name: "Winter Grip Pro",
        category: 'tires',
        subcategory: 'winter',
        price: 159.99,
        stock: 'In Stock',
        rating: 4.9,
        reviewCount: 89,
        purchaseCount: 187, // Added
        monthlySales: 32, // Added
        trending: true, // Added
        image: "❄️",
        features: ["Ice & snow traction", "Deep tread pattern", "Studdable"],
        description: "Specialized winter tires designed for maximum safety in snow and icy conditions.",
        brand: "ArcticTread",
        size: "205/55R16",
        season: 'winter',
        vehicleType: 'suv'
    },
    {
        id: 3,
        name: "Off-Road Beast XT",
        category: 'tires',
        subcategory: 'off-road',
        price: 189.99,
        stock: 'Low Stock',
        rating: 4.7,
        reviewCount: 67,
        purchaseCount: 123, // Added
        monthlySales: 18, // Added
        bestSeller: true, // Added
        image: "🏔️",
        features: ["Reinforced sidewalls", "Mud & rock traction", "Self-cleaning tread"],
        description: "Rugged off-road tires built for tough terrains and adventurous driving.",
        brand: "TrailMaster",
        size: "265/70R17",
        season: 'all-season',
        vehicleType: 'truck'
    },
    {
        id: 4,
        name: "Sport Racing Elite",
        category: 'tires',
        subcategory: 'performance',
        price: 229.99,
        originalPrice: 279.99,
        discount: 18,
        stock: 'In Stock',
        rating: 5.0,
        reviewCount: 45,
        purchaseCount: 89, // Added
        monthlySales: 12, // Added
        image: "🏁",
        features: ["High-speed rated", "Ultra-grip compound", "Precision handling"],
        description: "High-performance racing tires for sports cars and enthusiasts.",
        brand: "VelocityPro",
        size: "245/35R20",
        season: 'performance',
        vehicleType: 'performance'
    },
    {
        id: 5,
        name: "Truck Heavy Duty",
        category: 'tires',
        subcategory: 'truck',
        price: 199.99,
        stock: 'In Stock',
        rating: 4.8,
        reviewCount: 56,
        purchaseCount: 156, // Added
        monthlySales: 28, // Added
        trending: true, // Added
        image: "🚚",
        features: ["Heavy load capacity", "Long-lasting tread", "All-position"],
        description: "Durable tires designed for commercial trucks and heavy vehicles.",
        brand: "TD Holdings",
        size: "285/75R16",
        season: 'all-season',
        vehicleType: 'truck'
    },

    // Bale Products
    {
        id: 6,
        name: "Premium Hay Bales",
        category: 'bales',
        subcategory: 'hay',
        price: 12.50,
        stock: 'In Stock',
        rating: 4.6,
        reviewCount: 156,
        purchaseCount: 432, // Added
        monthlySales: 120, // Added
        bestSeller: true, // Added
        trending: true, // Added
        image: "🌾",
        features: ["Fresh harvest", "High nutrition", "Tightly packed"],
        description: "Premium quality hay bales perfect for livestock feeding.",
        weight: "50 lbs",
        baleType: 'hay',
        unit: 'each'
    },
    {
        id: 7,
        name: "Alfalfa Premium",
        category: 'bales',
        subcategory: 'alfalfa',
        price: 18.99,
        stock: 'In Stock',
        rating: 4.9,
        reviewCount: 92,
        purchaseCount: 287, // Added
        monthlySales: 75, // Added
        bestSeller: true, // Added
        image: "🍀",
        features: ["High protein", "Organic", "No pesticides"],
        description: "Nutrient-rich alfalfa bales for horses and high-value livestock.",
        weight: "60 lbs",
        baleType: 'alfalfa',
        unit: 'each'
    },
    {
        id: 8,
        name: "Straw Bales Standard",
        category: 'bales',
        subcategory: 'straw',
        price: 8.99,
        originalPrice: 11.99,
        discount: 25,
        stock: 'In Stock',
        rating: 4.4,
        reviewCount: 78,
        purchaseCount: 345, // Added
        monthlySales: 95, // Added
        trending: true, // Added
        image: "🌿",
        features: ["Versatile use", "Good bedding", "Economical"],
        description: "Standard straw bales suitable for bedding, mulching, and crafts.",
        weight: "40 lbs",
        baleType: 'straw',
        unit: 'each'
    },
    {
        id: 9,
        name: "Mixed Grass Bales",
        category: 'bales',
        subcategory: 'mixed',
        price: 15.99,
        stock: 'Low Stock',
        rating: 4.5,
        reviewCount: 63,
        purchaseCount: 198, // Added
        monthlySales: 45, // Added
        image: "🌱",
        features: ["Variety blend", "Balanced nutrition", "All-season"],
        description: "Mixed grass bales offering a balanced diet for various livestock.",
        weight: "55 lbs",
        baleType: 'mixed',
        unit: 'each'
    },
    {
        id: 10,
        name: "Organic Hay Bundle",
        category: 'bales',
        subcategory: 'hay',
        price: 22.99,
        stock: 'In Stock',
        rating: 4.8,
        reviewCount: 47,
        purchaseCount: 134, // Added
        monthlySales: 32, // Added
        image: "♻️",
        features: ["Certified organic", "Chemical-free", "Bundle of 3"],
        description: "Certified organic hay bales in convenient bundles.",
        weight: "50 lbs",
        baleType: 'hay',
        unit: 'bundle'
    }
]

// Add these helper functions to your existing file:

export function getTopSellingProducts(count: number = 6): Product[] {
    return [...products]
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, count)
}

export function getBestSellers(count: number = 4): Product[] {
    return [...products]
        .filter(p => p.bestSeller)
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, count)
}

export function getTrendingProducts(count: number = 4): Product[] {
    return [...products]
        .filter(p => p.trending)
        .sort((a, b) => (b.monthlySales || 0) - (a.monthlySales || 0))
        .slice(0, count)
}

export function getTopByCategory(category: 'tires' | 'bales', count: number = 3): Product[] {
    return [...products]
        .filter(p => p.category === category)
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, count)
}


export function filterProducts(
    products: Product[],
    filters: {
        category?: 'tires' | 'bales' | 'all'
        season?: string[]
        vehicleType?: string[]
        baleType?: string[]
        priceRange?: { min: number; max: number }
        minRating?: number
        inStock?: boolean
    }
): Product[] {
    let filtered = [...products]

    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(p => p.category === filters.category)
    }

    if (filters.season && filters.season.length > 0) {
        filtered = filtered.filter(p => p.season && filters.season?.includes(p.season))
    }

    if (filters.vehicleType && filters.vehicleType.length > 0) {
        filtered = filtered.filter(p => p.vehicleType && filters.vehicleType?.includes(p.vehicleType))
    }

    if (filters.baleType && filters.baleType.length > 0) {
        filtered = filtered.filter(p => p.baleType && filters.baleType?.includes(p.baleType))
    }

    if (filters.priceRange) {
        filtered = filtered.filter(p =>
            p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
        )
    }

    if (filters.minRating) {
        filtered = filtered.filter(p => p.rating >= filters.minRating!)
    }

    if (filters.inStock) {
        filtered = filtered.filter(p => p.stock === 'In Stock')
    }

    return filtered
}