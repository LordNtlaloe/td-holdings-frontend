// app/support/page.tsx
"use client"

import { useState } from 'react'
import {
    Search,
    HelpCircle,
    Phone,
    Mail,
    MessageCircle,
    Clock,
    Truck,
    Package,
    RotateCcw,
    Shield,
    CreditCard,
    MapPin,
    ChevronDown,
    ChevronUp,
    FileText,
    Users,
    BookOpen,
    MessageSquare,
    Star,
    CheckCircle,
    AlertCircle,
    ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface FAQ {
    question: string
    answer: string
    category: 'orders' | 'shipping' | 'returns' | 'payments' | 'products'
}

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFaqs, setExpandedFaqs] = useState<number[]>([])

    const faqs: FAQ[] = [
        // Orders
        {
            question: "How do I track my order?",
            answer: "You can track your order by logging into your account and visiting the 'My Orders' section. Alternatively, use the tracking number provided in your confirmation email on our tracking page. For large items like tires and bales, we'll also send SMS updates to your phone.",
            category: 'orders'
        },
        {
            question: "Can I modify or cancel my order?",
            answer: "You can modify or cancel your order within 15 minutes of placing it. After that, please contact our support team immediately at +266 1234 5678. For modifications, additional charges may apply depending on the changes.",
            category: 'orders'
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept M-Pesa Mobile Money (most popular in Lesotho), Visa/MasterCard credit/debit cards, and Cash on Delivery (with additional LSL 20 fee, available in major towns only).",
            category: 'orders'
        },

        // Shipping
        {
            question: "What are your delivery options and costs?",
            answer: "We offer: Standard (3-5 days, FREE for orders over LSL 1000, otherwise LSL 49.99), Express (1-2 days, LSL 99.99), and Same-Day (Maseru only, order before 2PM, LSL 199.99). Farm bales have special delivery rates.",
            category: 'shipping'
        },
        {
            question: "Do you deliver to rural areas in Lesotho?",
            answer: "Yes! We deliver to all districts in Lesotho. Delivery times to rural areas may be longer (5-7 business days). Additional fees may apply for remote locations. Contact us for specific delivery quotes to your area.",
            category: 'shipping'
        },
        {
            question: "Can someone else receive my delivery?",
            answer: "Yes, you can authorize someone else to receive your delivery. Please provide their name and phone number in the delivery instructions during checkout. They will need to show ID upon delivery.",
            category: 'shipping'
        },

        // Returns
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unused items in original packaging. Tires must be unused with all stickers intact. Bales cannot be returned once opened due to hygiene reasons. Return shipping is free for defective items.",
            category: 'returns'
        },
        {
            question: "How do I return an item?",
            answer: "1. Contact our support team to get a Return Authorization Number. 2. Pack the item securely in its original packaging. 3. Bring it to our Maseru warehouse or schedule a pickup (LSL 99 fee for pickup). Refunds are processed within 5-7 business days.",
            category: 'returns'
        },
        {
            question: "What if my item arrives damaged?",
            answer: "If your item arrives damaged, take photos immediately and contact us within 24 hours. We'll arrange for a replacement or refund. For large items like tires, our delivery team can help document the damage on-site.",
            category: 'returns'
        },

        // Payments
        {
            question: "Is it safe to pay online?",
            answer: "Yes! We use 256-bit SSL encryption and secure payment gateways. We don't store your card details. For M-Pesa payments, you'll receive a secure USSD prompt directly from your mobile provider.",
            category: 'payments'
        },
        {
            question: "Why was my payment declined?",
            answer: "Common reasons: insufficient funds, incorrect card details, daily transaction limit reached, or security hold by your bank. Try M-Pesa for instant payments or contact your bank. You can also pay Cash on Delivery.",
            category: 'payments'
        },
        {
            question: "When will I get my refund?",
            answer: "Refunds are processed within 5-7 business days after we receive the returned item. For card payments, it may take 7-10 days to appear on your statement. M-Pesa refunds are usually instant once processed.",
            category: 'payments'
        },

        // Products
        {
            question: "How do I choose the right tire size?",
            answer: "Check your current tire sidewall for numbers like '225/45R17'. The first number is width in mm, second is aspect ratio, R means radial, last number is rim diameter in inches. You can also use our tire finder tool or contact our tire experts.",
            category: 'products'
        },
        {
            question: "What's the difference between hay and straw bales?",
            answer: "Hay bales are for animal feed (made from grasses/legumes), while straw bales are for bedding/mulch (made from grain stalks). We offer premium hay bales (50 lbs) and standard straw bales (40 lbs).",
            category: 'products'
        },
        {
            question: "Do you offer installation services for tires?",
            answer: "Yes! We offer tire installation at our Maseru service center (LSL 99 per tire, includes balancing). We can also recommend trusted garages in your area. Contact us to schedule an appointment.",
            category: 'products'
        }
    ]

    const toggleFaq = (index: number) => {
        setExpandedFaqs(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const filteredFaqs = searchQuery
        ? faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqs

    const categories = [
        { id: 'all', name: 'All Questions', count: faqs.length, icon: HelpCircle },
        { id: 'orders', name: 'Orders', count: faqs.filter(f => f.category === 'orders').length, icon: Package },
        { id: 'shipping', name: 'Shipping', count: faqs.filter(f => f.category === 'shipping').length, icon: Truck },
        { id: 'returns', name: 'Returns', count: faqs.filter(f => f.category === 'returns').length, icon: RotateCcw },
        { id: 'payments', name: 'Payments', count: faqs.filter(f => f.category === 'payments').length, icon: CreditCard },
        { id: 'products', name: 'Products', count: faqs.filter(f => f.category === 'products').length, icon: Package },
    ]

    const contactMethods = [
        {
            icon: Phone,
            title: "Call Us",
            description: "Speak with our support team",
            details: "+266 1234 5678",
            hours: "Mon-Sat: 8AM-6PM, Sun: 9AM-4PM",
            action: "Call Now",
            color: "bg-blue-50 text-blue-700",
            iconColor: "text-blue-600"
        },
        {
            icon: Mail,
            title: "Email Us",
            description: "Get help via email",
            details: "support@TD Holdings.com",
            hours: "Response within 4 hours",
            action: "Send Email",
            color: "bg-green-50 text-green-700",
            iconColor: "text-green-600"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with an agent",
            details: "Available on website",
            hours: "Mon-Fri: 9AM-5PM",
            action: "Start Chat",
            color: "bg-purple-50 text-purple-700",
            iconColor: "text-purple-600"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            description: "Our service center",
            details: "123 Industrial Area, Maseru",
            hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-1PM",
            action: "Get Directions",
            color: "bg-orange-50 text-orange-700",
            iconColor: "text-orange-600"
        }
    ]

    const popularTopics = [
        { title: "Track Your Order", icon: Truck, link: "/track-order" },
        { title: "Return an Item", icon: RotateCcw, link: "/returns" },
        { title: "Payment Methods", icon: CreditCard, link: "/payment-methods" },
        { title: "Delivery Areas", icon: MapPin, link: "/delivery" },
        { title: "Product Guides", icon: BookOpen, link: "/guides" },
        { title: "Warranty Info", icon: Shield, link: "/warranty" },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1b2358] to-[#2a3478] text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">How can we help you today?</h1>
                        <p className="text-lg text-blue-100 mb-8">
                            Get answers about orders, shipping, returns, payments, and our products
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="search"
                                placeholder="Search for answers (e.g., 'track order', 'return policy', 'tire sizes')..."
                                className="pl-12 pr-4 py-6 text-base bg-white text-gray-900 border-0 focus:ring-2 focus:ring-[#FBB320]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c]">
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Quick Help Cards */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1b2358] mb-6">Get Help Quickly</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactMethods.map((method, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center mb-4`}>
                                        <method.icon className={`w-6 h-6 ${method.iconColor}`} />
                                    </div>
                                    <h3 className="font-bold text-[#1b2358] mb-2">{method.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                                    <div className="space-y-2 mb-4">
                                        <p className="font-medium">{method.details}</p>
                                        <p className="text-sm text-gray-500">{method.hours}</p>
                                    </div>
                                    <Button className={`w-full ${method.color.replace('bg-', 'bg-').replace(' text-', ' hover:bg-')}`}>
                                        {method.action}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#1b2358]">Frequently Asked Questions</h2>
                        <Badge className="bg-[#FBB320] text-[#1b2358] hover:bg-[#FBB320]">
                            {faqs.length} Questions
                        </Badge>
                    </div>

                    {/* Category Filter */}
                    <Tabs defaultValue="all" className="mb-8">
                        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
                            {categories.map((category) => {
                                const Icon = category.icon
                                return (
                                    <TabsTrigger
                                        key={category.id}
                                        value={category.id}
                                        className="data-[state=active]:bg-[#1b2358] data-[state=active]:text-white"
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {category.name}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {category.count}
                                        </Badge>
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>

                        {categories.map((category) => (
                            <TabsContent key={category.id} value={category.id} className="space-y-4">
                                {filteredFaqs
                                    .filter(faq => category.id === 'all' || faq.category === category.id)
                                    .map((faq, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-0">
                                                <button
                                                    onClick={() => toggleFaq(index)}
                                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                                                            <HelpCircle className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[#1b2358] mb-1">{faq.question}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={
                                                                    faq.category === 'orders' ? 'bg-blue-100 text-blue-800' :
                                                                        faq.category === 'shipping' ? 'bg-green-100 text-green-800' :
                                                                            faq.category === 'returns' ? 'bg-purple-100 text-purple-800' :
                                                                                faq.category === 'payments' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-orange-100 text-orange-800'
                                                                }>
                                                                    {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                                                                </Badge>
                                                                <span className="text-sm text-gray-500">Click to {expandedFaqs.includes(index) ? 'collapse' : 'expand'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {expandedFaqs.includes(index) ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                                {expandedFaqs.includes(index) && (
                                                    <div className="px-6 pb-6 ml-14 border-t pt-4">
                                                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                                        <div className="mt-4 flex gap-2">
                                                            <Button size="sm" variant="outline">
                                                                <Star className="w-4 h-4 mr-2" />
                                                                Helpful
                                                            </Button>
                                                            <Button size="sm" variant="ghost">
                                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                                Not Helpful
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                {/* Popular Topics */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1b2358] mb-6">Popular Topics</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularTopics.map((topic, index) => (
                            <Link key={index} href={topic.link}>
                                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <topic.icon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[#1b2358] mb-1">{topic.title}</h3>
                                                <p className="text-sm text-gray-600">Learn more about this topic</p>
                                            </div>
                                            <ExternalLink className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Support Channels */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Community & Resources */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-6 h-6 text-[#1b2358]" />
                                <h3 className="text-xl font-bold text-[#1b2358]">Community & Resources</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-medium">Farmer's Forum</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Connect with other farmers and share experiences with our products
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Join Community
                                    </Button>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <BookOpen className="w-5 h-5 text-green-600" />
                                        <h4 className="font-medium">Product Guides</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Learn how to install tires, store bales, and maintain your farm equipment
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Browse Guides
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Support */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-6 h-6 text-[#1b2358]" />
                                <h3 className="text-xl font-bold text-[#1b2358]">Business & Wholesale</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Bulk Orders & Farm Supply</h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Special pricing for farms, businesses, and government contracts
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            Request Quote
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Call Sales: +266 9876 5432
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-2">Installation Services</h4>
                                    <p className="text-sm text-green-700 mb-3">
                                        Professional tire installation and farm equipment maintenance
                                    </p>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        Schedule Service
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Legal Links */}
                <Card className="border-dashed">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-[#1b2358] mb-4">Legal & Policies</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href="/privacy" className="block">
                                <div className="p-4 border rounded-lg hover:border-[#1b2358] hover:bg-blue-50 transition-colors">
                                    <FileText className="w-5 h-5 text-gray-400 mb-2" />
                                    <p className="font-medium">Privacy Policy</p>
                                    <p className="text-sm text-gray-600">How we protect your data</p>
                                </div>
                            </Link>
                            <Link href="/terms" className="block">
                                <div className="p-4 border rounded-lg hover:border-[#1b2358] hover:bg-blue-50 transition-colors">
                                    <FileText className="w-5 h-5 text-gray-400 mb-2" />
                                    <p className="font-medium">Terms of Service</p>
                                    <p className="text-sm text-gray-600">Our terms and conditions</p>
                                </div>
                            </Link>
                            <Link href="/warranty" className="block">
                                <div className="p-4 border rounded-lg hover:border-[#1b2358] hover:bg-blue-50 transition-colors">
                                    <Shield className="w-5 h-5 text-gray-400 mb-2" />
                                    <p className="font-medium">Warranty</p>
                                    <p className="text-sm text-gray-600">Product warranties & guarantees</p>
                                </div>
                            </Link>
                            <Link href="/returns" className="block">
                                <div className="p-4 border rounded-lg hover:border-[#1b2358] hover:bg-blue-50 transition-colors">
                                    <RotateCcw className="w-5 h-5 text-gray-400 mb-2" />
                                    <p className="font-medium">Return Policy</p>
                                    <p className="text-sm text-gray-600">How to return items</p>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Still Need Help */}
                <div className="text-center mt-12">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1b2358] mb-3">Still Need Help?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                        Our customer support team is ready to assist you with any questions or concerns you may have.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-[#1b2358] hover:bg-[#151d4a] px-8">
                            <Phone className="w-5 h-5 mr-2" />
                            Call Support Now
                        </Button>
                        <Button variant="outline" className="px-8">
                            <Mail className="w-5 h-5 mr-2" />
                            Email Support
                        </Button>
                        <Link href="/contact">
                            <Button variant="ghost" className="px-8">
                                Contact Form
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}