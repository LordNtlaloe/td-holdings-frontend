// components/layout/footer.tsx
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    Clock,
    CreditCard,
    Truck,
    Shield,
    Headphones,
    Download,
    Send,
    ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-[#1b2358] text-white">
            {/* Newsletter Section */}
            <div className="bg-linear-to-r from-[#2a357a] to-[#3a479a] py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left">
                            <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
                            <p className="text-white/80">Get updates on new products, exclusive offers, and farming tips.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 w-full sm:w-80"
                            />
                            <Button className="bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358] font-bold">
                                <Send className="mr-2 h-4 w-4" />
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="text-3xl">🚜</div>
                                <div>
                                    <h3 className="text-2xl font-bold">TD Holdings Supply</h3>
                                    <p className="text-white/80">Premium Tires & Farm Solutions</p>
                                </div>
                            </div>
                            <p className="text-white/80 mb-6">
                                Your trusted partner for quality tires and farm bales since 2010.
                                We provide top-notch products and exceptional service to farmers,
                                businesses, and individuals across the region.
                            </p>
                            <div className="flex gap-4">
                                <Button size="icon" variant="outline" className="border-white/20 hover:bg-white/10">
                                    <Facebook className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="outline" className="border-white/20 hover:bg-white/10">
                                    <Twitter className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="outline" className="border-white/20 hover:bg-white/10">
                                    <Instagram className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="outline" className="border-white/20 hover:bg-white/10">
                                    <Youtube className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="outline" className="border-white/20 hover:bg-white/10">
                                    <Linkedin className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tires" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        All Tires
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/bales" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Farm Bales
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        FAQ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div>
                            <h4 className="text-lg font-bold mb-6">Categories</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/tires/all-season" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        All Season Tires
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tires/winter" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Winter Tires
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tires/truck" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Truck Tires
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/bales/hay" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Hay Bales
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/bales/straw" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Straw Bales
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/bales/alfalfa" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                        Alfalfa Bales
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-lg font-bold mb-6">Contact Info</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-[#FBB320] mt-0.5" />
                                    <div>
                                        <p className="font-medium">Address</p>
                                        <p className="text-white/80">123 Farm Road, Maseru 100<br />Lesotho</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-[#FBB320]" />
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-white/80">+266 1234 5678</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-[#FBB320]" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-white/80">info@TD Holdings.com</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-[#FBB320]" />
                                    <div>
                                        <p className="font-medium">Business Hours</p>
                                        <p className="text-white/80">Mon-Sat: 8AM - 6PM<br />Sun: 9AM - 2PM</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Bar */}
            <div className="bg-[#2a357a] py-8 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <Truck className="h-8 w-8 text-[#FBB320]" />
                            </div>
                            <div>
                                <h5 className="font-bold">Free Delivery</h5>
                                <p className="text-white/80 text-sm">Orders over LSL 1000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <Shield className="h-8 w-8 text-[#FBB320]" />
                            </div>
                            <div>
                                <h5 className="font-bold">Quality Guarantee</h5>
                                <p className="text-white/80 text-sm">1 Year Warranty</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <CreditCard className="h-8 w-8 text-[#FBB320]" />
                            </div>
                            <div>
                                <h5 className="font-bold">Secure Payment</h5>
                                <p className="text-white/80 text-sm">100% Secure</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <Headphones className="h-8 w-8 text-[#FBB320]" />
                            </div>
                            <div>
                                <h5 className="font-bold">24/7 Support</h5>
                                <p className="text-white/80 text-sm">Dedicated Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-6 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-white/80">
                                &copy; {currentYear} TD Holdings Supply. All rights reserved.
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-white/80 hover:text-white text-sm">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-white/80 hover:text-white text-sm">
                                Terms of Service
                            </Link>
                            <Link href="/sitemap" className="text-white/80 hover:text-white text-sm">
                                Sitemap
                            </Link>
                            <div className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-[#FBB320]" />
                                <Link href="/catalog" className="text-white/80 hover:text-white text-sm">
                                    Download Catalog
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}