'use client';

import { StoreStaffSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    TooltipProps
} from 'recharts';
import {
    Users,
    UserCheck,
    UserCog,
    UserX,
    DollarSign,
    Calendar,
    Award,
    TrendingUp,
    TrendingDown,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface StoreStaffSummaryProps {
    summary: StoreStaffSummary;
}

const ROLE_COLORS = {
    ADMIN: '#8884d8',
    MANAGER: '#82ca9d',
    SUPERVISOR: '#ffc658',
    CASHIER: '#ff8042',
    WAREHOUSE: '#0088fe'
};

const PERFORMANCE_COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#10b981'];

interface RoleDataItem {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

interface PerformanceDataItem {
    range: string;
    count: number;
    percentage: number;
}

interface PositionDataItem {
    name: string;
    count: number;
    percentage: number;
}

export function StoreStaffSummaryComponent({ summary }: StoreStaffSummaryProps) {
    const tenureInMonths = summary.summary.averageTenure;
    const tenureYears = Math.floor(tenureInMonths / 12);
    const tenureMonths = tenureInMonths % 12;

    // Prepare data for role distribution
    const roleData: RoleDataItem[] = summary.byRole.map(role => ({
        name: role.role,
        value: role.count,
        percentage: role.percentage,
        color: ROLE_COLORS[role.role as keyof typeof ROLE_COLORS] || '#8884d8'
    }));

    // Prepare data for performance distribution
    const performanceData: PerformanceDataItem[] = summary.performanceDistribution.map(dist => ({
        range: dist.range,
        count: dist.count,
        percentage: dist.percentage
    }));

    // Prepare data for position distribution
    const positionData: PositionDataItem[] = summary.byPosition.slice(0, 10).map(pos => ({
        name: pos.position,
        count: pos.count,
        percentage: pos.percentage
    }));

    // Custom Pie label renderer
    const renderPieLabel = (props: {
        cx: number;
        cy: number;
        midAngle: number;
        innerRadius: number;
        outerRadius: number;
        percent: number;
        index: number;
        name: string;
        value: number;
        payload?: RoleDataItem;
    }) => {
        const RADIAN = Math.PI / 180;
        const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.5;
        const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
        const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);
        
        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight="500"
            >
                {`${props.name}: ${props.payload?.percentage || 0}%`}
            </text>
        );
    };

    // Custom tooltip formatter for Pie chart
    const pieTooltipFormatter = (
        value: number | undefined,
        name: string,
        props: { payload?: RoleDataItem }
    ): [string, string] => {
        const percentage = props.payload?.percentage || 0;
        const displayValue = value || 0;
        return [`${displayValue} employees (${percentage}%)`, props.payload?.name || name];
    };

    // Custom tooltip formatter for Bar chart
    const barTooltipFormatter = (
        value: number | undefined,
        name: string,
        props: { payload?: PerformanceDataItem }
    ): [string, string] => {
        const displayValue = value || 0;
        return [`${displayValue} employees`, 'Count'];
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.summary.totalEmployees}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <UserCheck className="h-3 w-3 mr-1 text-green-600" />
                            {summary.summary.activeEmployees} active
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Staff Status</CardTitle>
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Active</span>
                                <span className="font-medium">{summary.summary.activeEmployees}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>On Leave</span>
                                <span className="font-medium">{summary.summary.onLeave}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Terminated</span>
                                <span className="font-medium">{summary.summary.terminated}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Tenure</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tenureYears > 0 ? `${tenureYears}y ` : ''}{tenureMonths}m
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average time with company
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                        <CardDescription>Breakdown of employees by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData as any}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderPieLabel as any}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={pieTooltipFormatter as any} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Distribution</CardTitle>
                        <CardDescription>Employee performance scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip formatter={barTooltipFormatter as any} />
                                    <Legend />
                                    <Bar dataKey="count" name="Employee Count" fill="#8884d8">
                                        {performanceData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Turnover & Top Performers */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Turnover Analysis</CardTitle>
                        <CardDescription>Employee turnover rates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Monthly Turnover</span>
                                    <span className="font-medium">{summary.turnover.monthlyTurnoverRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={summary.turnover.monthlyTurnoverRate} className="h-2" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Quarterly Turnover</span>
                                    <span className="font-medium">{summary.turnover.quarterlyTurnoverRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={summary.turnover.quarterlyTurnoverRate} className="h-2" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Yearly Turnover</span>
                                    <span className="font-medium">{summary.turnover.yearlyTurnoverRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={summary.turnover.yearlyTurnoverRate} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Voluntary Turnovers</p>
                                    <p className="text-2xl font-bold">{summary.turnover.voluntaryTurnovers}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Involuntary Turnovers</p>
                                    <p className="text-2xl font-bold">{summary.turnover.involuntaryTurnovers}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                        <CardDescription>Best performing employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.topPerformers.slice(0, 5).map((performer, index) => (
                                <div key={performer.employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                            <span className="text-sm font-medium">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{performer.name}</p>
                                            <p className="text-sm text-muted-foreground">{performer.position}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-yellow-600" />
                                            <span className="font-bold">{performer.performanceScore.toFixed(1)}%</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            ${performer.salesRevenue.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Hires & Position Distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Hires</CardTitle>
                        <CardDescription>Employees hired in the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {summary.recentHires.slice(0, 5).map((hire) => (
                                <div key={hire.employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{hire.name}</p>
                                        <p className="text-sm text-muted-foreground">{hire.position}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline">
                                            {format(new Date(hire.hireDate), 'MMM d')}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(hire.hireDate), 'yyyy')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {summary.recentHires.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">
                                    No recent hires
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Position Distribution</CardTitle>
                        <CardDescription>Top positions in the store</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {positionData.map((position) => (
                                <div key={position.name} className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">{position.name}</span>
                                        <span className="font-medium">{position.count} ({position.percentage}%)</span>
                                    </div>
                                    <Progress value={position.percentage} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}