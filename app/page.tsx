// app/page.tsx - Simplified Main Page

import CategoryShowcase from "@/components/client/category-showcase";
import ContactSection from "@/components/client/contact";
import Footer from "@/components/client/footer";
import HeroCarousel from "@/components/client/hero-carousel";
import MainNav from "@/components/client/main-nav";
import ProductCatalog from "@/components/client/product-list";
import Reviews from "@/components/client/review-component";
import ReviewsSection from "@/components/client/reviews";
import TestimonialCarousel from "@/components/client/testimonial";
import TopProducts from "@/components/client/top-products";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <HeroCarousel />
      <TopProducts />
      {/* <ProductCatalog /> */}
      <CategoryShowcase />
      <TestimonialCarousel />
      <ContactSection />
      <Footer />
    </div>
  )
}