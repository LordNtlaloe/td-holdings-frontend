// components/home/category-showcase.tsx
export default function CategoryShowcase() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1b2358] mb-2">
                    Shop by Category
                </h2>
                <p className="text-gray-600">Browse our premium collections</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tires Category */}
                <div className="bg-linear-to-br from-[#1b2358] to-[#2a357a] rounded-xl p-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">🚗</div>
                        <div>
                            <h3 className="text-xl font-bold">Premium Tires</h3>
                            <p className="text-white/80">All-season, winter & performance</p>
                        </div>
                    </div>
                    <p className="mb-6">Top-quality tires for every vehicle and weather condition</p>
                    <button className="bg-white text-[#1b2358] hover:bg-gray-100 px-6 py-2 rounded-lg font-medium">
                        Shop Tires
                    </button>
                </div>

                {/* Bales Category */}
                <div className="bg-linear-to-br from-[#FBB320] to-[#f7c24f] rounded-xl p-8 text-[#1b2358]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">🌾</div>
                        <div>
                            <h3 className="text-xl font-bold">Farm Bales</h3>
                            <p className="text-[#1b2358]/80">Hay, straw & alfalfa</p>
                        </div>
                    </div>
                    <p className="mb-6">Fresh, high-quality bales for livestock and farming</p>
                    <button className="bg-[#1b2358] text-white hover:bg-[#151d4a] px-6 py-2 rounded-lg font-medium">
                        Shop Bales
                    </button>
                </div>
            </div>
        </div>
    )
}