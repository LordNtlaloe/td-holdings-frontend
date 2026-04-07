'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Star, Loader2 } from 'lucide-react';
import SalesReportsAPI from '@/lib/api/sales-report';
import { formatCurrency } from '@/lib/utils';
import type { TopEmployeeItem } from '@/types/sales';

interface SalesByEmployeeProps {
  token: string;
  storeId?: string;
  dateRange?: { from: Date; to: Date };
}

export function SalesByEmployee({ token, storeId, dateRange }: SalesByEmployeeProps) {
  const [employees, setEmployees] = useState<TopEmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const report = await SalesReportsAPI.getSalesReport(token, {
          groupBy: 'employee',
          storeId,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
        });

        setEmployees(report.report || []);
      } catch (error) {
        console.error('Failed to fetch sales by employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, storeId, dateRange]);

  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortBy === 'revenue') return b.total_revenue - a.total_revenue;
    if (sortBy === 'transactions') return b.sales_count - a.sales_count;
    if (sortBy === 'average') return b.avg_sale_amount - a.avg_sale_amount;
    return 0;
  });

  const topRevenue = sortedEmployees[0]?.total_revenue ?? 1;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employee Sales Performance</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="average">Avg Ticket</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedEmployees.map((employee, index) => {
            const rank = index + 1;
            const isTopPerformer = rank <= 3;
            const initials = employee.employee_name
              ?.split(' ')
              .map((n) => n[0])
              .join('') ?? '?';

            return (
              <div key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center font-medium text-muted-foreground">
                    #{rank}
                  </div>
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{employee.employee_name}</p>
                      {isTopPerformer && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(employee.total_revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{employee.sales_count}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(employee.avg_sale_amount)}</p>
                    <p className="text-xs text-muted-foreground">Avg Ticket</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isTopPerformer ? 'default' : 'outline'}>
                      {((employee.total_revenue / topRevenue) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}