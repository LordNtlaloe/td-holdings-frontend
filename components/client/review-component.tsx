// components/reviews/reviews.tsx
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
    ChevronRight,
    ExternalLink,
    BarChart3,
    MessageSquare,
    Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

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

interface ReviewsProps {
    averageRating?: number
    totalReviews?: number
    productId?: number
    productName?: string
    mode?: 'summary' | 'full'
    showHeader?: boolean
    maxReviews?: number
}

export default function Reviews({
    averageRating = 4.5,
    totalReviews = 128,
    productId = 1,
    productName = "Premium All-Season Tire",
    mode = 'summary',
    showHeader = true,
    maxReviews = 3
}: ReviewsProps) {
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
                    comment: "Thank you for your feedback, John! We're glad to hear these tires are working well on your farm."
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
                    comment: "Great choice for fleet vehicles! These tires are known for their long lifespan."
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
        {
            id: 5,
            user: {
                name: "Anna T.",
                avatar: "",
                verified: true,
                location: "Mafeteng"
            },
            rating: 5,
            date: "1 week ago",
            title: "Best tires I've owned!",
            comment: "Excellent performance in all conditions. Quiet ride and great handling. Will buy again.",
            helpful: 18,
            replies: [],
            verifiedPurchase: true
        },
        {
            id: 6,
            user: {
                name: "Farm Co. Ltd",
                avatar: "",
                verified: true,
                location: "Mohale's Hoek"
            },
            rating: 4,
            date: "2 weeks ago",
            title: "Reliable for farm equipment",
            comment: "Using these on our tractors and farm vehicles. Good durability and traction. Minor issue with one tire but replaced quickly.",
            helpful: 9,
            replies: [
                {
                    id: 3,
                    user: { name: "TD Holdings Support", role: 'admin' },
                    date: "1 week ago",
                    comment: "Thank you for your business! We're here to support all your agricultural needs."
                }
            ],
            verifiedPurchase: true
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

    const displayReviews = mode === 'summary'
        ? sortedReviews.slice(0, maxReviews)
        : sortedReviews

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

    const RatingStars = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
        const starSize = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6'
        }

        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${starSize[size]} ${star <= rating
                                ? 'fill-[#FBB320] text-[#FBB320]'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                ))}
            </div>
        )
    }

    const ReviewCard = ({ review }: { review: Review }) => (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
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
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <RatingStars rating={review.rating} size="sm" />
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {review.date}
                            </span>
                            {review.user.location && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {review.user.location}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h5 className="font-bold text-lg text-[#1b2358] mb-2">
                    {review.title}
                </h5>
                <p className="text-gray-700 line-clamp-3">
                    {review.comment}
                </p>
            </div>

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
                    {mode === 'full' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplyForm(showReplyForm === review.id ? null : review.id)}
                            className="text-gray-600 hover:text-[#1b2358]"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Reply
                        </Button>
                    )}
                </div>
                {review.replies.length > 0 && (
                    <Badge variant="outline" className="text-gray-500">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
                    </Badge>
                )}
            </div>

            {showReplyForm === review.id && mode === 'full' && (
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

            {review.replies.length > 0 && mode === 'full' && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200">
                    {review.replies.slice(0, 2).map((reply) => (
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
    )

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {showHeader && (
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1b2358] mb-2">
                        Customer Reviews
                    </h2>
                    <p className="text-gray-600">
                        {totalReviews} reviews from verified customers
                    </p>
                </div>
            )}

            {mode === 'full' ? (
                // Full Mode Layout
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Rating Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 sticky top-24">
                            <div className="text-center mb-6">
                                <div className="text-5xl font-bold text-[#1b2358] mb-2">
                                    {averageRating.toFixed(1)}
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <RatingStars rating={Math.round(averageRating)} size="lg" />
                                </div>
                                <p className="text-gray-600">Based on {totalReviews} reviews</p>
                            </div>

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
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h4 className="font-medium text-[#1b2358] mb-4">
                                <BarChart3 className="w-5 h-5 inline mr-2" />
                                Review Stats
                            </h4>
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

                    {/* Right Column - Full Reviews */}
                    <div className="lg:col-span-2">
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
                                    Showing {displayReviews.length} of {totalReviews} reviews
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            {displayReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {displayReviews.length < reviews.length && (
                            <div className="text-center mb-8">
                                <Button variant="outline" className="px-8">
                                    Load More Reviews
                                </Button>
                            </div>
                        )}

                        {/* Write Review Section (Only in full mode) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-[#1b2358] mb-6">
                                <MessageSquare className="w-6 h-6 inline mr-2" />
                                Write Your Review
                            </h3>

                            {/* Simplified review form for demo */}
                            <div className="space-y-4">
                                <div>
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
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Review *
                                    </label>
                                    <Textarea
                                        placeholder="Share your experience..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={!newReview.comment.trim() || newReview.rating === 0}
                                    className="w-full bg-[#1b2358] hover:bg-[#151d4a]"
                                >
                                    Submit Review
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Summary Mode Layout (for landing page)
                <div className="space-y-8">
                    {/* Quick Stats Bar */}
                    <div className="bg-gradient-to-r from-[#1b2358] to-[#2a357a] rounded-xl p-6 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <RatingStars rating={Math.round(averageRating)} size="md" />
                                </div>
                                <p className="text-white/80 text-sm">Average Rating</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">{totalReviews}</div>
                                <p className="text-white/80 text-sm">Total Reviews</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">98%</div>
                                <p className="text-white/80 text-sm">Verified Purchases</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">95%</div>
                                <p className="text-white/80 text-sm">Would Recommend</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Reviews */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {displayReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {/* View All Link */}
                    <div className="text-center pt-6 border-t">
                        <Link
                            href="/reviews"
                            className="inline-flex items-center gap-2 text-[#1b2358] hover:text-[#FBB320] font-medium"
                        >
                            View All {totalReviews} Reviews
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}