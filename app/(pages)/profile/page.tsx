// app/account/page.tsx
"use client"

import { useState } from 'react'
import {
    User,
    Heart,
    Package,
    Settings,
    LogOut,
    Edit2,
    Check,
    Truck,
    Calendar,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    Shield,
    Bell,
    Eye,
    EyeOff,
    ChevronRight,
    Star,
    ShoppingCart,
    Clock,
    AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface Order {
    id: string
    date: string
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
    items: number
    total: number
    products: ProductOrder[]
}

interface ProductOrder {
    id: number
    name: string
    quantity: number
    price: number
    image: string
}

interface WishlistItem {
    id: number
    name: string
    category: 'tires' | 'bales'
    price: number
    originalPrice?: number
    image: string
    addedDate: string
    inStock: boolean
}

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('overview')
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Mock user data
    const [userData, setUserData] = useState({
        firstName: 'John',
        lastName: 'Farmer',
        email: 'john.farmer@example.com',
        phone: '+266 1234 5678',
        address: '123 Farm Road, Maseru 100, Lesotho',
        businessName: 'Green Valley Farms',
        businessType: 'farm',
        accountType: 'premium',
        joinedDate: '2023-01-15',
        notifications: {
            email: true,
            sms: true,
            promotions: false,
            orderUpdates: true
        }
    })

    // Mock orders
    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'AT-2024-0012',
            date: '2024-12-15',
            status: 'delivered',
            items: 4,
            total: 589.96,
            products: [
                { id: 1, name: 'All-Season Performance Tire', quantity: 2, price: 129.99, image: '🚗' },
                { id: 6, name: 'Premium Hay Bales', quantity: 2, price: 25.00, image: '🌾' }
            ]
        },
        {
            id: 'AT-2024-0011',
            date: '2024-12-10',
            status: 'shipped',
            items: 8,
            total: 151.92,
            products: [
                { id: 8, name: 'Straw Bales Standard', quantity: 8, price: 8.99, image: '🌿' }
            ]
        },
        {
            id: 'AT-2024-0010',
            date: '2024-12-05',
            status: 'processing',
            items: 1,
            total: 189.99,
            products: [
                { id: 3, name: 'Off-Road Beast XT', quantity: 1, price: 189.99, image: '🏔️' }
            ]
        },
        {
            id: 'AT-2024-0009',
            date: '2024-11-28',
            status: 'cancelled',
            items: 3,
            total: 56.97,
            products: [
                { id: 10, name: 'Organic Hay Bundle', quantity: 3, price: 18.99, image: '♻️' }
            ]
        }
    ])

    // Mock wishlist
    const [wishlist, setWishlist] = useState<WishlistItem[]>([
        {
            id: 2,
            name: 'Winter Grip Pro',
            category: 'tires',
            price: 159.99,
            image: '❄️',
            addedDate: '2024-12-10',
            inStock: true
        },
        {
            id: 4,
            name: 'Sport Racing Elite',
            category: 'tires',
            price: 229.99,
            originalPrice: 279.99,
            image: '🏁',
            addedDate: '2024-12-05',
            inStock: true
        },
        {
            id: 7,
            name: 'Alfalfa Premium',
            category: 'bales',
            price: 18.99,
            image: '🍀',
            addedDate: '2024-12-01',
            inStock: true
        },
        {
            id: 9,
            name: 'Mixed Grass Bales',
            category: 'bales',
            price: 15.99,
            image: '🌱',
            addedDate: '2024-11-20',
            inStock: false
        }
    ])

    const stats = {
        totalOrders: 12,
        totalSpent: 2850.50,
        wishlistItems: wishlist.length,
        loyaltyPoints: 1250
    }

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        // In real app, this would make an API call
        setIsEditingProfile(false)
        alert('Profile updated successfully!')
    }

    const removeFromWishlist = (id: number) => {
        setWishlist(prev => prev.filter(item => item.id !== id))
    }

    const moveToCart = (item: WishlistItem) => {
        // In real app, this would add to cart
        alert(`Added ${item.name} to cart!`)
    }

    const cancelOrder = (orderId: string) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId
                ? { ...order, status: 'cancelled' as const }
                : order
        ))
        alert(`Order ${orderId} has been cancelled.`)
    }

    const reorder = (order: Order) => {
        // In real app, this would re-add items to cart
        alert('Items added to cart for reorder!')
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'processing': return 'bg-blue-500'
            case 'shipped': return 'bg-purple-500'
            case 'delivered': return 'bg-green-500'
            case 'cancelled': return 'bg-red-500'
        }
    }

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'processing': return 'Processing'
            case 'shipped': return 'Shipped'
            case 'delivered': return 'Delivered'
            case 'cancelled': return 'Cancelled'
        }
    }

    const getOrderIcon = (status: Order['status']) => {
        switch (status) {
            case 'processing': return <Clock className="w-4 h-4" />
            case 'shipped': return <Truck className="w-4 h-4" />
            case 'delivered': return <Check className="w-4 h-4" />
            case 'cancelled': return <AlertCircle className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-linear-to-r from-[#1b2358] to-[#2a357a] py-8 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl">
                                <User className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    {userData.firstName} {userData.lastName}
                                </h1>
                                <p className="text-white/80 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {userData.email}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-[#FBB320] text-[#1b2358]">
                                        {userData.accountType} Member
                                    </Badge>
                                    <span className="text-white/60 text-sm">
                                        Member since {new Date(userData.joinedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                onClick={() => setIsEditingProfile(true)}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex items-center justify-between w-full p-3 rounded-lg ${activeTab === 'overview' ? 'bg-[#1b2358] text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5" />
                                            <span>Account Overview</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`flex items-center justify-between w-full p-3 rounded-lg ${activeTab === 'orders' ? 'bg-[#1b2358] text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Package className="w-5 h-5" />
                                            <span>My Orders</span>
                                        </div>
                                        {orders.length > 0 && (
                                            <Badge className="bg-[#FBB320] text-[#1b2358]">
                                                {orders.length}
                                            </Badge>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('wishlist')}
                                        className={`flex items-center justify-between w-full p-3 rounded-lg ${activeTab === 'wishlist' ? 'bg-[#1b2358] text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Heart className="w-5 h-5" />
                                            <span>Wishlist</span>
                                        </div>
                                        {wishlist.length > 0 && (
                                            <Badge className="bg-[#FBB320] text-[#1b2358]">
                                                {wishlist.length}
                                            </Badge>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`flex items-center justify-between w-full p-3 rounded-lg ${activeTab === 'settings' ? 'bg-[#1b2358] text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Settings className="w-5 h-5" />
                                            <span>Account Settings</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </nav>

                                {/* Stats */}
                                <div className="mt-8 pt-6 border-t">
                                    <h4 className="font-medium text-[#1b2358] mb-4">Your Stats</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Total Orders</span>
                                            <span className="font-bold text-[#1b2358]">{stats.totalOrders}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Total Spent</span>
                                            <span className="font-bold text-[#1b2358]">LSL {stats.totalSpent.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Wishlist Items</span>
                                            <span className="font-bold text-[#1b2358]">{stats.wishlistItems}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Loyalty Points</span>
                                            <span className="font-bold text-[#1b2358]">{stats.loyaltyPoints}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Welcome Card */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-[#1b2358]">Welcome back, {userData.firstName}!</h2>
                                            <Badge className="bg-[#FBB320] text-[#1b2358]">
                                                Premium Member
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 mb-6">
                                            Here's what's happening with your TD Holdings account today.
                                        </p>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-[#1b2358] mb-1">{orders.length}</div>
                                                <p className="text-sm text-gray-600">Active Orders</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-[#1b2358] mb-1">{wishlist.length}</div>
                                                <p className="text-sm text-gray-600">Wishlist Items</p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-[#1b2358] mb-1">LSL {stats.totalSpent.toFixed(2)}</div>
                                                <p className="text-sm text-gray-600">Total Spent</p>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-[#1b2358] mb-1">{stats.loyaltyPoints}</div>
                                                <p className="text-sm text-gray-600">Loyalty Points</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Orders */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-[#1b2358]">Recent Orders</h3>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setActiveTab('orders')}
                                                className="text-[#1b2358]"
                                            >
                                                View All Orders
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {orders.slice(0, 2).map(order => (
                                                <div key={order.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-[#1b2358]">{order.id}</span>
                                                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                                                    {getStatusText(order.status)}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                                {new Date(order.date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-lg text-[#1b2358]">
                                                                LSL {order.total.toFixed(2)}
                                                            </div>
                                                            <p className="text-sm text-gray-500">{order.items} items</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {order.products.map(product => (
                                                            <div key={product.id} className="flex items-center gap-2">
                                                                <div className="text-xl">{product.image}</div>
                                                                <span className="text-sm text-gray-600">{product.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Wishlist Preview */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-[#1b2358]">Wishlist Items</h3>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setActiveTab('wishlist')}
                                                className="text-[#1b2358]"
                                            >
                                                View All Wishlist
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {wishlist.slice(0, 2).map(item => (
                                                <div key={item.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-3xl">{item.image}</div>
                                                            <div>
                                                                <h4 className="font-medium text-[#1b2358]">{item.name}</h4>
                                                                <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="font-bold text-[#1b2358]">
                                                                        LSL {item.price.toFixed(2)}
                                                                    </span>
                                                                    {item.originalPrice && (
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            LSL {item.originalPrice.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => removeFromWishlist(item.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-[#1b2358]">My Orders</h2>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Orders</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <Card key={order.id}>
                                            <CardContent className="p-6">
                                                {/* Order Header */}
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold text-[#1b2358]">{order.id}</h3>
                                                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                                                                <div className="flex items-center gap-1">
                                                                    {getOrderIcon(order.status)}
                                                                    {getStatusText(order.status)}
                                                                </div>
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(order.date).toLocaleDateString()}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{order.items} items</span>
                                                            <span>•</span>
                                                            <span className="font-bold text-[#1b2358]">
                                                                LSL {order.total.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {order.status === 'processing' && (
                                                            <Button
                                                                variant="outline"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => cancelOrder(order.id)}
                                                            >
                                                                Cancel Order
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => reorder(order)}
                                                        >
                                                            Reorder
                                                        </Button>
                                                        <Button className="bg-[#1b2358] hover:bg-[#151d4a]">
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="border-t pt-4">
                                                    <h4 className="font-medium text-[#1b2358] mb-3">Items</h4>
                                                    <div className="space-y-3">
                                                        {order.products.map(product => (
                                                            <div key={product.id} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-2xl">{product.image}</div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-800">{product.name}</p>
                                                                        <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-medium text-[#1b2358]">
                                                                        LSL {product.price.toFixed(2)}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        Total: LSL {(product.price * product.quantity).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Order Actions */}
                                                {order.status === 'delivered' && (
                                                    <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                                                        <Button variant="outline">Return Item</Button>
                                                        <Button variant="outline">Download Invoice</Button>
                                                        <Button className="bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c]">
                                                            Write Review
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-[#1b2358]">My Wishlist</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">{wishlist.length} items</span>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (wishlist.length > 0) {
                                                    alert('All items added to cart!')
                                                }
                                            }}
                                            disabled={wishlist.length === 0}
                                        >
                                            Add All to Cart
                                        </Button>
                                    </div>
                                </div>

                                {wishlist.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
                                            <p className="text-gray-600 mb-6">Save your favorite products here for easy access</p>
                                            <Button className="bg-[#1b2358] hover:bg-[#151d4a]">
                                                Browse Products
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {wishlist.map(item => (
                                            <Card key={item.id}>
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="text-4xl">{item.image}</div>
                                                            <div>
                                                                <h3 className="font-bold text-[#1b2358] mb-1">{item.name}</h3>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Badge className={
                                                                        item.category === 'tires'
                                                                            ? 'bg-[#1b2358] hover:bg-[#151d4a]'
                                                                            : 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]'
                                                                    }>
                                                                        {item.category === 'tires' ? 'Tire' : 'Bale'}
                                                                    </Badge>
                                                                    {!item.inStock && (
                                                                        <Badge variant="outline" className="border-red-500 text-red-600">
                                                                            Out of Stock
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 mb-3">
                                                                    Added on {new Date(item.addedDate).toLocaleDateString()}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl font-bold text-[#1b2358]">
                                                                        LSL {item.price.toFixed(2)}
                                                                    </span>
                                                                    {item.originalPrice && (
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            LSL {item.originalPrice.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => removeFromWishlist(item.id)}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            className="flex-1 bg-[#1b2358] hover:bg-[#151d4a]"
                                                            onClick={() => moveToCart(item)}
                                                            disabled={!item.inStock}
                                                        >
                                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                                            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                                        </Button>
                                                        <Button variant="outline" className="flex-1">
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-[#1b2358]">Account Settings</h2>

                                {/* Personal Information */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-[#1b2358] flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Personal Information
                                            </h3>
                                            {!isEditingProfile && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditingProfile(true)}
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit Information
                                                </Button>
                                            )}
                                        </div>

                                        {isEditingProfile ? (
                                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="firstName">First Name</Label>
                                                        <Input
                                                            id="firstName"
                                                            value={userData.firstName}
                                                            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="lastName">Last Name</Label>
                                                        <Input
                                                            id="lastName"
                                                            value={userData.lastName}
                                                            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={userData.email}
                                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        value={userData.phone}
                                                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Textarea
                                                        id="address"
                                                        value={userData.address}
                                                        onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="businessName">Business Name</Label>
                                                        <Input
                                                            id="businessName"
                                                            value={userData.businessName}
                                                            onChange={(e) => setUserData({ ...userData, businessName: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="businessType">Business Type</Label>
                                                        <Select
                                                            value={userData.businessType}
                                                            onValueChange={(value) => setUserData({ ...userData, businessType: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select business type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="farm">Farm</SelectItem>
                                                                <SelectItem value="transport">Transport</SelectItem>
                                                                <SelectItem value="retail">Retail</SelectItem>
                                                                <SelectItem value="wholesale">Wholesale</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        type="submit"
                                                        className="bg-[#1b2358] hover:bg-[#151d4a]"
                                                    >
                                                        Save Changes
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsEditingProfile(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Full Name</p>
                                                        <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Email</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <Mail className="w-4 h-4" />
                                                            {userData.email}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Phone</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <Phone className="w-4 h-4" />
                                                            {userData.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Business</p>
                                                        <p className="font-medium">{userData.businessName}</p>
                                                        <p className="text-sm text-gray-600 capitalize">{userData.businessType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Address</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            {userData.address}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Account Type</p>
                                                        <Badge className="bg-[#FBB320] text-[#1b2358]">
                                                            {userData.accountType}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Password & Security */}
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-[#1b2358] mb-6 flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            Password & Security
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Change Password</p>
                                                    <p className="text-sm text-gray-600">Update your password regularly</p>
                                                </div>
                                                <Button variant="outline">Change Password</Button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Two-Factor Authentication</p>
                                                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                                </div>
                                                <Switch />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Login Sessions</p>
                                                    <p className="text-sm text-gray-600">Manage your active sessions</p>
                                                </div>
                                                <Button variant="outline">View Sessions</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notification Preferences */}
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-[#1b2358] mb-6 flex items-center gap-2">
                                            <Bell className="w-5 h-5" />
                                            Notification Preferences
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Email Notifications</p>
                                                    <p className="text-sm text-gray-600">Order updates, promotions, and newsletters</p>
                                                </div>
                                                <Switch
                                                    checked={userData.notifications.email}
                                                    onCheckedChange={(checked) =>
                                                        setUserData({
                                                            ...userData,
                                                            notifications: { ...userData.notifications, email: checked }
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">SMS Notifications</p>
                                                    <p className="text-sm text-gray-600">Delivery updates and urgent alerts</p>
                                                </div>
                                                <Switch
                                                    checked={userData.notifications.sms}
                                                    onCheckedChange={(checked) =>
                                                        setUserData({
                                                            ...userData,
                                                            notifications: { ...userData.notifications, sms: checked }
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Promotional Offers</p>
                                                    <p className="text-sm text-gray-600">Special deals and discounts</p>
                                                </div>
                                                <Switch
                                                    checked={userData.notifications.promotions}
                                                    onCheckedChange={(checked) =>
                                                        setUserData({
                                                            ...userData,
                                                            notifications: { ...userData.notifications, promotions: checked }
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Order Updates</p>
                                                    <p className="text-sm text-gray-600">Order status and delivery tracking</p>
                                                </div>
                                                <Switch
                                                    checked={userData.notifications.orderUpdates}
                                                    onCheckedChange={(checked) =>
                                                        setUserData({
                                                            ...userData,
                                                            notifications: { ...userData.notifications, orderUpdates: checked }
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Danger Zone */}
                                <Card className="border-red-200">
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-red-700 mb-6">Danger Zone</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Delete Account</p>
                                                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                                                </div>
                                                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                                    Delete Account
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Download Data</p>
                                                    <p className="text-sm text-gray-600">Download a copy of your personal data</p>
                                                </div>
                                                <Button variant="outline">Request Data</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Add missing X icon component
const X = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)