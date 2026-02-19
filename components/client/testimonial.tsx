// components/testimonials/testimonial-carousel.tsx
"use client"

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Testimonial {
    id: number
    name: string
    role: string
    company?: string
    avatar: string
    rating: number
    content: string
    location: string
    date: string
    category: 'tires' | 'bales' | 'both'
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "John Farmer",
        role: "Farm Owner",
        company: "Green Valley Farms",
        avatar: "",
        rating: 5,
        content: "The farm bales have been exceptional quality. Our livestock is healthier and the hay lasts longer. Excellent service and delivery!",
        location: "Maseru, Lesotho",
        date: "2 weeks ago",
        category: "bales"
    },
    {
        id: 2,
        name: "Sarah Mokoena",
        role: "Transport Manager",
        company: "Quick Delivery Ltd",
        avatar: "",
        rating: 5,
        content: "We've been using these tires on our delivery fleet for 6 months. Fuel efficiency improved by 15% and the wear is minimal. Highly recommended!",
        location: "Quthing",
        date: "1 month ago",
        category: "tires"
    },
    {
        id: 3,
        name: "David Mofokeng",
        role: "Mechanic & Farmer",
        avatar: "",
        rating: 4,
        content: "Great quality products for both my farm and garage. The tires handle well on rough terrain and the bales are fresh every time.",
        location: "Leribe",
        date: "3 weeks ago",
        category: "both"
    },
    {
        id: 4,
        name: "Anna Ntai",
        role: "Agricultural Consultant",
        company: "Farm Solutions Inc",
        avatar: "",
        rating: 5,
        content: "I recommend TD Holdings to all my clients. Their products are reliable and the customer service is outstanding. True partners in agriculture.",
        location: "Mafeteng",
        date: "2 months ago",
        category: "bales"
    },
    {
        id: 5,
        name: "Michael Letsoela",
        role: "Fleet Owner",
        company: "Trans-Lesotho Transport",
        avatar: "",
        rating: 5,
        content: "Purchased 50 sets of tires for our trucks. Performance has been flawless across all weather conditions. The bulk discount was great too!",
        location: "Butha-Buthe",
        date: "1 week ago",
        category: "tires"
    },
    {
        id: 6,
        name: "Thabo Moloi",
        role: "Dairy Farmer",
        avatar: "",
        rating: 4,
        content: "Consistent quality hay bales year-round. My cows produce more milk since switching to their alfalfa. Reliable delivery even in remote areas.",
        location: "Mohale's Hoek",
        date: "3 days ago",
        category: "bales"
    }
]

export default function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [perView, setPerView] = useState(3) // Default to 3 for SSR
    const [isClient, setIsClient] = useState(false) // Track client-side hydration

    const itemsPerView = () => {
        if (window.innerWidth < 640) return 1
        if (window.innerWidth < 1024) return 2
        return 3
    }

    const totalSlides = Math.ceil(testimonials.length / perView)

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    // Handle auto-play
    useEffect(() => {
        if (!isAutoPlaying || !isClient) return

        const interval = setInterval(() => {
            nextSlide()
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying, currentIndex, totalSlides, isClient])

    // Initialize client-side state and handle responsive items per view
    useEffect(() => {
        setIsClient(true)

        // Set initial perView based on current window size
        setPerView(itemsPerView())

        const handleResize = () => {
            setPerView(itemsPerView())
            setCurrentIndex(0) // Reset to first slide on resize
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Don't render carousel content during SSR or before client-side hydration
    if (!isClient) {
        return (
            <div className="relative max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-[#FBB320]/10 rounded-full mb-4">
                        <Quote className="w-8 h-8 text-[#FBB320]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b2358] mb-3">
                        What Our Clients Say
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Trusted by farmers, businesses, and individuals across Lesotho
                    </p>
                </div>
                {/* Loading skeleton */}
                <div className="h-64 flex items-center justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating
                    ? 'fill-[#FBB320] text-[#FBB320]'
                    : 'fill-gray-200 text-gray-200'
                    }`}
            />
        ))
    }

    const getCategoryColor = (category: Testimonial['category']) => {
        switch (category) {
            case 'tires': return 'bg-[#1b2358]'
            case 'bales': return 'bg-[#FBB320]'
            case 'both': return 'bg-gradient-to-r from-[#1b2358] to-[#FBB320]'
        }
    }

    return (
        <div className="relative max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-[#FBB320]/10 rounded-full mb-4">
                    <Quote className="w-8 h-8 text-[#FBB320]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1b2358] mb-3">
                    What Our Clients Say
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Trusted by farmers, businesses, and individuals across Lesotho
                </p>
            </div>

            {/* Carousel Container */}
            <div
                className="relative overflow-hidden"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                {/* Carousel Track */}
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                        <div
                            key={slideIndex}
                            className="w-full shrink-0 px-2"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {testimonials.slice(slideIndex * perView, (slideIndex * perView) + perView).map((testimonial) => (
                                    <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg border-gray-200 z-10 hover:bg-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg border-gray-200 z-10 hover:bg-white"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            index === currentIndex
                                ? "bg-[#1b2358] w-8"
                                : "bg-gray-300 hover:bg-gray-400"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Auto-play Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4">
                <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="text-sm text-gray-500 hover:text-[#1b2358] flex items-center gap-2"
                >
                    <div className={cn(
                        "w-8 h-4 rounded-full relative transition-colors",
                        isAutoPlaying ? "bg-green-500" : "bg-gray-300"
                    )}>
                        <div className={cn(
                            "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                            isAutoPlaying ? "translate-x-4" : "translate-x-0.5"
                        )} />
                    </div>
                    Auto-play {isAutoPlaying ? 'ON' : 'OFF'}
                </button>
            </div>
        </div>
    )
}

// Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    const getCategoryColor = (category: Testimonial['category']) => {
        switch (category) {
            case 'tires': return 'bg-[#1b2358]'
            case 'bales': return 'bg-[#FBB320]'
            case 'both': return 'bg-gradient-to-r from-[#1b2358] to-[#FBB320]'
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
            {/* Category Badge */}
            <div className="mb-4">
                <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-medium text-white",
                    testimonial.category === 'tires' ? 'bg-[#1b2358]' :
                        testimonial.category === 'bales' ? 'bg-[#FBB320]' :
                            'bg-linear-to-r from-[#1b2358] to-[#FBB320]'
                )}>
                    {testimonial.category === 'tires' ? '🚗 Tires' :
                        testimonial.category === 'bales' ? '🌾 Bales' : '🚜 Both'}
                </span>
            </div>

            {/* Quote */}
            <div className="mb-6">
                <Quote className="w-8 h-8 text-[#FBB320]/30 mb-4" />
                <p className="text-gray-700 italic line-clamp-5">
                    "{testimonial.content}"
                </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating
                                ? 'fill-[#FBB320] text-[#FBB320]'
                                : 'fill-gray-200 text-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                    {testimonial.rating.toFixed(1)}
                </span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="h-12 w-12 border-2 border-[#FBB320]/20">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-linear-to-br from-[#1b2358] to-[#2a357a] text-white">
                        {testimonial.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1b2358] truncate">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 truncate">
                        {testimonial.role}
                        {testimonial.company && ` • ${testimonial.company}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{testimonial.location}</span>
                        <span>•</span>
                        <span>{testimonial.date}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}