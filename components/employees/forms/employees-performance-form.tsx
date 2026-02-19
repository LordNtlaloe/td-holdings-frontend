'use client';

import { Control, useFieldArray } from 'react-hook-form';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee, ReviewPeriod } from '@/types';
import { Plus, Trash2, Star, Target, Award, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerformanceReviewFormProps {
    control: Control<any>;
    employee?: Employee;
}

export function PerformanceReviewForm({ control, employee }: PerformanceReviewFormProps) {
    const { fields: goalFields, append: appendGoal, remove: removeGoal } = useFieldArray({
        control,
        name: 'goals'
    });

    const { fields: strengthFields, append: appendStrength, remove: removeStrength } = useFieldArray({
        control,
        name: 'strengths'
    });

    const { fields: improvementFields, append: appendImprovement, remove: removeImprovement } = useFieldArray({
        control,
        name: 'areasForImprovement'
    });

    // Get score value for color coding
    const score = control._formValues.score;

    const getScoreColor = (score: number) => {
        if (score >= 9) return 'text-green-600 bg-green-100';
        if (score >= 7) return 'text-blue-600 bg-blue-100';
        if (score >= 5) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 9) return 'Excellent';
        if (score >= 7) return 'Good';
        if (score >= 5) return 'Average';
        return 'Needs Improvement';
    };

    return (
        <div className="space-y-4">
            {/* Employee Summary */}
            {employee && (
                <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">
                        Performance Review for: {employee.user?.firstName} {employee.user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
            )}

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Review Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="reviewerId"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Reviewer ID *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter reviewer ID"
                                            {...field}
                                            value={field.value || ''}
                                            className={fieldState.error ? 'border-destructive' : ''}
                                        />
                                    </FormControl>
                                    <FormMessage>{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="period"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Review Period *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={ReviewPeriod.MONTHLY}>Monthly</SelectItem>
                                            <SelectItem value={ReviewPeriod.QUARTERLY}>Quarterly</SelectItem>
                                            <SelectItem value={ReviewPeriod.YEARLY}>Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="score"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Score (1-10) *</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="10"
                                            step="1"
                                            placeholder="8"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                field.onChange(isNaN(value) ? 8 : value);
                                            }}
                                            className={fieldState.error ? 'border-destructive' : ''}
                                        />
                                        {field.value && (
                                            <div className="flex items-center gap-2">
                                                <div className={`text-sm px-2 py-1 rounded-md ${getScoreColor(field.value)}`}>
                                                    {getScoreLabel(field.value)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    1 = Poor, 10 = Excellent
                                </FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="feedback"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Feedback</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter detailed feedback about the employee's performance..."
                                        className="resize-none"
                                        rows={4}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Provide constructive feedback about the employee's performance
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Goals */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Goals
                    </CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendGoal('')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {goalFields.length > 0 ? (
                        goalFields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2">
                                <FormField
                                    control={control}
                                    name={`goals.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder={`Goal ${index + 1}`}
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGoal(index)}
                                    disabled={goalFields.length <= 1}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No goals added. Click "Add Goal" to add one.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Strengths
                    </CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendStrength('')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Strength
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {strengthFields.length > 0 ? (
                        strengthFields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2">
                                <FormField
                                    control={control}
                                    name={`strengths.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder={`Strength ${index + 1}`}
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeStrength(index)}
                                    disabled={strengthFields.length <= 1}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No strengths added. Click "Add Strength" to add one.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Areas for Improvement
                    </CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendImprovement('')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Area
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {improvementFields.length > 0 ? (
                        improvementFields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2">
                                <FormField
                                    control={control}
                                    name={`areasForImprovement.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder={`Area ${index + 1}`}
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeImprovement(index)}
                                    disabled={improvementFields.length <= 1}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No areas added. Click "Add Area" to add one.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Score Summary Preview */}
            {score && (
                <Alert>
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-1">
                            <p className="font-medium">Review Summary:</p>
                            <p>Score: {score}/10 ({getScoreLabel(score)})</p>
                            <p className="text-xs text-muted-foreground">
                                {goalFields.filter(g => g).length} goals • {strengthFields.filter(s => s).length} strengths • {improvementFields.filter(i => i).length} areas for improvement
                            </p>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}