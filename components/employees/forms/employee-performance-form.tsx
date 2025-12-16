'use client';

import { Employee } from '@/types';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

interface PerformanceReviewFormProps {
    control: Control<any>;
    employee?: Employee;
}

export function PerformanceReviewForm({ control, employee }: PerformanceReviewFormProps) {
    return (
        <>
            {employee && (
                <div className="space-y-2 p-3 bg-muted rounded-lg mb-4">
                    <div className="font-medium">Performance Review For</div>
                    <div className="text-sm text-muted-foreground">
                        {employee.user.firstName} {employee.user.lastName} • {employee.position}
                    </div>
                </div>
            )}

            <FormField
                control={control}
                name="period"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Review Period *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                <SelectItem value="YEARLY">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="score"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Performance Score (0-100) *</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g., 85"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="feedback"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Detailed Feedback *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Provide detailed feedback on employee performance..."
                                className="min-h-[120px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="goals"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Goals for Next Period *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Enter goals (one per line or comma separated)..."
                                className="min-h-[80px]"
                                {...field}
                                onChange={(e) => {
                                    const goals = e.target.value
                                        .split(/[\n,]/)
                                        .map((g: string) => g.trim())
                                        .filter((g: string) => g.length > 0);
                                    field.onChange(goals);
                                }}
                            />
                        </FormControl>
                        <FormDescription>
                            Enter goals separated by new lines or commas
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="strengths"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Strengths *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="List employee strengths..."
                                className="min-h-[80px]"
                                {...field}
                                onChange={(e) => {
                                    const strengths = e.target.value
                                        .split(/[\n,]/)
                                        .map((s: string) => s.trim())
                                        .filter((s: string) => s.length > 0);
                                    field.onChange(strengths);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="areasForImprovement"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Areas for Improvement</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="List areas where employee can improve..."
                                className="min-h-[80px]"
                                {...field}
                                onChange={(e) => {
                                    const areas = e.target.value
                                        .split(/[\n,]/)
                                        .map((a: string) => a.trim())
                                        .filter((a: string) => a.length > 0);
                                    field.onChange(areas);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}