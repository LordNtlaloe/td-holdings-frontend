// app/compare/page.tsx

import CompareProducts from '@/components/client/compare-product'
import { BarChart3 } from 'lucide-react'

export default function ComparePage() {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#1b2358] to-[#2a357a] py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <BarChart3 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold">Compare Products</h1>
                                    <p className="text-white/90 mt-2">Side-by-side product comparison</p>
                                </div>
                            </div>
                            <p className="text-white/90 max-w-2xl">
                                Make informed decisions by comparing up to 4 products at once.
                                Evaluate features, prices, and specifications to find the perfect match for your needs.
                            </p>
                        </div>
                        <div className="text-sm text-white/80 bg-white/10 rounded-lg p-4">
                            <p className="font-medium mb-2">Compare Features</p>
                            <ul className="space-y-1">
                                <li>• Price & Value</li>
                                <li>• Features & Specs</li>
                                <li>• Customer Ratings</li>
                                <li>• Usage Recommendations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compare Products Component */}
            <div className="py-8">
                <CompareProducts />
            </div>

            {/* How to Use Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-[#1b2358] mb-6 text-center">
                        How to Use the Comparison Tool
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">1</span>
                            </div>
                            <h4 className="font-bold text-[#1b2358] mb-2">Select Products</h4>
                            <p className="text-gray-600 text-sm">
                                Choose up to 4 products from the sidebar or browse our catalog
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">2</span>
                            </div>
                            <h4 className="font-bold text-[#1b2358] mb-2">Compare Features</h4>
                            <p className="text-gray-600 text-sm">
                                View side-by-side comparison of prices, features, and specifications
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">3</span>
                            </div>
                            <h4 className="font-bold text-[#1b2358] mb-2">Get Recommendations</h4>
                            <p className="text-gray-600 text-sm">
                                Receive tailored recommendations based on your comparison
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">4</span>
                            </div>
                            <h4 className="font-bold text-[#1b2358] mb-2">Make Decision</h4>
                            <p className="text-gray-600 text-sm">
                                Choose the best product for your needs and budget
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}