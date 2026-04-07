'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import EmployeeAPI from '@/lib/api/employees';
import type { Employee } from '@/types';

interface StaffPerformanceProps {
    token: string;
    storeId?: string;
    detailed?: boolean;
}

export function StaffPerformance({ token, storeId, detailed = false }: StaffPerformanceProps) {
    const [staff, setStaff] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await EmployeeAPI.getEmployees(token, {
                    storeId,
                    limit: detailed ? 50 : 5
                });

                setStaff(response.data);
            } catch (error) {
                console.error('Failed to fetch staff:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStaff();
        }
    }, [token, storeId, detailed]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const displayStaff = detailed ? staff : staff.slice(0, 3);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {displayStaff.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No staff data available</p>
                    ) : (
                        displayStaff.map((member) => {
                            // This would come from actual performance metrics API
                            const performance = {
                                sales: Math.floor(Math.random() * 20000) + 5000,
                                transactions: Math.floor(Math.random() * 60) + 20,
                                rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                                trend: Math.random() > 0.3 ? '+12%' : '-2%'
                            };

                            return (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {member.user?.firstName} {member.user?.lastName}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{member.position}</span>
                                                <span>•</span>
                                                <div className="flex items-center">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                                    {performance.rating}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">LSL {performance.sales.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 text-sm">
                                            {performance.trend.startsWith('+') ? (
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={performance.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                                                {performance.trend}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {!detailed && staff.length > 3 && (
                        <Button variant="outline" className="w-full" asChild>
                            <a href="/employees">View All Staff</a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}