// components/contact/contact-section.tsx
"use client"

import { useState } from 'react'
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    User,
    Building,
    Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface FormData {
    name: string
    email: string
    phone: string
    company: string
    subject: string
    category: string
    message: string
    agreeToTerms: boolean
    subscribeNewsletter: boolean
}

interface FormErrors {
    [key: string]: string
}

export default function ContactSection() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        category: '',
        message: '',
        agreeToTerms: false,
        subscribeNewsletter: false
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const categories = [
        { value: 'tires', label: 'Tires Inquiry' },
        { value: 'bales', label: 'Farm Bales Inquiry' },
        { value: 'wholesale', label: 'Wholesale/Bulk Order' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'delivery', label: 'Delivery Inquiry' },
        { value: 'feedback', label: 'Feedback/Complaint' },
        { value: 'partnership', label: 'Business Partnership' },
        { value: 'other', label: 'Other' }
    ]

    const contactInfo = [
        {
            icon: Phone,
            title: "Phone Numbers",
            details: ["+266 1234 5678", "+266 9876 5432"],
            description: "Available 24/7 for urgent inquiries"
        },
        {
            icon: Mail,
            title: "Email Address",
            details: ["info@TD Holdings.com", "sales@TD Holdings.com", "support@TD Holdings.com"],
            description: "Response within 24 hours"
        },
        {
            icon: MapPin,
            title: "Our Location",
            details: ["123 Farm Road, Industrial Area", "Maseru 100, Lesotho"],
            description: "Visit our showroom"
        },
        {
            icon: Clock,
            title: "Business Hours",
            details: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 4:00 PM", "Sunday: 10:00 AM - 2:00 PM"],
            description: "Extended hours available by appointment"
        }
    ]

    const validateForm = () => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.category) newErrors.category = 'Please select a category'
        if (!formData.message.trim()) newErrors.message = 'Message is required'
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'

        return newErrors
    }

    const handleChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors = validateForm()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            // In real implementation, you would send data to your backend
            console.log('Form submitted:', formData)

            setIsSubmitted(true)
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                subject: '',
                category: '',
                message: '',
                agreeToTerms: false,
                subscribeNewsletter: false
            })
            setErrors({})
        } catch (error) {
            console.error('Submission error:', error)
            setErrors({ submit: 'Failed to submit form. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1b2358] mb-3">
                        Thank You for Contacting Us!
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Your message has been sent successfully. Our team will get back to you within 24 hours.
                    </p>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="p-4 bg-blue-50 rounded-lg text-left">
                            <p className="text-sm font-medium text-[#1b2358]">Reference Number</p>
                            <p className="text-2xl font-bold text-[#1b2358]">AT-{Date.now().toString().slice(-6)}</p>
                        </div>
                        <Button
                            onClick={() => setIsSubmitted(false)}
                            className="bg-[#1b2358] hover:bg-[#151d4a] w-full"
                        >
                            Send Another Message
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="py-16 px-4 bg-linear-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-[#FBB320]/10 rounded-full mb-4">
                        <MessageSquare className="w-8 h-8 text-[#FBB320]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b2358] mb-3">
                        Get in Touch
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Have questions? Need a quote? Our team is ready to assist you with all your tire and farm bale needs.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {contactInfo.map((item, index) => (
                                <Card key={index} className="border-gray-200 hover:border-[#1b2358]/30 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-[#1b2358]/10 rounded-lg">
                                                <item.icon className="w-6 h-6 text-[#1b2358]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1b2358] mb-2">{item.title}</h4>
                                                <div className="space-y-1">
                                                    {item.details.map((detail, idx) => (
                                                        <p key={idx} className="text-gray-700">{detail}</p>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-3">{item.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Quick Links */}
                            <Card className="border-gray-200">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-[#1b2358] mb-4">Quick Links</h4>
                                    <div className="space-y-3">
                                        <a href="/faq" className="flex items-center gap-2 text-gray-600 hover:text-[#1b2358]">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>FAQ & Support Center</span>
                                        </a>
                                        <a href="/catalog" className="flex items-center gap-2 text-gray-600 hover:text-[#1b2358]">
                                            <Globe className="w-4 h-4" />
                                            <span>Download Product Catalog</span>
                                        </a>
                                        <a href="/wholesale" className="flex items-center gap-2 text-gray-600 hover:text-[#1b2358]">
                                            <Building className="w-4 h-4" />
                                            <span>Wholesale Inquiries</span>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-gray-200 shadow-lg">
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name & Email */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                placeholder="John Doe"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="john@example.com"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone & Company */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Phone Number *
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                placeholder="+266 1234 5678"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company" className="flex items-center gap-2">
                                                <Building className="w-4 h-4" />
                                                Company (Optional)
                                            </Label>
                                            <Input
                                                id="company"
                                                value={formData.company}
                                                onChange={(e) => handleChange('company', e.target.value)}
                                                placeholder="Your company name"
                                            />
                                        </div>
                                    </div>

                                    {/* Category & Subject */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">
                                                Inquiry Type *
                                            </Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleChange('category', value)}
                                            >
                                                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.category}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">
                                                Subject (Optional)
                                            </Label>
                                            <Input
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => handleChange('subject', e.target.value)}
                                                placeholder="Brief subject line"
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message">
                                            Your Message *
                                        </Label>
                                        <Textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => handleChange('message', e.target.value)}
                                            placeholder="Please provide details about your inquiry..."
                                            rows={5}
                                            className={errors.message ? 'border-red-500' : ''}
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="agreeToTerms"
                                                checked={formData.agreeToTerms}
                                                onCheckedChange={(checked) => handleChange('agreeToTerms', checked as boolean)}
                                                className={errors.agreeToTerms ? 'border-red-500' : ''}
                                            />
                                            <div className="space-y-1">
                                                <label htmlFor="agreeToTerms" className="text-sm">
                                                    I agree to the{' '}
                                                    <a href="/privacy" className="text-[#1b2358] hover:underline">
                                                        privacy policy
                                                    </a>{' '}
                                                    and consent to being contacted by TD Holdings regarding my inquiry. *
                                                </label>
                                                {errors.agreeToTerms && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {errors.agreeToTerms}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="subscribeNewsletter"
                                                checked={formData.subscribeNewsletter}
                                                onCheckedChange={(checked) => handleChange('subscribeNewsletter', checked as boolean)}
                                            />
                                            <label htmlFor="subscribeNewsletter" className="text-sm">
                                                Subscribe to our newsletter for updates on new products, special offers, and farming tips.
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1b2358] hover:bg-[#151d4a] h-12 text-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>

                                    {errors.submit && (
                                        <p className="text-sm text-red-500 text-center">
                                            {errors.submit}
                                        </p>
                                    )}
                                </form>

                                {/* Support Note */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-blue-700">
                                                <strong>Urgent Support Needed?</strong> Call our emergency line at{' '}
                                                <a href="tel:+26698765432" className="font-bold hover:underline">
                                                    +266 9876 5432
                                                </a>{' '}
                                                for immediate assistance with tire emergencies or urgent farm supply needs.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map/Visit Us */}
                        <div className="mt-8 p-6 bg-linear-to-r from-[#1b2358] to-[#2a357a] rounded-xl text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-6 h-6" />
                                <h4 className="text-xl font-bold">Visit Our Showroom</h4>
                            </div>
                            <p className="mb-4 text-white/90">
                                Experience our products firsthand at our Maseru showroom. We offer:
                            </p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#FBB320] rounded-full" />
                                    <span>Product demonstrations</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#FBB320] rounded-full" />
                                    <span>Expert consultations</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#FBB320] rounded-full" />
                                    <span>Same-day pickup available</span>
                                </li>
                            </ul>
                            <Button className="bg-white text-[#1b2358] hover:bg-gray-100">
                                Get Directions
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}