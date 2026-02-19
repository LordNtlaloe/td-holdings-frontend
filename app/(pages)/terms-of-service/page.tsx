// app/terms/page.tsx
import { FileText, Scale, AlertTriangle, Truck, Leaf, Shield, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1b2358] to-[#2a357a] py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <Scale className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
                                    <p className="text-white/90 mt-2">TD Holdings Supply - Legal Agreement</p>
                                </div>
                            </div>
                            <p className="text-white/90 max-w-2xl">
                                Please read these terms carefully before using our services. By accessing or using our platform, you agree to be bound by these terms.
                            </p>
                        </div>
                        <div className="text-sm text-white/80 bg-white/10 rounded-lg p-4">
                            <p className="font-medium mb-2">Last Updated: {currentDate}</p>
                            <p>Version: 2.1</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Notice Banner */}
            <div className="bg-yellow-50 border-b border-yellow-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-800 font-medium">
                                Important: These Terms contain important information about your legal rights, remedies, and obligations.
                            </p>
                            <p className="text-yellow-700 text-sm mt-1">
                                By creating an account or making a purchase, you confirm that you accept these Terms and agree to comply with them.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Table of Contents Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h3 className="font-bold text-[#1b2358] mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Quick Navigation
                            </h3>
                            <nav className="space-y-1">
                                <a href="#acceptance" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    1. Acceptance of Terms
                                </a>
                                <a href="#account" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    2. Account Registration
                                </a>
                                <a href="#products" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    3. Products & Services
                                </a>
                                <a href="#pricing" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    4. Pricing & Payments
                                </a>
                                <a href="#delivery" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    5. Delivery & Installation
                                </a>
                                <a href="#returns" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    6. Returns & Warranties
                                </a>
                                <a href="#liability" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    7. Liability & Indemnification
                                </a>
                                <a href="#termination" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    8. Termination
                                </a>
                                <a href="#governing" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    9. Governing Law
                                </a>
                                <a href="#contact" className="block text-gray-600 hover:text-[#1b2358] py-2 px-3 rounded hover:bg-white">
                                    10. Contact Information
                                </a>
                            </nav>

                            {/* Quick Stats */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="font-medium text-[#1b2358] mb-3">Quick Facts</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>30-day return policy</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck className="w-4 h-4 text-blue-500" />
                                        <span>Free delivery over LSL 1000</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="w-4 h-4 text-[#FBB320]" />
                                        <span>1-year warranty on tires</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Leaf className="w-4 h-4 text-green-500" />
                                        <span>Fresh guarantee on bales</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms Content */}
                    <div className="lg:col-span-3">
                        <div className="prose prose-lg max-w-none">

                            {/* Introduction */}
                            <div className="mb-10">
                                <p className="text-gray-700 text-lg">
                                    Welcome to TD Holdings Supply. These Terms of Service ("Terms") govern your access to and use of our website,
                                    products, and services. Please read them carefully.
                                </p>
                                <div className="bg-gray-50 p-6 rounded-xl mt-6 border border-gray-200">
                                    <p className="text-gray-700 font-medium">
                                        <strong>Agreement:</strong> By accessing or using our services, you agree to be bound by these Terms.
                                        If you disagree with any part of these Terms, you may not access our services.
                                    </p>
                                </div>
                            </div>

                            {/* Section 1: Acceptance of Terms */}
                            <section id="acceptance" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#1b2358]/10 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-[#1b2358]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1b2358]">1. Acceptance of Terms</h2>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        These Terms constitute a legally binding agreement between you ("Customer", "you", or "your")
                                        and TD Holdings Supply ("Company", "we", "us", or "our").
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-[#1b2358] mb-3">Eligibility</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>You must be at least 18 years old</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Have legal capacity to enter into contracts</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Provide accurate and complete information</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-[#1b2358] mb-3">Modifications</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>We reserve the right to modify these Terms</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Continued use constitutes acceptance of changes</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Material changes will be notified via email</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6">
                                        <p className="text-gray-700">
                                            <strong>Important:</strong> If you are using our services on behalf of a business,
                                            you represent that you have the authority to bind that business to these Terms.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Account Registration */}
                            <section id="account" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">2. Account Registration and Security</h2>

                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-green-50 p-5 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Your Responsibilities
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                                <li>Provide accurate registration information</li>
                                                <li>Maintain confidentiality of your account credentials</li>
                                                <li>Notify us immediately of unauthorized access</li>
                                                <li>Update information to keep it current</li>
                                            </ul>
                                        </div>

                                        <div className="bg-red-50 p-5 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                                                <XCircle className="w-5 h-5" />
                                                Prohibited Activities
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                                <li>Creating fake or duplicate accounts</li>
                                                <li>Sharing account access with unauthorized users</li>
                                                <li>Using bots or automated tools to access services</li>
                                                <li>Impersonating another person or entity</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Account Termination Rights</h4>
                                        <p className="text-gray-700 mb-3">
                                            We reserve the right to suspend or terminate your account if:
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                            <li>You violate these Terms or applicable laws</li>
                                            <li>We suspect fraudulent or illegal activity</li>
                                            <li>Required by law or regulatory authority</li>
                                            <li>You pose a security risk to our services</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Products & Services */}
                            <section id="products" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#1b2358]/10 rounded-lg">
                                            <Truck className="w-6 h-6 text-[#1b2358]" />
                                        </div>
                                        <div className="p-2 bg-[#FBB320]/10 rounded-lg">
                                            <Leaf className="w-6 h-6 text-[#FBB320]" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1b2358]">3. Products and Services</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-[#1b2358] mb-3">Product Information</h4>
                                            <ul className="space-y-3 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Product descriptions are for informational purposes</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Images may differ slightly from actual products</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Specifications subject to change without notice</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-[#1b2358] mb-3">Availability</h4>
                                            <ul className="space-y-3 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Products subject to availability</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>We reserve right to limit quantities</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Prices subject to change without notice</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Agricultural Specific Terms */}
                                    <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Agricultural Product Specifics</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                    <Leaf className="w-4 h-4 text-green-600" />
                                                    Farm Bales
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                                    <li>Quality may vary seasonally</li>
                                                    <li>Storage conditions affect product quality</li>
                                                    <li>Recommended for specific livestock types</li>
                                                    <li>Moisture content specifications apply</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-blue-600" />
                                                    Tires & Equipment
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                                    <li>Suitable for specific vehicle types</li>
                                                    <li>Installation by certified technicians recommended</li>
                                                    <li>Proper maintenance required for warranty</li>
                                                    <li>Load ratings and speed indices specified</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Pricing & Payments */}
                            <section id="pricing" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">4. Pricing, Payments, and Taxes</h2>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <h4 className="font-bold text-[#1b2358] mb-4">Payment Terms</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2">Accepted Methods</h5>
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                    <li>Credit/Debit Cards (Visa, MasterCard)</li>
                                                    <li>Mobile Money (M-Pesa, EcoCash)</li>
                                                    <li>Bank Transfers</li>
                                                    <li>Cash on Delivery (limited areas)</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2">Payment Terms</h5>
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                    <li>Full payment required before delivery</li>
                                                    <li>Wholesale accounts: Net 30 days</li>
                                                    <li>Currency: Lesotho Loti (LSL)</li>
                                                    <li>All prices inclusive of VAT</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Pricing Policy</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1b2358] text-white flex items-center justify-center shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Price Changes</p>
                                                    <p className="text-gray-700 text-sm">
                                                        We reserve the right to adjust prices due to market conditions, currency fluctuations,
                                                        or supplier changes. Existing orders will be honored at the price quoted at time of order.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1b2358] text-white flex items-center justify-center shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Taxes</p>
                                                    <p className="text-gray-700 text-sm">
                                                        All prices include applicable taxes unless otherwise stated. You are responsible for
                                                        any additional taxes, duties, or fees imposed by your local jurisdiction.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: Delivery & Installation */}
                            <section id="delivery" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">5. Delivery, Installation, and Risk Transfer</h2>

                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="border border-gray-200 rounded-lg p-5 text-center">
                                            <Truck className="w-10 h-10 text-[#1b2358] mx-auto mb-3" />
                                            <h4 className="font-bold text-[#1b2358] mb-2">Delivery Terms</h4>
                                            <p className="text-gray-700 text-sm">
                                                Delivery timelines are estimates. We are not liable for delays due to weather,
                                                road conditions, or unforeseen circumstances.
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-5 text-center">
                                            <Shield className="w-10 h-10 text-[#1b2358] mx-auto mb-3" />
                                            <h4 className="font-bold text-[#1b2358] mb-2">Risk Transfer</h4>
                                            <p className="text-gray-700 text-sm">
                                                Risk of loss or damage transfers to you upon delivery. Inspect goods immediately
                                                and report any issues within 24 hours.
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-5 text-center">
                                            <CheckCircle className="w-10 h-10 text-[#1b2358] mx-auto mb-3" />
                                            <h4 className="font-bold text-[#1b2358] mb-2">Installation Services</h4>
                                            <p className="text-gray-700 text-sm">
                                                Installation services available at additional cost. Proper installation is required
                                                for warranty validation on tires.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border-l-4 border-[#FBB320] p-4">
                                        <p className="text-gray-700">
                                            <strong>Delivery Limitations:</strong> We deliver to most areas in Lesotho. Remote or
                                            difficult-to-access locations may incur additional delivery charges or have limited
                                            delivery options.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6: Returns & Warranties */}
                            <section id="returns" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">6. Returns, Refunds, and Warranties</h2>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <h4 className="font-bold text-[#1b2358] mb-4">Return Policy</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="p-3 text-left">Product Type</th>
                                                        <th className="p-3 text-left">Return Period</th>
                                                        <th className="p-3 text-left">Condition Required</th>
                                                        <th className="p-3 text-left">Restocking Fee</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="p-3">Tires (unused)</td>
                                                        <td className="p-3">30 days</td>
                                                        <td className="p-3">Original packaging, no marks</td>
                                                        <td className="p-3">10%</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3">Tires (used)</td>
                                                        <td className="p-3">7 days</td>
                                                        <td className="p-3">Manufacturing defects only</td>
                                                        <td className="p-3">None</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3">Farm Bales</td>
                                                        <td className="p-3">48 hours</td>
                                                        <td className="p-3">Quality issues, unopened</td>
                                                        <td className="p-3">None</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3">Equipment</td>
                                                        <td className="p-3">14 days</td>
                                                        <td className="p-3">Unused, original packaging</td>
                                                        <td className="p-3">15%</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Warranty Information</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-[#FBB320]" />
                                                    Tire Warranty
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                                    <li>1-year warranty against manufacturing defects</li>
                                                    <li>Pro-rata tread wear warranty</li>
                                                    <li>Excludes damage from improper installation</li>
                                                    <li>Road hazard coverage available separately</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                    <Leaf className="w-4 h-4 text-green-600" />
                                                    Bale Quality Guarantee
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                                    <li>Freshness guarantee on delivery</li>
                                                    <li>Moisture content specification</li>
                                                    <li>Free from mold and contaminants</li>
                                                    <li>Proper storage recommendations provided</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7: Liability & Indemnification */}
                            <section id="liability" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">7. Liability and Indemnification</h2>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Limitation of Liability</h4>
                                        <div className="space-y-4">
                                            <p className="text-gray-700">
                                                To the maximum extent permitted by law, TD Holdings Supply shall not be liable for:
                                            </p>
                                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                                <li>Indirect, incidental, or consequential damages</li>
                                                <li>Loss of profits, revenue, or data</li>
                                                <li>Damages exceeding the amount paid for the product</li>
                                                <li>Issues arising from improper use or installation</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Indemnification</h4>
                                        <p className="text-gray-700 mb-3">
                                            You agree to indemnify and hold harmless TD Holdings Supply, its officers, directors,
                                            employees, and agents from any claims, damages, or expenses arising from:
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                            <li>Your use of our products or services</li>
                                            <li>Your violation of these Terms</li>
                                            <li>Your violation of any rights of a third party</li>
                                            <li>Your negligent or wrongful conduct</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 8: Termination */}
                            <section id="termination" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">8. Termination and Suspension</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <h4 className="font-bold text-[#1b2358] mb-3">By TD Holdings Supply</h4>
                                        <p className="text-gray-700 mb-3">
                                            We may terminate or suspend your access immediately, without prior notice, if:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                            <li>You breach these Terms</li>
                                            <li>We suspect fraudulent activity</li>
                                            <li>Required by law or court order</li>
                                            <li>For security or technical reasons</li>
                                        </ul>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <h4 className="font-bold text-[#1b2358] mb-3">By You</h4>
                                        <p className="text-gray-700 mb-3">
                                            You may terminate your account at any time by:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                            <li>Contacting customer support</li>
                                            <li>Closing your account through settings</li>
                                            <li>Ceasing use of our services</li>
                                        </ul>
                                        <p className="text-gray-700 text-sm mt-3">
                                            Termination does not relieve you of payment obligations for purchases made.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 9: Governing Law */}
                            <section id="governing" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">9. Governing Law and Dispute Resolution</h2>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Governing Law</h4>
                                        <p className="text-gray-700">
                                            These Terms shall be governed by and construed in accordance with the laws of Lesotho,
                                            without regard to its conflict of law provisions.
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-3">Dispute Resolution</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1b2358] text-white flex items-center justify-center shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Negotiation</p>
                                                    <p className="text-gray-700 text-sm">
                                                        Parties agree to attempt to resolve disputes through good faith negotiation.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1b2358] text-white flex items-center justify-center shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Mediation</p>
                                                    <p className="text-gray-700 text-sm">
                                                        If negotiation fails, parties agree to mediation before resorting to litigation.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1b2358] text-white flex items-center justify-center shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Jurisdiction</p>
                                                    <p className="text-gray-700 text-sm">
                                                        Any legal action shall be brought in the courts of Maseru, Lesotho.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 10: Contact Information */}
                            <section id="contact" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">10. Contact Information and Notices</h2>

                                <div className="bg-linear-to-r from-[#1b2358] to-[#2a357a] rounded-xl p-8 text-white">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-4">Legal Department</h3>
                                            <div className="space-y-3">
                                                <p>
                                                    <strong>Address:</strong><br />
                                                    TD Holdings Supply Legal Department<br />
                                                    123 Farm Road, Industrial Area<br />
                                                    Maseru 100, Lesotho
                                                </p>
                                                <p>
                                                    <strong>Email:</strong> legal@TD Holdings.com
                                                </p>
                                                <p>
                                                    <strong>Phone:</strong> +266 2233 4455
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-4">Notices</h3>
                                            <p className="mb-4">
                                                All legal notices shall be in writing and delivered to the address above.
                                                Notices to you may be sent to the email address associated with your account.
                                            </p>
                                            <div className="space-y-2 text-white/90">
                                                <p className="text-sm">
                                                    <strong>Business Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
                                                </p>
                                                <p className="text-sm">
                                                    <strong>Emergency Contact:</strong> +266 9876 5432 (After hours)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Final Agreement */}
                            <div className="mt-12 p-8 bg-gray-50 rounded-xl border-2 border-gray-300">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-[#1b2358] mb-4">Agreement Acceptance</h3>
                                    <p className="text-gray-700 mb-6">
                                        By using our website, creating an account, or making a purchase, you acknowledge that you have read,
                                        understood, and agree to be bound by these Terms of Service.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Link
                                            href="/contact"
                                            className="px-6 py-3 bg-[#1b2358] text-white hover:bg-[#151d4a] rounded-lg font-medium"
                                        >
                                            Questions? Contact Us
                                        </Link>
                                        <Link
                                            href="/privacy"
                                            className="px-6 py-3 border border-[#1b2358] text-[#1b2358] hover:bg-[#1b2358] hover:text-white rounded-lg font-medium"
                                        >
                                            View Privacy Policy
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}