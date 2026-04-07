'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Star,
    Plus,
    Edit,
    Trash2,
    Calendar,
    User,
    Loader2,
    Target,
    TrendingUp,
    AlertCircle,
    X
} from 'lucide-react';
import EmployeeAPI from '@/lib/api/employees';
import type { PerformanceReview, PerformanceReviewFormValues, ReviewPeriod } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

interface EmployeeReviewsProps {
    token: string;
    employeeId?: string;
}

const defaultReview: PerformanceReviewFormValues = {
    reviewDate: new Date().toISOString().split('T')[0],
    period: 'MONTHLY' as ReviewPeriod,
    score: 0,
    feedback: '',
    goals: [],
    strengths: [],
    areasForImprovement: []
};

export function EmployeeReviews({ token, employeeId }: EmployeeReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageScore, setAverageScore] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReview, setNewReview] = useState<PerformanceReviewFormValues>(defaultReview);
    const [activeTab, setActiveTab] = useState('basic');
    
    // Input states for adding items to arrays
    const [goalInput, setGoalInput] = useState('');
    const [strengthInput, setStrengthInput] = useState('');
    const [improvementInput, setImprovementInput] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            if (!employeeId) return;

            try {
                const data = await EmployeeAPI.getPerformanceReviews(token, employeeId);
                setReviews(data.reviews);
                setAverageScore(data.averageScore);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            fetchReviews();
        }
    }, [token, employeeId]);

    const handleAddGoal = () => {
        if (goalInput.trim()) {
            setNewReview({
                ...newReview,
                goals: [...newReview.goals, goalInput.trim()]
            });
            setGoalInput('');
        }
    };

    const handleRemoveGoal = (index: number) => {
        setNewReview({
            ...newReview,
            goals: newReview.goals.filter((_, i) => i !== index)
        });
    };

    const handleAddStrength = () => {
        if (strengthInput.trim()) {
            setNewReview({
                ...newReview,
                strengths: [...newReview.strengths, strengthInput.trim()]
            });
            setStrengthInput('');
        }
    };

    const handleRemoveStrength = (index: number) => {
        setNewReview({
            ...newReview,
            strengths: newReview.strengths.filter((_, i) => i !== index)
        });
    };

    const handleAddImprovement = () => {
        if (improvementInput.trim()) {
            setNewReview({
                ...newReview,
                areasForImprovement: [...newReview.areasForImprovement, improvementInput.trim()]
            });
            setImprovementInput('');
        }
    };

    const handleRemoveImprovement = (index: number) => {
        setNewReview({
            ...newReview,
            areasForImprovement: newReview.areasForImprovement.filter((_, i) => i !== index)
        });
    };

    const handleAddReview = async () => {
        if (!employeeId || !user?.id) return;

        try {
            // Validate required fields
            if (!newReview.score || newReview.score < 0 || newReview.score > 100) {
                alert('Score must be between 0 and 100');
                return;
            }
            if (!newReview.feedback) {
                alert('Feedback is required');
                return;
            }
            if (newReview.goals.length === 0) {
                alert('At least one goal is required');
                return;
            }

            const result = await EmployeeAPI.createPerformanceReview(token, employeeId, newReview);

            setReviews([result.review, ...reviews]);
            
            // Recalculate average
            const newAverage = (averageScore * reviews.length + result.review.score) / (reviews.length + 1);
            setAverageScore(newAverage);
            
            setShowAddForm(false);
            setNewReview(defaultReview);
            setActiveTab('basic');
            setGoalInput('');
            setStrengthInput('');
            setImprovementInput('');
        } catch (error) {
            console.error('Failed to add review:', error);
            alert('Failed to add review. Please try again.');
        }
    };

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
                <div>
                    <CardTitle>Performance Reviews</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Average Score: {averageScore.toFixed(1)} / 100
                    </p>
                </div>
                <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review
                </Button>
            </CardHeader>
            <CardContent>
                {showAddForm && (
                    <div className="mb-6 p-4 border rounded-lg space-y-4">
                        <h4 className="font-medium">New Performance Review</h4>
                        
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="details">Goals & Feedback</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="score">Score (0-100) *</Label>
                                        <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newReview.score}
                                            onChange={(e) => setNewReview({ 
                                                ...newReview, 
                                                score: parseInt(e.target.value) || 0 
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reviewDate">Review Date *</Label>
                                        <Input
                                            id="reviewDate"
                                            type="date"
                                            value={newReview.reviewDate as string}
                                            onChange={(e) => setNewReview({ 
                                                ...newReview, 
                                                reviewDate: e.target.value 
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="period">Review Period *</Label>
                                    <select
                                        id="period"
                                        className="w-full p-2 border rounded-md"
                                        value={newReview.period}
                                        onChange={(e) => setNewReview({ 
                                            ...newReview, 
                                            period: e.target.value as ReviewPeriod
                                        })}
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="ANNUAL">Annual</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feedback">Feedback *</Label>
                                    <Textarea
                                        id="feedback"
                                        value={newReview.feedback}
                                        onChange={(e) => setNewReview({ 
                                            ...newReview, 
                                            feedback: e.target.value 
                                        })}
                                        rows={3}
                                        placeholder="Overall feedback about performance..."
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-4">
                                {/* Goals */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Goals Achieved *
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={goalInput}
                                            onChange={(e) => setGoalInput(e.target.value)}
                                            placeholder="Add a goal..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                                        />
                                        <Button type="button" onClick={handleAddGoal}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newReview.goals.map((goal, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {goal}
                                                <X 
                                                    className="h-3 w-3 cursor-pointer" 
                                                    onClick={() => handleRemoveGoal(index)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Strengths */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Strengths
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={strengthInput}
                                            onChange={(e) => setStrengthInput(e.target.value)}
                                            placeholder="Add a strength..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddStrength()}
                                        />
                                        <Button type="button" onClick={handleAddStrength}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newReview.strengths.map((strength, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {strength}
                                                <X 
                                                    className="h-3 w-3 cursor-pointer" 
                                                    onClick={() => handleRemoveStrength(index)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Areas for Improvement */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Areas for Improvement
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={improvementInput}
                                            onChange={(e) => setImprovementInput(e.target.value)}
                                            placeholder="Add an area for improvement..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddImprovement()}
                                        />
                                        <Button type="button" onClick={handleAddImprovement}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newReview.areasForImprovement.map((item, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {item}
                                                <X 
                                                    className="h-3 w-3 cursor-pointer" 
                                                    onClick={() => handleRemoveImprovement(index)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => {
                                setShowAddForm(false);
                                setNewReview(defaultReview);
                                setActiveTab('basic');
                                setGoalInput('');
                                setStrengthInput('');
                                setImprovementInput('');
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddReview}>
                                Save Review
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No reviews found</p>
                    ) : (
                        reviews.map((review) => {
                            const category = EmployeeAPI.getPerformanceCategory(review.score);

                            return (
                                <div key={review.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-5 w-5 ${
                                                            star <= Math.round(review.score / 20)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <Badge className={category.color}>
                                                {category.category}
                                            </Badge>
                                            <Badge variant="outline">
                                                {review.period.toLowerCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm mb-3">{review.feedback}</p>

                                    {/* Goals and Feedback Section */}
                                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                                        {review.goals && review.goals.length > 0 && (
                                            <div className="p-2 bg-muted/30 rounded">
                                                <p className="text-xs font-medium mb-1">Goals</p>
                                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                                    {review.goals.map((goal, i) => (
                                                        <li key={i}>{goal}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {review.strengths && review.strengths.length > 0 && (
                                            <div className="p-2 bg-muted/30 rounded">
                                                <p className="text-xs font-medium mb-1">Strengths</p>
                                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                                    {review.strengths.map((strength, i) => (
                                                        <li key={i}>{strength}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {review.areasForImprovement && review.areasForImprovement.length > 0 && (
                                            <div className="p-2 bg-muted/30 rounded">
                                                <p className="text-xs font-medium mb-1">To Improve</p>
                                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                                    {review.areasForImprovement.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(review.reviewDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {review.reviewer?.firstName} {review.reviewer?.lastName}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}