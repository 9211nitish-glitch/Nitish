import Navigation from "@/components/ui/navigation";
import HeroSection from "@/components/sections/hero-section";
import StatsSection from "@/components/sections/stats-section";
import HowItWorksSection from "@/components/sections/how-it-works";
import AboutSection from "@/components/sections/about-section";
import FeaturesSection from "@/components/sections/features-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import BrandPartnersSection from "@/components/sections/brand-partners";
import BlogSection from "@/components/sections/blog-section";
import NewsletterSection from "@/components/sections/newsletter-section";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="bg-gray-900 text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <BrandPartnersSection />
      <BlogSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
