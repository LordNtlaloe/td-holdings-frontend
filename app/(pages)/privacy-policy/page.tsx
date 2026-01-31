
import { Shield, Lock, Eye, UserCheck, Mail, FileText } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1b2358] to-[#2a357a] py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
                            </div>
                            <p className="text-white/90 max-w-2xl">
                                Protecting your privacy is our priority. Learn how we collect, use, and safeguard your information.
                            </p>
                        </div>
                        <div className="text-sm text-white/80 bg-white/10 rounded-lg p-4">
                            <p className="font-medium mb-2">Last Updated: December 2024</p>
                            <p>Effective Date: January 1, 2023</p>
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
                            <nav className="space-y-2">
                                <a href="#information-collected" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    1. Information We Collect
                                </a>
                                <a href="#how-we-use" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    2. How We Use Your Information
                                </a>
                                <a href="#information-sharing" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    3. Information Sharing
                                </a>
                                <a href="#data-security" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    4. Data Security
                                </a>
                                <a href="#your-rights" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    5. Your Rights
                                </a>
                                <a href="#cookies" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    6. Cookies & Tracking
                                </a>
                                <a href="#children-privacy" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    7. Children's Privacy
                                </a>
                                <a href="#changes" className="block text-gray-600 hover:text-[#1b2358] py-2 border-b border-gray-100">
                                    8. Policy Changes
                                </a>
                                <a href="#contact" className="block text-gray-600 hover:text-[#1b2358] py-2">
                                    9. Contact Us
                                </a>
                            </nav>

                            {/* Quick Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                                <Link href="/terms" className="block text-sm text-[#1b2358] hover:underline">
                                    ↳ Terms of Service
                                </Link>
                                <Link href="/cookie-policy" className="block text-sm text-[#1b2358] hover:underline">
                                    ↳ Cookie Policy
                                </Link>
                                <Link href="/data-request" className="block text-sm text-[#1b2358] hover:underline">
                                    ↳ Data Access Request
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Policy Content */}
                    <div className="lg:col-span-3">
                        <div className="prose prose-lg max-w-none">
                            {/* Introduction */}
                            <div className="mb-8">
                                <p className="text-gray-700">
                                    At TD Holdings Supply, we are committed to protecting your privacy and ensuring the security of your personal information.
                                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website,
                                    use our services, or interact with us in any way.
                                </p>
                                <div className="bg-blue-50 border-l-4 border-[#1b2358] p-4 my-6">
                                    <p className="text-gray-700 font-medium">
                                        By using our services, you agree to the collection and use of information in accordance with this policy.
                                    </p>
                                </div>
                            </div>

                            {/* Section 1: Information We Collect */}
                            <section id="information-collected" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#1b2358]/10 rounded-lg">
                                        <UserCheck className="w-6 h-6 text-[#1b2358]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1b2358]">1. Information We Collect</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
                                        <p className="text-gray-700 mb-3">We collect personal information that you voluntarily provide to us, including:</p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                            <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                                            <li><strong>Business Information:</strong> Company name, tax identification number, business registration details</li>
                                            <li><strong>Payment Information:</strong> Credit card details, bank account information (processed securely through our payment providers)</li>
                                            <li><strong>Purchase History:</strong> Products purchased, order history, delivery addresses</li>
                                            <li><strong>Communication Records:</strong> Emails, chat transcripts, phone call recordings (for quality assurance)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
                                        <p className="text-gray-700">When you visit our website, we may automatically collect:</p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                                            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                                            <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns</li>
                                            <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                                            <li><strong>Cookies & Tracking Technologies:</strong> See our Cookie Policy for details</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Information from Third Parties</h3>
                                        <p className="text-gray-700">We may receive information about you from:</p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                                            <li>Business partners and suppliers</li>
                                            <li>Social media platforms (when you interact with our social media pages)</li>
                                            <li>Credit reference agencies (for credit checks on wholesale accounts)</li>
                                            <li>Publicly available sources</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: How We Use Your Information */}
                            <section id="how-we-use" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#1b2358]/10 rounded-lg">
                                        <Eye className="w-6 h-6 text-[#1b2358]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1b2358]">2. How We Use Your Information</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Service Provision</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                            <li>Process orders and payments</li>
                                            <li>Arrange delivery and installation</li>
                                            <li>Provide customer support</li>
                                            <li>Manage your account</li>
                                            <li>Send order confirmations and updates</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Business Operations</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                            <li>Improve our products and services</li>
                                            <li>Conduct market research</li>
                                            <li>Analyze website usage</li>
                                            <li>Prevent fraud and ensure security</li>
                                            <li>Comply with legal obligations</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Marketing & Communication</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                            <li>Send promotional offers (with your consent)</li>
                                            <li>Newsletter subscriptions</li>
                                            <li>Product announcements</li>
                                            <li>Customer surveys</li>
                                            <li>Personalized recommendations</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Legal & Compliance</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                            <li>Tax reporting and compliance</li>
                                            <li>Regulatory requirements</li>
                                            <li>Dispute resolution</li>
                                            <li>Enforcement of terms</li>
                                            <li>Legal claims defense</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-[#FBB320]">
                                    <p className="text-gray-700">
                                        <strong>Note:</strong> We will only use your personal information for the purposes for which we collected it,
                                        unless we reasonably consider that we need to use it for another reason that is compatible with the original purpose.
                                    </p>
                                </div>
                            </section>

                            {/* Section 3: Information Sharing */}
                            <section id="information-sharing" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#1b2358]/10 rounded-lg">
                                        <Mail className="w-6 h-6 text-[#1b2358]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1b2358]">3. Information Sharing and Disclosure</h2>
                                </div>

                                <p className="text-gray-700 mb-4">
                                    We do not sell your personal information. We may share your information with:
                                </p>

                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Service Providers</h4>
                                        <p className="text-gray-700">
                                            Third-party vendors who provide services on our behalf, such as:
                                        </p>
                                        <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                            <li>Payment processors (M-Pesa, banks, credit card companies)</li>
                                            <li>Delivery and logistics companies</li>
                                            <li>IT and hosting services</li>
                                            <li>Marketing and analytics providers</li>
                                            <li>Customer support platforms</li>
                                        </ul>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Legal Requirements</h4>
                                        <p className="text-gray-700">
                                            We may disclose your information if required by law or in response to:
                                        </p>
                                        <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                            <li>Court orders or legal processes</li>
                                            <li>Government requests</li>
                                            <li>To protect our rights, privacy, safety, or property</li>
                                            <li>To prevent or investigate possible wrongdoing</li>
                                        </ul>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Business Transfers</h4>
                                        <p className="text-gray-700">
                                            In connection with any merger, sale of company assets, financing, or acquisition of all or
                                            a portion of our business to another company, your information may be transferred.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500">
                                    <p className="text-gray-700">
                                        <strong>Data Processing Agreements:</strong> All third-party service providers are required to
                                        maintain the confidentiality and security of your personal information and are prohibited from
                                        using it for any other purpose.
                                    </p>
                                </div>
                            </section>

                            {/* Section 4: Data Security */}
                            <section id="data-security" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#1b2358]/10 rounded-lg">
                                        <Lock className="w-6 h-6 text-[#1b2358]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1b2358]">4. Data Security</h2>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        We implement appropriate technical and organizational security measures to protect your
                                        personal information against unauthorized access, alteration, disclosure, or destruction.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-2">Technical Measures</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                                <li>SSL/TLS encryption for data transmission</li>
                                                <li>Firewalls and intrusion detection systems</li>
                                                <li>Regular security audits and testing</li>
                                                <li>Secure data centers with physical access controls</li>
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-2">Organizational Measures</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                                <li>Employee training on data protection</li>
                                                <li>Access controls and authentication</li>
                                                <li>Data minimization principles</li>
                                                <li>Incident response procedures</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-red-50 border-l-4 border-red-500">
                                        <p className="text-gray-700">
                                            <strong>Important:</strong> While we strive to use commercially acceptable means to protect
                                            your personal information, no method of transmission over the Internet or electronic storage
                                            is 100% secure. We cannot guarantee absolute security.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: Your Rights */}
                            <section id="your-rights" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">5. Your Rights and Choices</h2>

                                <div className="space-y-6">
                                    <p className="text-gray-700">
                                        Depending on your location, you may have the following rights regarding your personal information:
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-[#1b2358] mb-3">Access & Correction</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Right to access your personal information</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Right to correct inaccurate information</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Right to request deletion of your information</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-[#1b2358] mb-3">Control & Objection</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Right to object to processing</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Right to restrict processing</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-[#1b2358] rounded-full mt-2"></div>
                                                    <span>Right to data portability</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-5 rounded-lg">
                                        <h4 className="font-bold text-[#1b2358] mb-2">How to Exercise Your Rights</h4>
                                        <p className="text-gray-700 mb-3">
                                            To exercise any of these rights, please contact us using the information in the "Contact Us" section below.
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            We may need to verify your identity before processing your request. We will respond to your
                                            request within 30 days, as required by applicable law.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-yellow-50 border-l-4 border-[#FBB320]">
                                        <p className="text-gray-700">
                                            <strong>Marketing Preferences:</strong> You can opt-out of receiving marketing communications
                                            from us at any time by:
                                        </p>
                                        <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                            <li>Clicking the "unsubscribe" link in any marketing email</li>
                                            <li>Updating your preferences in your account settings</li>
                                            <li>Contacting our customer service team</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6: Cookies */}
                            <section id="cookies" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">6. Cookies and Tracking Technologies</h2>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        We use cookies and similar tracking technologies to track activity on our website and
                                        store certain information. For detailed information about the cookies we use and your
                                        choices regarding cookies, please see our <Link href="/cookie-policy" className="text-[#1b2358] hover:underline">Cookie Policy</Link>.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-2">Essential Cookies</h4>
                                            <p className="text-gray-700 text-sm">Required for website functionality</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-2">Analytics Cookies</h4>
                                            <p className="text-gray-700 text-sm">Help us understand website usage</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-[#1b2358] mb-2">Marketing Cookies</h4>
                                            <p className="text-gray-700 text-sm">Used for advertising purposes</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7: Children's Privacy */}
                            <section id="children-privacy" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">7. Children's Privacy</h2>

                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700">
                                        Our services are not directed to individuals under the age of 18. We do not knowingly
                                        collect personal information from children under 18. If you are a parent or guardian and
                                        you are aware that your child has provided us with personal information, please contact us.
                                    </p>
                                    <p className="text-gray-700 mt-3">
                                        If we become aware that we have collected personal information from children without
                                        verification of parental consent, we take steps to remove that information from our servers.
                                    </p>
                                </div>
                            </section>

                            {/* Section 8: Policy Changes */}
                            <section id="changes" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">8. Changes to This Privacy Policy</h2>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        We may update our Privacy Policy from time to time. We will notify you of any changes by
                                        posting the new Privacy Policy on this page and updating the "Last Updated" date.
                                    </p>

                                    <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-[#FBB320]">
                                        <h4 className="font-bold text-[#1b2358] mb-2">Notification of Changes</h4>
                                        <p className="text-gray-700">
                                            For material changes, we will notify you through:
                                        </p>
                                        <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                            <li>Email notification (if you have an account with us)</li>
                                            <li>A prominent notice on our website</li>
                                            <li>Direct communication for significant changes</li>
                                        </ul>
                                    </div>

                                    <p className="text-gray-700">
                                        You are advised to review this Privacy Policy periodically for any changes. Changes to this
                                        Privacy Policy are effective when they are posted on this page.
                                    </p>
                                </div>
                            </section>

                            {/* Section 9: Contact Us */}
                            <section id="contact" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-[#1b2358] mb-6">9. Contact Us</h2>

                                <div className="bg-linear-to-r from-[#1b2358] to-[#2a357a] rounded-xl p-8 text-white">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-4">Data Protection Officer</h3>
                                            <div className="space-y-3">
                                                <p>
                                                    <strong>Email:</strong> dpo@TD Holdings.com
                                                </p>
                                                <p>
                                                    <strong>Phone:</strong> +266 2233 4455
                                                </p>
                                                <p>
                                                    <strong>Address:</strong> 123 Farm Road, Industrial Area<br />
                                                    Maseru 100, Lesotho
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-4">Make a Request</h3>
                                            <p className="mb-4">
                                                To exercise your rights or make a privacy-related inquiry, please:
                                            </p>
                                            <div className="space-y-3">
                                                <Link
                                                    href="/data-request"
                                                    className="inline-flex items-center gap-2 bg-white text-[#1b2358] hover:bg-gray-100 px-4 py-2 rounded-lg font-medium"
                                                >
                                                    Submit Data Request Form
                                                </Link>
                                                <p className="text-white/80 text-sm">
                                                    We aim to respond to all requests within 30 days.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold text-[#1b2358] mb-3">Supervisory Authority</h4>
                                    <p className="text-gray-700">
                                        If you have concerns about our data processing activities, you have the right to lodge
                                        a complaint with the Data Protection Authority of Lesotho.
                                    </p>
                                    <p className="text-gray-700 mt-2">
                                        <strong>Office of the Data Protection Commissioner:</strong><br />
                                        Ministry of Communications, Science and Technology<br />
                                        P.O. Box 36, Maseru 100, Lesotho
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Banner */}
            <div className="bg-gray-50 border-t border-gray-200 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-[#1b2358] mb-1">Need More Information?</h3>
                            <p className="text-gray-600">Review our related policies and documents</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/terms"
                                className="px-4 py-2 border border-[#1b2358] text-[#1b2358] hover:bg-[#1b2358] hover:text-white rounded-lg transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/cookie-policy"
                                className="px-4 py-2 border border-[#1b2358] text-[#1b2358] hover:bg-[#1b2358] hover:text-white rounded-lg transition-colors"
                            >
                                Cookie Policy
                            </Link>
                            <Link
                                href="/contact"
                                className="px-4 py-2 bg-[#1b2358] text-white hover:bg-[#151d4a] rounded-lg transition-colors"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}