// components/product/reviews-section.tsx
"use client"

import { useState } from 'react'
import {
    Star,
    Filter,
    ThumbsUp,
    MessageCircle,
    Share2,
    Flag,
    CheckCircle,
    Calendar,
    User,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface Review {
    id: number
    user: {
        name: string
        avatar: string
        verified: boolean
        location: string
    }
    rating: number
    date: string
    title: string
    comment: string
    helpful: number
    replies: Reply[]
    verifiedPurchase: boolean
    productSize?: string
    productUsage?: string
    images?: string[]
}

interface Reply {
    id: number
    user: {
        name: string
        role: 'customer' | 'admin' | 'expert'
    }
    date: string
    comment: string
}

interface ReviewsSectionProps {
    averageRating: number
    totalReviews: number
    productId: number
    productName: string
}

export default function ReviewsSection({
    averageRating = 4.5,
    totalReviews = 128,
    productId = 1,
    productName = "Premium All-Season Tire"
}: ReviewsSectionProps) {
    const [sortBy, setSortBy] = useState('recent')
    const [filterRating, setFilterRating] = useState<number | null>(null)
    const [showReplyForm, setShowReplyForm] = useState<number | null>(null)
    const [replyText, setReplyText] = useState('')
    const [reviews, setReviews] = useState<Review[]>([
        {
            id: 1,
            user: {
                name: "John Farmer",
                avatar: "",
                verified: true,
                location: "Maseru, Lesotho"
            },
            rating: 5,
            date: "2 weeks ago",
            title: "Excellent for farm use!",
            comment: "These tires have been fantastic on my farm. Great traction in muddy conditions and they handle heavy loads well. Would definitely recommend to other farmers.",
            helpful: 24,
            replies: [
                {
                    id: 1,
                    user: { name: "TD Holdings Support", role: 'admin' },
                    date: "1 week ago",
                    comment: "Thank you for your feedback, John! We're glad to hear these tires are working well on your farm. They're designed specifically for agricultural terrain."
                }
            ],
            verifiedPurchase: true,
            productSize: "205/65R15",
            productUsage: "Farm truck, 6 months"
        },
        {
            id: 2,
            user: {
                name: "Sarah M.",
                avatar: "",
                verified: false,
                location: "Quthing"
            },
            rating: 4,
            date: "1 month ago",
            title: "Good value for money",
            comment: "Been using these for 3 months now. Good grip and durable. Only wish they were slightly more comfortable on rough roads.",
            helpful: 12,
            replies: [],
            verifiedPurchase: true,
            productUsage: "Daily commute, 3 months"
        },
        {
            id: 3,
            user: {
                name: "David Transport",
                avatar: "",
                verified: true,
                location: "Leribe"
            },
            rating: 5,
            date: "2 months ago",
            title: "Perfect for our delivery trucks",
            comment: "We purchased 8 sets for our delivery fleet. Excellent wear resistance and fuel efficiency. Customer service was also top-notch!",
            helpful: 45,
            replies: [
                {
                    id: 2,
                    user: { name: "Transport Expert", role: 'expert' },
                    date: "1 month ago",
                    comment: "Great choice for fleet vehicles! These tires are known for their long lifespan and low maintenance costs."
                }
            ],
            verifiedPurchase: true,
            productSize: "225/75R16",
            productUsage: "Delivery fleet, 2 months"
        },
        {
            id: 4,
            user: {
                name: "Michael K.",
                avatar: "",
                verified: true,
                location: "Butha-Buthe"
            },
            rating: 3,
            date: "3 months ago",
            title: "Average performance",
            comment: "They work okay but had one issue with balancing. Service center was helpful though and resolved it quickly.",
            helpful: 5,
            replies: [],
            verifiedPurchase: true,
            productUsage: "Personal vehicle, 3 months"
        },
    ])

    const [newReview, setNewReview] = useState({
        rating: 0,
        title: '',
        comment: '',
        size: '',
        usage: ''
    })

    const ratingDistribution = [
        { stars: 5, count: 85, percentage: 66 },
        { stars: 4, count: 28, percentage: 22 },
        { stars: 3, count: 10, percentage: 8 },
        { stars: 2, count: 3, percentage: 2 },
        { stars: 1, count: 2, percentage: 2 },
    ]

    const filteredReviews = filterRating
        ? reviews.filter(review => review.rating === filterRating)
        : reviews

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        switch (sortBy) {
            case 'helpful':
                return b.helpful - a.helpful
            case 'highest':
                return b.rating - a.rating
            case 'lowest':
                return a.rating - b.rating
            default:
                return new Date(b.date).getTime() - new Date(a.date).getTime()
        }
    })

    const handleHelpful = (reviewId: number) => {
        setReviews(reviews.map(review =>
            review.id === reviewId
                ? { ...review, helpful: review.helpful + 1 }
                : review
        ))
    }

    const handleSubmitReply = (reviewId: number) => {
        if (!replyText.trim()) return

        const newReply = {
            id: Date.now(),
            user: { name: "You", role: 'customer' as const },
            date: "Just now",
            comment: replyText
        }

        setReviews(reviews.map(review =>
            review.id === reviewId
                ? { ...review, replies: [...review.replies, newReply] }
                : review
        ))
        setReplyText('')
        setShowReplyForm(null)
    }

    const handleSubmitReview = () => {
        if (!newReview.comment.trim() || newReview.rating === 0) return

        const newReviewObj: Review = {
            id: reviews.length + 1,
            user: {
                name: "You",
                avatar: "",
                verified: false,
                location: "Lesotho"
            },
            rating: newReview.rating,
            date: "Just now",
            title: newReview.title,
            comment: newReview.comment,
            helpful: 0,
            replies: [],
            verifiedPurchase: true,
            productSize: newReview.size,
            productUsage: newReview.usage
        }

        setReviews([newReviewObj, ...reviews])
        setNewReview({
            rating: 0,
            title: '',
            comment: '',
            size: '',
            usage: ''
        })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1b2358] mb-2">
                    Customer Reviews
                </h2>
                <p className="text-gray-600">
                    {totalReviews} reviews from verified customers
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Rating Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        {/* Overall Rating */}
                        <div className="text-center mb-6">
                            <div className="text-5xl font-bold text-[#1b2358] mb-2">
                                {averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-6 h-6 ${star <= Math.floor(averageRating)
                                            ? 'fill-[#FBB320] text-[#FBB320]'
                                            : star === Math.ceil(averageRating) && averageRating % 1 !== 0
                                                ? 'fill-[#FBB320]/50 text-[#FBB320]'
                                                : 'fill-gray-200 text-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-600">Based on {totalReviews} reviews</p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-3">
                            {ratingDistribution.map(({ stars, count, percentage }) => (
                                <div key={stars} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm text-gray-600">{stars}</span>
                                        <Star className="w-4 h-4 text-[#FBB320]" />
                                    </div>
                                    <Progress value={percentage} className="flex-1 h-2" />
                                    <span className="text-sm text-gray-600 w-12 text-right">
                                        {count}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                                        className={`text-xs px-2 ${filterRating === stars
                                            ? 'bg-[#1b2358] text-white'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        Filter
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Clear Filter */}
                        {filterRating && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFilterRating(null)}
                                className="w-full mt-4"
                            >
                                Clear Filter
                            </Button>
                        )}

                        {/* Review Guidelines */}
                        <div className="mt-8 pt-6 border-t">
                            <h4 className="font-medium text-[#1b2358] mb-3">Review Guidelines</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>Share your experience with the product</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>Include details about usage and conditions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>Be honest and respectful in your review</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="font-medium text-[#1b2358] mb-4">Review Stats</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Verified Purchases</span>
                                <Badge className="bg-green-500">98%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">With Photos</span>
                                <span className="font-medium">42%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Helpful Reviews</span>
                                <span className="font-medium">89%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Response Rate</span>
                                <Badge className="bg-blue-500">95%</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Reviews List */}
                <div className="lg:col-span-2">
                    {/* Controls */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recent">Most Recent</SelectItem>
                                        <SelectItem value="helpful">Most Helpful</SelectItem>
                                        <SelectItem value="highest">Highest Rated</SelectItem>
                                        <SelectItem value="lowest">Lowest Rated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-sm text-gray-600">
                                Showing {sortedReviews.length} of {totalReviews} reviews
                            </div>
                        </div>
                    </div>

                    {/* Write Review Button */}
                    <Button
                        className="w-full mb-6 bg-[#1b2358] hover:bg-[#151d4a]"
                        onClick={() => document.getElementById('write-review')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Write a Review
                    </Button>

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {sortedReviews.map((review) => (
                            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-[#1b2358]/10">
                                            <AvatarImage src={review.user.avatar} />
                                            <AvatarFallback className="bg-[#1b2358] text-white">
                                                {review.user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-[#1b2358]">{review.user.name}</h4>
                                                {review.user.verified && (
                                                    <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Verified Buyer
                                                    </Badge>
                                                )}
                                                {review.verifiedPurchase && (
                                                    <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                                                        Verified Purchase
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= review.rating
                                                                ? 'fill-[#FBB320] text-[#FBB320]'
                                                                : 'fill-gray-200 text-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {review.date}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {review.user.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Details */}
                                {(review.productSize || review.productUsage) && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            {review.productSize && (
                                                <span className="mr-4">
                                                    <strong>Size:</strong> {review.productSize}
                                                </span>
                                            )}
                                            {review.productUsage && (
                                                <span>
                                                    <strong>Usage:</strong> {review.productUsage}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Review Content */}
                                <div className="mb-4">
                                    <h5 className="font-bold text-lg text-[#1b2358] mb-2">
                                        {review.title}
                                    </h5>
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-4">
                                        {review.images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                {/* Image placeholder */}
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    Photo {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleHelpful(review.id)}
                                            className="text-gray-600 hover:text-[#1b2358]"
                                        >
                                            <ThumbsUp className="w-4 h-4 mr-2" />
                                            Helpful ({review.helpful})
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowReplyForm(showReplyForm === review.id ? null : review.id)}
                                            className="text-gray-600 hover:text-[#1b2358]"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Reply
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <Flag className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Reply Form */}
                                {showReplyForm === review.id && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <Textarea
                                            placeholder="Write your reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="mb-2"
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowReplyForm(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleSubmitReply(review.id)}
                                                className="bg-[#1b2358] hover:bg-[#151d4a]"
                                            >
                                                Post Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {review.replies.length > 0 && (
                                    <div className="mt-4 pl-6 border-l-2 border-gray-200">
                                        {review.replies.map((reply) => (
                                            <div key={reply.id} className="mb-4 last:mb-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="font-medium text-[#1b2358]">
                                                        {reply.user.name}
                                                    </div>
                                                    <Badge className={
                                                        reply.user.role === 'admin'
                                                            ? 'bg-[#1b2358]'
                                                            : reply.user.role === 'expert'
                                                                ? 'bg-[#FBB320] text-[#1b2358]'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }>
                                                        {reply.user.role}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        • {reply.date}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{reply.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Write Review Section */}
                    <div id="write-review" className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-[#1b2358] mb-6">
                            Write Your Review
                        </h3>

                        {/* Rating */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating *
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="text-2xl focus:outline-none"
                                    >
                                        <Star
                                            className={`${star <= newReview.rating
                                                ? 'fill-[#FBB320] text-[#FBB320]'
                                                : 'text-gray-300'
                                                } hover:scale-110 transition-transform`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-gray-600">
                                    {newReview.rating > 0 ? `${newReview.rating} stars` : 'Click to rate'}
                                </span>
                            </div>
                        </div>

                        {/* Review Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Summarize your experience"
                                    value={newReview.title}
                                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2358] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review *
                                </label>
                                <Textarea
                                    placeholder="Share details of your experience with this product..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    rows={5}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Minimum 50 characters. Be specific and honest.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Size (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 205/65R15"
                                        value={newReview.size}
                                        onChange={(e) => setNewReview({ ...newReview, size: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How long used? (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 3 months, farm use"
                                        value={newReview.usage}
                                        onChange={(e) => setNewReview({ ...newReview, usage: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add Photos (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <div className="text-gray-400 mb-2">
                                        📸 Click to upload or drag and drop
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        JPG, PNG up to 5MB. Photos help others visualize the product.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={!newReview.comment.trim() || newReview.rating === 0}
                                    className="w-full bg-[#1b2358] hover:bg-[#151d4a] disabled:opacity-50"
                                >
                                    Submit Review
                                </Button>
                                <p className="text-sm text-gray-500 text-center mt-2">
                                    By submitting, you agree to our review guidelines
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="w-5 h-5 text-[#1b2358]" />
                            <h4 className="text-lg font-bold text-[#1b2358]">Review FAQ</h4>
                        </div>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-[#1b2358] font-medium">
                                    <span>How do I know if a review is genuine?</span>
                                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="mt-2 text-gray-600">
                                    We verify purchases and mark reviews from verified buyers. Look for the "Verified Purchase" badge.
                                </p>
                            </details>
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-[#1b2358] font-medium">
                                    <span>Can I edit or delete my review?</span>
                                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="mt-2 text-gray-600">
                                    Yes, you can edit or delete your review within 30 days of posting from your account dashboard.
                                </p>
                            </details>
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-[#1b2358] font-medium">
                                    <span>Do sellers respond to reviews?</span>
                                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="mt-2 text-gray-600">
                                    Yes, our team actively responds to reviews, especially when customers have questions or concerns.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}