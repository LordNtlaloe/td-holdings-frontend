'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { SalesByEmployee } from '../admin/sales-by-employee';
import { SalesByStore } from '../admin/sales-by-store';
import { SalesTrendChart } from '../admin/sales-trend-chart';
import { PaymentMethodsChart } from '../admin/payment-method-chart';

interface SalesMetricsProps {
    token: string;
    dateRange?: DateRange;
}

export function SalesMetrics({ token, dateRange }: SalesMetricsProps) {
    // Ensure we have valid dates for the child components
    const validDateRange = dateRange?.from && dateRange?.to
        ? { from: dateRange.from, to: dateRange.to }
        : undefined;

    return (
        <div className="space-y-4">
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="by-store">By Store</TabsTrigger>
                    <TabsTrigger value="by-employee">By Employee</TabsTrigger>
                    <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <SalesTrendChart
                        token={token}
                        dateRange={validDateRange}
                    />
                </TabsContent>

                <TabsContent value="by-store">
                    <SalesByStore
                        token={token}
                        dateRange={validDateRange}
                    />
                </TabsContent>

                <TabsContent value="by-employee">
                    <SalesByEmployee
                        token={token}
                        dateRange={validDateRange}
                    />
                </TabsContent>

                <TabsContent value="payment-methods">
                    <PaymentMethodsChart
                        token={token}
                        dateRange={validDateRange}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}