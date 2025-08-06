import { Rocket, Play, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/ui/gradient-text";
import ParticleSystem from "@/components/three/particle-system";
import FloatingElements from "@/components/three/floating-elements";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-stars opacity-30"></div>
      <ParticleSystem count={60} speed={0.3} className="opacity-40" />
      <FloatingElements count={15} speed={0.2} className="opacity-20" />
      
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
            <Star className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-400 text-sm font-medium">India's #1 Creator Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="hero-main-title">
            India's Fastest-Growing<br />
            <GradientText>Creator Earning Platform</GradientText>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed" data-testid="hero-description">
            Are you an influencer or content creator struggling to monetize your content? 
            At Stars Flock, we connect you with genuine paid brand collaborations — both online and onsite — so you can turn every video into real income.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link href="/register">
              <Button 
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 min-w-[200px]"
                data-testid="start-earning-cta"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Earning Today
              </Button>
            </Link>
            <Button 
              variant="outline"
              size="lg"
              className="px-8 py-4 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl font-semibold text-lg transition-all duration-300 min-w-[200px] bg-gray-900/50 backdrop-blur-sm"
              data-testid="watch-demo-button"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">2000+</div>
              <div className="text-gray-400">Trusted Brands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-400">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">₹10M+</div>
              <div className="text-gray-400">Earnings Paid</div>
            </div>
          </div>
        </div>
        
        {/* Hero Image with 3D Effect */}
        <div className="relative animate-float max-w-6xl mx-auto">
          <div className="perspective-1000">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800" 
                alt="Content creator workspace with professional camera and lighting setup" 
                className="rounded-2xl shadow-2xl transform hover:rotateY-12 transition-transform duration-700 card-3d w-full"
                data-testid="hero-showcase-image"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -top-2 right-1/4 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-float opacity-70"></div>
              
              {/* Overlay Cards */}
              <div className="absolute -bottom-8 -left-8 bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Live Campaign</span>
                </div>
                <div className="text-green-400 font-bold">₹2,500 Earned</div>
              </div>
              
              <div className="absolute -top-8 -right-8 bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-medium">New Opportunity</span>
                </div>
                <div className="text-blue-400 font-bold">Fashion Brand</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
