'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, Weight, Search, RefreshCw } from "lucide-react";
import { ProductType, TireUsage } from "@/types";
import { CategoryFilter, TireUsageFilter } from "@/types/pos";

interface FiltersBarProps {
    categories: CategoryFilter[];
    selectedCategory: "all" | ProductType;
    onCategoryChange: (category: "all" | ProductType) => void;
    selectedTireUsage: "all" | TireUsage;
    onTireUsageChange: (usage: "all" | TireUsage) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    loading: boolean;
    showTireFilters: boolean;
}

const tireUsageFilters: TireUsageFilter[] = [
    { id: "all", label: "All Types" },
    { id: TireUsage.FOUR_BY_FOUR, label: "4x4" },
    { id: TireUsage.REGULAR, label: "Regular" },
    { id: TireUsage.TRUCK, label: "Truck" },
];

export const FiltersBar = ({
    categories,
    selectedCategory,
    onCategoryChange,
    selectedTireUsage,
    onTireUsageChange,
    searchQuery,
    onSearchChange,
    onRefresh,
    loading,
    showTireFilters,
}: FiltersBarProps) => {
    return (
        <div className="bg-card px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Tabs
                        value={selectedCategory}
                        onValueChange={(v) => onCategoryChange(v as typeof selectedCategory)}
                        className="w-auto"
                    >
                        <TabsList>
                            {categories.map((cat) => (
                                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                                    <cat.icon className="w-4 h-4" />
                                    {cat.label}
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {cat.count}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {showTireFilters && (
                        <div className="flex items-center gap-2">
                            <Separator orientation="vertical" className="h-6" />
                            {tireUsageFilters.map((f) => (
                                <Button
                                    key={f.id}
                                    variant={selectedTireUsage === f.id ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onTireUsageChange(f.id as typeof selectedTireUsage)}
                                    className="text-xs"
                                >
                                    {f.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 w-62.5"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};