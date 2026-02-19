// components/ui/simple-carousel-banner.tsx
"use client"

import { ChevronLeft, ChevronRight, Truck, Leaf, CheckCircle, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import image from "@/public/Images/AdobeStock_219204345-scaled-1-2048x1365.jpeg"
import Image from 'next/image'

export default function SimpleCarouselBanner() {
    const slides = [
        {
            id: 1,
            title: "Premium All-Season Tires",
            subtitle: "Drive with Confidence",
            description: "Experience superior grip and comfort in all weather conditions.",
            image: image,
            category: 'tires',
            features: ["5-year warranty", "Fuel efficient", "Quiet ride"],
            ctaText: "Shop Tires",
            bgColor: "bg-[#1b2358]",
            textColor: "text-white"
        },
        {
            id: 2,
            title: "Fresh Farm Bales",
            subtitle: "Quality Livestock Feed",
            description: "Premium hay and straw bales for your farming needs.",
            image: image,
            category: 'bales',
            features: ["Freshly harvested", "Organic options", "Bulk discounts"],
            ctaText: "Shop Bales",
            bgColor: "bg-[#FBB320]",
            textColor: "text-[#1b2358]"
        },
        {
            id: 3,
            title: "Winter Traction Pro",
            subtitle: "Conquer Winter Roads",
            description: "Specialized winter tires for maximum safety.",
            image: image,
            category: 'tires',
            features: ["Deep snow traction", "Ice grip technology", "Studdable"],
            ctaText: "View Winter Tires",
            bgColor: "bg-[#1b2358]",
            textColor: "text-white"
        },
        {
            id: 4,
            title: "Alfalfa Premium",
            subtitle: "Nutrient-Rich Feed",
            description: "High-protein alfalfa bales for livestock.",
            image: image,
            category: 'bales',
            features: ["High protein", "No pesticides", "Large bales"],
            ctaText: "Browse Alfalfa",
            bgColor: "bg-[#FBB320]",
            textColor: "text-[#1b2358]"
        }
    ]

    return (
        <div className="w-full">
            <div className="container mx-auto px-3 sm:px-4">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full rounded-xl md:rounded-2xl overflow-hidden shadow-xl"
                >
                    <CarouselContent>
                        {slides.map((slide) => (
                            <CarouselItem key={slide.id} className="pt-10">
                                <div className={`${slide.bgColor} h-125 rounded-xl md:rounded-2xl`}>
                                    <div className="h-full flex flex-col md:flex-row items-center p-6 md:p-8">
                                        <div className="flex-1">
                                            <Badge className={`mb-4 w-fit rounded-full ${slide.category === 'tires' ? 'bg-white/20 text-white' : 'bg-[#1b2358]/20 text-[#1b2358]'}`}>
                                                {slide.category === 'tires' ? <Truck className="w-3 h-3 mr-1" /> : <Leaf className="w-3 h-3 mr-1" />}
                                                {slide.category === 'tires' ? 'TIRES' : 'BALES'}
                                            </Badge>
                                            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${slide.textColor}`}>
                                                {slide.title}
                                            </h2>
                                            <p className={`text-lg md:text-xl mb-4 opacity-90 ${slide.textColor}`}>
                                                {slide.subtitle}
                                            </p>
                                            <p className={`mb-6 opacity-80 ${slide.textColor}`}>
                                                {slide.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {slide.features.map((feature, idx) => (
                                                    <span key={idx} className={`text-xs px-3 py-1 rounded-full ${slide.category === 'tires' ? 'bg-white/20' : 'bg-[#1b2358]/20'} ${slide.textColor}`}>
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                            <Button className={`rounded-lg ${slide.category === 'tires' ? 'bg-white text-[#1b2358] hover:bg-gray-100' : 'bg-[#1b2358] text-white hover:bg-[#151d4a]'}`}>
                                                {slide.ctaText}
                                            </Button>
                                        </div>
                                        <div className="hidden md:flex items-center justify-center flex-1">
                                            {/* <div className={`text-[150px] md:text-[200px] ${slide.textColor}`}> */}
                                            <Image src={slide.image} alt={slide.title} width={1500} height={200} />
                                            {/* </div> */}
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur-sm rounded-full" />
                    <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur-sm rounded-full" />
                </Carousel>
            </div>
        </div>
    )
}