// components/dashboard/products/product-stats-cards.tsx
"use client";

import { ProductMetrics } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign, AlertTriangle, BarChart3, Layers } from "lucide-react";

interface ProductStatsCardsProps {
    metrics: ProductMetrics;
}

export default function ProductStatsCards({ metrics }: ProductStatsCardsProps) {
    const {
        totalProducts,
        totalValue,
        totalQuantity,
        stockStatus,
        alerts
    } = metrics;

    const cards = [
        {
            title: "Total Products",
            value: totalProducts.toLocaleString(),
            description: "Different SKUs",
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Inventory Value",
            value: `M${totalValue.toLocaleString()}`,
            description: "Total stock worth",
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Total Units",
            value: totalQuantity.toLocaleString(),
            description: "All items in stock",
            icon: Layers,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Low Stock",
            value: stockStatus.lowStock,
            description: "Need restocking",
            icon: AlertTriangle,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "Out of Stock",
            value: stockStatus.outOfStock,
            description: "Zero quantity items",
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            title: "Growth",
            value: `+${metrics.recentAdditions}`,
            description: "New products (30d)",
            icon: TrendingUp,
            color: "text-teal-600",
            bgColor: "bg-teal-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className={`p-2 rounded-full ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}