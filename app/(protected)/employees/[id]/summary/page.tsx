'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StoreStaffSummary } from '@/types';
import EmployeeAPI from '@/lib/api/employees';
import StoreAPI from '@/lib/api/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Download,
    Users,
    BarChart3,
    TrendingUp,
    Calendar,
    Building,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { StoreStaffSummaryComponent } from '@/components/employees/store-staff-summary';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function StoreStaffSummaryPage() {
    const params = useParams();
    const router = useRouter();
    const { accessToken } = useAuth();

    const storeId = params.storeId as string;
    const [summary, setSummary] = useState<StoreStaffSummary | null>(null);
    const [storeName, setStoreName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'current' | 'month' | 'quarter' | 'year'>('current');
    const [activeTab, setActiveTab] = useState('overview');

    const loadStoreData = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            const [storeData, summaryData] = await Promise.all([
                StoreAPI.getStore(accessToken, storeId),
                EmployeeAPI.getStoreStaffSummary(accessToken, storeId)
            ]);

            setStoreName(storeData.name);
            setSummary({
                ...summaryData,
                period
            });
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to load store staff summary',
            });
            router.push('/workforce/employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStoreData();
    }, [storeId, accessToken, period]);

    const handleExportSummary = async () => {
        if (!accessToken || !storeId) return;

        try {
            // Create a blob with summary data
            const summaryText = JSON.stringify(summary, null, 2);
            const blob = new Blob([summaryText], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `staff-summary-${storeName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Success', {
                description: 'Staff summary exported successfully',
            });
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to export summary',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading staff summary...</p>
                </div>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/workforce/employees')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Employees
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Staff Summary</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{storeName}</span>
                            <Badge variant="outline">
                                <Users className="h-3 w-3 mr-1" />
                                {summary.summary.totalEmployees} employees
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                        <SelectTrigger className="w-[150px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={loadStoreData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>

                    <Button variant="outline" onClick={handleExportSummary}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="distribution">
                        <Users className="h-4 w-4 mr-2" />
                        Distribution
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="turnover">
                        <Calendar className="h-4 w-4 mr-2" />
                        Turnover
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <StoreStaffSummaryComponent summary={summary} />
                </TabsContent>

                <TabsContent value="distribution">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Distribution</CardTitle>
                            <CardDescription>
                                Breakdown of employees by role and position
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-4">By Role</h4>
                                    <div className="space-y-3">
                                        {summary.byRole.map((role) => (
                                            <div key={role.role} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor: role.role === 'ADMIN' ? '#8884d8' :
                                                                role.role === 'MANAGER' ? '#82ca9d' :
                                                                        role.role === 'CASHIER' ? '#ff8042' : '#0088fe'
                                                        }}
                                                    ></div>
                                                    <span className="text-sm">{role.role}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{role.count}</span>
                                                    <span className="text-sm text-muted-foreground w-12">
                                                        ({role.percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-4">By Position</h4>
                                    <div className="space-y-3">
                                        {summary.byPosition.slice(0, 10).map((position) => (
                                            <div key={position.position} className="flex items-center justify-between">
                                                <span className="text-sm">{position.position}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{position.count}</span>
                                                    <span className="text-sm text-muted-foreground w-12">
                                                        ({position.percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Analysis</CardTitle>
                            <CardDescription>
                                Employee performance distribution and top performers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-4">Performance Distribution</h4>
                                    <div className="space-y-3">
                                        {summary.performanceDistribution.map((dist) => (
                                            <div key={dist.range} className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-sm">{dist.range}% Range</span>
                                                    <span className="font-medium">
                                                        {dist.count} employees ({dist.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-secondary rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${dist.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-4">Top Performers</h4>
                                    <div className="space-y-3">
                                        {summary.topPerformers.slice(0, 10).map((performer, index) => (
                                            <div key={performer.employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                                        <span className="text-xs font-medium">{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{performer.name}</p>
                                                        <p className="text-sm text-muted-foreground">{performer.position}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{performer.performanceScore.toFixed(1)}%</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${performer.salesRevenue.toLocaleString()} revenue
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="turnover">
                    <Card>
                        <CardHeader>
                            <CardTitle>Turnover Analysis</CardTitle>
                            <CardDescription>
                                Employee turnover rates and trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Monthly Turnover</p>
                                        <div className="text-3xl font-bold">
                                            {summary.turnover.monthlyTurnoverRate.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last 30 days
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Quarterly Turnover</p>
                                        <div className="text-3xl font-bold">
                                            {summary.turnover.quarterlyTurnoverRate.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last 90 days
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Yearly Turnover</p>
                                        <div className="text-3xl font-bold">
                                            {summary.turnover.yearlyTurnoverRate.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last 365 days
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Voluntary Turnovers</p>
                                        <div className="text-3xl font-bold">
                                            {summary.turnover.voluntaryTurnovers}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Employees who left voluntarily
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Involuntary Turnovers</p>
                                        <div className="text-3xl font-bold">
                                            {summary.turnover.involuntaryTurnovers}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Terminations and dismissals
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-3">Turnover Context</h4>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="font-medium">Industry Average:</span> 15-20% annual turnover
                                        </p>
                                        <p>
                                            <span className="font-medium">Healthy Range:</span> 10-15% annual turnover
                                        </p>
                                        <p>
                                            <span className="font-medium">Current Status:</span>
                                            {summary.turnover.yearlyTurnoverRate < 10 ?
                                                ' Excellent (Below healthy range)' :
                                                summary.turnover.yearlyTurnoverRate < 15 ?
                                                    ' Good (Within healthy range)' :
                                                    summary.turnover.yearlyTurnoverRate < 20 ?
                                                        ' Fair (Within industry average)' :
                                                        ' Needs Attention (Above industry average)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}