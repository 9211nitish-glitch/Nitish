import { Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/ui/gradient-text";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-900" data-testid="about-section">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Modern creator studio with professional lighting and equipment setup" 
              className="rounded-2xl shadow-xl"
              data-testid="about-image"
            />
          </div>
          
          <div className="animate-fade-in">
            <h6 className="text-blue-400 font-semibold mb-4">ABOUT US</h6>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="about-title">
              Where Influencers Shine & <GradientText>Brands Connect</GradientText>
            </h2>
            <p className="text-gray-400 text-lg mb-8" data-testid="about-description">
              At Stars Flock, we believe that every creator is a star in their own right—and we're here to help them shine brighter. We are a next-generation platform built to connect talented influencers with powerful brands, enabling collaborations that are authentic, engaging, and rewarding for everyone involved.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20" data-testid="rising-star-tier">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Star className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Rising Star</h4>
                  <p className="text-gray-400">Perfect for growing creators</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20" data-testid="legendary-star-tier">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Crown className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Legendary Star</h4>
                  <p className="text-gray-400">For established influencers</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                data-testid="discover-more-button"
              >
                Discover More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
