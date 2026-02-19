'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Table as TableIcon, AlertTriangle, ChartArea } from "lucide-react";

interface ProductsTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    isAdminOrManager: boolean;
}

export const ProductsTabs = ({ activeTab, onTabChange, isAdminOrManager }: ProductsTabsProps) => {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
            <TabsList className={`grid w-full ${isAdminOrManager ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="overview">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                </TabsTrigger>
                <TabsTrigger value="products">
                    <TableIcon className="h-4 w-4 mr-2" />
                    Products
                </TabsTrigger>
                <TabsTrigger value="alerts">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Alerts
                </TabsTrigger>
                {isAdminOrManager && (
                    <TabsTrigger value="inventory">
                        <ChartArea className="h-4 w-4 mr-2" />
                        Inventory
                    </TabsTrigger>
                )}
            </TabsList>
        </Tabs>
    );
};