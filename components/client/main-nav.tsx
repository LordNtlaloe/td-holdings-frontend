"use client"
import { Input } from '@/components/ui/input'
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select"
import { Search, User, Heart, RefreshCw, ShoppingCart, ChevronDown, MapPin, Truck, Phone, Menu, Star, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from 'react'
import { usePos } from '@/contexts/cart-context'
import Link from 'next/link'

export default function MainNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const { cart, calculateTotals, getCartItemCount } = usePos()
    const { subtotal } = calculateTotals()
    const cartTotal = subtotal
    const cartItemCount = getCartItemCount()

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="container mx-auto px-3 sm:px-4">
                {/* Top Info Bar - Hidden on small mobile */}
                <div className="hidden sm:flex items-center justify-between py-1 md:py-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                            <div className="w-2 h-2 rounded-full bg-[#FBB320]"></div>
                            Store Open: Mon-Fri 8AM-6PM
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                            <Phone size={12} />
                            +266 2231 2231
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-[#1b2358] transition-colors text-xs md:text-sm">
                            <MapPin size={12} />
                            Store Locator
                        </button>
                        <Separator orientation="vertical" className="h-3" />
                        <button className="hover:text-[#1b2358] transition-colors text-xs md:text-sm">Order Tracking</button>
                        <Separator orientation="vertical" className="h-3" />
                        <button className="hover:text-[#1b2358] transition-colors text-xs md:text-sm">Help & Support</button>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="flex items-center justify-between py-2 sm:py-3 md:py-4">
                    {/* Logo and Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            className="md:hidden p-1.5 rounded-lg bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} className="text-[#1b2358]" /> : <Menu size={20} className="text-[#1b2358]" />}
                        </button>

                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#1b2358] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg md:text-xl">G</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#1b2358] leading-tight">
                                    TD Holdings
                                </h1>
                                <p className="hidden xs:block text-[10px] sm:text-xs text-gray-500 -mt-0.5">Premium Tires & Automotive</p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar - Desktop & Tablet */}
                    <div className="hidden sm:flex flex-1 max-w-xl lg:max-w-2xl mx-4 lg:mx-8">
                        <div className="flex w-full">
                            <div className="relative flex-1">
                                <NativeSelect className="absolute left-0 top-0 h-10 md:h-12 border-r rounded-l-md rounded-r-none text-white bg-[#1b2358] hover:bg-[#151d4a] w-28 md:w-32">
                                    <NativeSelectOption value="">All</NativeSelectOption>
                                    <NativeSelectOption value="tires">Tires</NativeSelectOption>
                                    <NativeSelectOption value="bales">Bales</NativeSelectOption>
                                    <NativeSelectOption value="wheels">Wheels</NativeSelectOption>
                                    <NativeSelectOption value="accessories">Accessories</NativeSelectOption>
                                </NativeSelect>
                                <Input
                                    className="w-full pl-28 md:pl-32 pr-10 py-1.5 md:py-2 rounded-l-none border-l-0 focus:ring-2 focus:ring-[#1b2358]/20 border-gray-200 h-10 md:h-12"
                                    placeholder="Search tires, brands..."
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-0 top-0 h-full rounded-l-none bg-[#1b2358] hover:bg-[#151d4a] w-10 md:w-12"
                                >
                                    <Search size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Toggle */}
                    <div className="sm:hidden mr-2">
                        <button
                            className="p-1.5 rounded-lg bg-gray-100"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            {isSearchOpen ? <X size={20} className="text-[#1b2358]" /> : <Search size={20} className="text-[#1b2358]" />}
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                        {/* Account - Hidden on mobile, icon only on tablet */}
                        <div className="hidden md:flex items-center gap-2 group cursor-pointer">
                            <div className="p-1.5 md:p-2 rounded-full bg-gray-100 group-hover:bg-[#1b2358]/10 transition-colors">
                                <User size={16} className="text-[#1b2358]" />
                            </div>
                            <div className="hidden lg:flex flex-col">
                                <span className="text-sm font-medium text-[#1b2358]">My Account</span>
                                <span className="text-xs text-gray-500">Sign in / Register</span>
                            </div>
                        </div>

                        {/* Wishlist - Icon only on tablet */}
                        <div className="hidden md:block relative group cursor-pointer">
                            <div className="p-1.5 md:p-2 rounded-full bg-gray-100 group-hover:bg-red-50 transition-colors">
                                <Heart size={16} className="text-[#1b2358]" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Badge className="h-4 min-w-4 px-0.5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-[10px]">
                                    2
                                </Badge>
                            </div>
                            <div className="absolute top-full mt-2 hidden group-hover:block w-32 bg-white border rounded-lg shadow-lg p-2 text-sm z-10">
                                Wishlist Items
                            </div>
                        </div>

                        {/* Compare - Icon only on tablet */}
                        <div className="hidden md:block relative group cursor-pointer">
                            <div className="p-1.5 md:p-2 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors">
                                <RefreshCw size={16} className="text-[#1b2358]" />
                            </div>
                            <div className="absolute top-full mt-2 hidden group-hover:block w-32 bg-white border rounded-lg shadow-lg p-2 text-sm z-10">
                                Compare Products
                            </div>
                        </div>

                        {/* Cart - Full on desktop, icon only on mobile/tablet */}
                        <div className="relative group">
                            <Link href="/cart">
                                <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-[#FBB320] rounded-lg hover:bg-[#e6a21c] transition-colors">
                                    <div className="relative">
                                        <ShoppingCart size={16} className="text-[#1b2358]" />
                                        <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 flex items-center justify-center bg-[#1b2358] hover:bg-[#151d4a] text-white text-[10px]">
                                            {cartItemCount}
                                        </Badge>
                                    </div>
                                    <div className="hidden lg:flex flex-col items-start ml-1">
                                        <span className="text-sm font-medium text-[#1b2358] leading-none">Your Cart</span>
                                        <span className="text-xs text-[#1b2358]/80">LSL {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <ChevronDown size={14} className="text-[#1b2358] hidden lg:block ml-1" />
                                </button>
                            </Link>

                            {/* Cart Dropdown */}
                            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-64 md:w-72 lg:w-80 bg-white border rounded-lg shadow-xl z-20">
                                <div className="p-3 md:p-4">
                                    <h4 className="font-medium mb-3 text-[#1b2358] text-sm md:text-base">Shopping Cart</h4>
                                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                        {cart.length === 0 ? (
                                            <div className="text-sm text-gray-500 text-center py-4">
                                                Your cart is empty
                                            </div>
                                        ) : (
                                            cart.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="text-2xl">
                                                        {item.product?.type === 'TIRE' ? '🚗' : '🌾'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.product?.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                            <span className="text-xs font-medium">
                                                                LSL {(item.unitPrice * item.quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between mb-3 text-sm">
                                            <span className="text-[#1b2358]">Subtotal:</span>
                                            <span className="font-medium text-[#1b2358]">LSL {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <Link href="/cart">
                                            <Button className="w-full bg-[#1b2358] hover:bg-[#151d4a] text-white text-sm">View Cart</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="sm:hidden py-2 border-t animate-in slide-in-from-top duration-200">
                        <div className="flex w-full">
                            <NativeSelect
                                className="w-28 border-r-0 rounded-r-none bg-[#1b2358] hover:bg-[#151d4a] border-gray-200 text-white text-sm"
                            >
                                <NativeSelectOption value="">All</NativeSelectOption>
                                <NativeSelectOption value="tires">Tires</NativeSelectOption>
                                <NativeSelectOption value="bales">Bales</NativeSelectOption>
                            </NativeSelect>
                            <Input
                                className="flex-1 rounded-l-none border-l-0 border-gray-200 text-sm"
                                placeholder="Search tires..."
                                autoFocus
                            />
                            <Button
                                size="icon"
                                className="rounded-l-none bg-[#1b2358] hover:bg-[#151d4a] w-10"
                            >
                                <Search size={18} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Categories Bar - Desktop only */}
                <div className="hidden md:flex items-center justify-between py-2 md:py-3 border-t">
                    <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
                        <button className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#1b2358] text-white rounded-lg hover:bg-[#151d4a] transition-colors text-sm">
                            <Menu size={14} />
                            <span>All Categories</span>
                            <ChevronDown size={12} />
                        </button>
                        <div className="flex items-center gap-3 lg:gap-4 md:gap-5 text-xs md:text-sm">
                            <Link href="/products" className="font-medium text-[#1b2358] hover:text-[#FBB320] transition-colors whitespace-nowrap">New Arrivals</Link>
                            <Link href="/products" className="font-medium text-[#1b2358] hover:text-[#FBB320] transition-colors whitespace-nowrap">Best Sellers</Link>
                            <Link href="/products" className="font-medium text-[#1b2358] hover:text-[#FBB320] transition-colors whitespace-nowrap">Tires</Link>
                            <Link href="/products" className="font-medium text-[#1b2358] hover:text-[#FBB320] transition-colors whitespace-nowrap">Wheels</Link>
                            <Link href="/services" className="font-medium text-[#1b2358] hover:text-[#FBB320] transition-colors whitespace-nowrap">Services</Link>
                            <Link href="/deals" className="font-medium text-[#1b2358] hover:text-[#FBB320] transition-colors whitespace-nowrap">Deals</Link>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 text-xs md:text-sm">
                        <Badge variant="outline" className="bg-[#FBB320]/10 text-[#1b2358] border-[#FBB320]/30 text-xs">
                            <Truck size={10} className="mr-1" />
                            Free Shipping
                        </Badge>
                        <Badge variant="outline" className="bg-[#1b2358]/10 text-[#1b2358] border-[#1b2358]/30 text-xs">
                            <Star size={10} className="mr-1 fill-[#FBB320] text-[#FBB320]" />
                            4.9/5 Rating
                        </Badge>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t animate-in slide-in-from-top duration-200">
                        <div className="py-3 space-y-4">
                            {/* Mobile Categories */}
                            <div className="px-2">
                                <h3 className="text-sm font-medium text-[#1b2358] mb-2">Categories</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/products" className="p-2 rounded bg-gray-50 text-sm text-[#1b2358] hover:bg-[#1b2358] hover:text-white transition-colors">New Arrivals</Link>
                                    <Link href="/products" className="p-2 rounded bg-gray-50 text-sm text-[#1b2358] hover:bg-[#1b2358] hover:text-white transition-colors">Best Sellers</Link>
                                    <Link href="/products" className="p-2 rounded bg-gray-50 text-sm text-[#1b2358] hover:bg-[#1b2358] hover:text-white transition-colors">Tires</Link>
                                    <Link href="/products" className="p-2 rounded bg-gray-50 text-sm text-[#1b2358] hover:bg-[#1b2358] hover:text-white transition-colors">Wheels</Link>
                                    <Link href="/services" className="p-2 rounded bg-gray-50 text-sm text-[#1b2358] hover:bg-[#1b2358] hover:text-white transition-colors">Services</Link>
                                    <Link href="/deals" className="p-2 rounded bg-gray-50 text-sm text-[#1b2358] hover:bg-[#1b2358] hover:text-white transition-colors">Deals</Link>
                                </div>
                            </div>

                            {/* Mobile Actions */}
                            <div className="px-2 border-t pt-3">
                                <h3 className="text-sm font-medium text-[#1b2358] mb-2">Account</h3>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                                        <User size={18} className="text-[#1b2358]" />
                                        <span className="text-sm text-[#1b2358]">My Account</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                                        <Heart size={18} className="text-[#1b2358]" />
                                        <span className="text-sm text-[#1b2358]">Wishlist</span>
                                        <Badge className="ml-auto bg-red-500 text-white text-xs">2</Badge>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                                        <RefreshCw size={18} className="text-[#1b2358]" />
                                        <span className="text-sm text-[#1b2358]">Compare</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Contact */}
                            <div className="px-2 border-t pt-3">
                                <h3 className="text-sm font-medium text-[#1b2358] mb-2">Contact</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} className="text-[#1b2358]" />
                                        <span>+266 2231 2231</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={14} className="text-[#1b2358]" />
                                        <span>Store Locator</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}