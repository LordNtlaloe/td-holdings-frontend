
import StoreLocator from '@/components/client/store-locations'
import { MapPin, Truck, Shield, Clock } from 'lucide-react'

export default function StoresPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1b2358] to-[#2a357a] py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold">Store Locator</h1>
                                    <p className="text-white/90 mt-2">Find TD Holdings stores across Lesotho</p>
                                </div>
                            </div>
                            <p className="text-white/90 max-w-2xl">
                                With 5 locations nationwide, we're always nearby to serve your tire and farm supply needs.
                                Visit any of our stores for expert advice and quality products.
                            </p>
                        </div>
                        <div className="text-sm text-white/80 bg-white/10 rounded-lg p-4">
                            <p className="font-medium mb-2">Quick Facts</p>
                            <ul className="space-y-1">
                                <li>• 5 Stores Nationwide</li>
                                <li>• Free Delivery in City Limits</li>
                                <li>• Expert Staff at Every Location</li>
                                <li>• Same-Day Service Available</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-xl">
                        <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-6 h-6 text-[#1b2358]" />
                        </div>
                        <h3 className="font-bold text-[#1b2358] mb-2">Nationwide Coverage</h3>
                        <p className="text-gray-600 text-sm">5 strategic locations across Lesotho</p>
                    </div>
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-xl">
                        <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-6 h-6 text-[#1b2358]" />
                        </div>
                        <h3 className="font-bold text-[#1b2358] mb-2">Free Local Delivery</h3>
                        <p className="text-gray-600 text-sm">Delivery within city limits on orders over LSL 1000</p>
                    </div>
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-xl">
                        <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 text-[#1b2358]" />
                        </div>
                        <h3 className="font-bold text-[#1b2358] mb-2">Expert Service</h3>
                        <p className="text-gray-600 text-sm">Trained professionals at every location</p>
                    </div>
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-xl">
                        <div className="w-12 h-12 bg-[#1b2358]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-6 h-6 text-[#1b2358]" />
                        </div>
                        <h3 className="font-bold text-[#1b2358] mb-2">Convenient Hours</h3>
                        <p className="text-gray-600 text-sm">Extended hours including weekends</p>
                    </div>
                </div>

                {/* Store Locator Component */}
                <StoreLocator />
            </div>

            {/* Call to Action */}
            <div className="bg-linear-to-r from-[#FBB320] to-[#f7c24f] py-12 px-4 mt-12">
                <div className="container mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1b2358] mb-4">
                        Can't Find a Store Near You?
                    </h2>
                    <p className="text-[#1b2358]/80 mb-6 max-w-2xl mx-auto">
                        We deliver nationwide! Order online and get your tires and farm supplies delivered
                        directly to your location anywhere in Lesotho.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-[#1b2358] text-white hover:bg-[#151d4a] px-8 py-3 rounded-lg font-bold">
                            Shop Online
                        </button>
                        <button className="bg-white text-[#1b2358] hover:bg-gray-100 px-8 py-3 rounded-lg font-bold">
                            Contact Delivery Service
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}