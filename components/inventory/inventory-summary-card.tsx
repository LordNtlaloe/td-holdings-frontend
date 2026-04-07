// components/inventory/InventorySummaryCards.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { InventorySummary } from '@/types';
import InventoryAPI from '@/lib/api/inventory';

interface InventorySummaryCardsProps {
    summary: InventorySummary;
}

const InventorySummaryCards = ({ summary }: InventorySummaryCardsProps) => {
    const cards = [
        {
            title: 'Total Products',
            value: summary.summary.totalProducts,
            icon: Package,
            color: 'bg-blue-500',
            description: 'Unique products in stock'
        },
        {
            title: 'Total Quantity',
            value: summary.summary.totalQuantity,
            icon: Package,
            color: 'bg-green-500',
            description: 'Total units in inventory'
        },
        {
            title: 'Total Value',
            value: InventoryAPI.formatCurrency(summary.summary.totalValue),
            icon: DollarSign,
            color: 'bg-purple-500',
            description: 'Total inventory value'
        },
        {
            title: 'Low Stock Items',
            value: summary.summary.lowStockProducts,
            icon: AlertTriangle,
            color: 'bg-yellow-500',
            description: 'Items below reorder level'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </p>
                                <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${card.color}`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default InventorySummaryCards;