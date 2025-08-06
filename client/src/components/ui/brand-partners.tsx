const brandLogos = [
  { name: "TechCorp", color: "from-red-500 to-red-600" },
  { name: "FashionX", color: "from-blue-500 to-blue-600" },
  { name: "FoodieHub", color: "from-green-500 to-green-600" },
  { name: "TravelCo", color: "from-purple-500 to-purple-600" },
  { name: "SportsBrand", color: "from-yellow-500 to-yellow-600" },
  { name: "BeautyPlus", color: "from-pink-500 to-pink-600" },
  { name: "GadgetZone", color: "from-cyan-500 to-cyan-600" },
  { name: "LifeStyle", color: "from-orange-500 to-orange-600" },
  { name: "EcoFriendly", color: "from-teal-500 to-teal-600" },
  { name: "DigitalHub", color: "from-indigo-500 to-indigo-600" },
];

export default function BrandPartnersSection() {
  return (
    <section className="py-16 bg-gray-900 border-y border-gray-800" data-testid="brand-partners-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="brand-partners-title">
            <span className="gradient-text">2000+</span> Brands Trust Us
          </h2>
          <p className="text-gray-400">
            Partnering with industry leaders across all verticals
          </p>
        </div>
        
        {/* Animated Brand Logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee">
            {/* First set */}
            <div className="flex space-x-12 shrink-0">
              {brandLogos.map((brand, index) => (
                <div 
                  key={`${brand.name}-1`}
                  className={`flex-shrink-0 w-32 h-16 bg-gradient-to-r ${brand.color} rounded-lg flex items-center justify-center font-bold text-white transform hover:scale-105 transition-transform duration-300 shadow-lg`}
                  data-testid={`brand-logo-${index + 1}`}
                >
                  {brand.name}
                </div>
              ))}
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex space-x-12 shrink-0 ml-12">
              {brandLogos.map((brand, index) => (
                <div 
                  key={`${brand.name}-2`}
                  className={`flex-shrink-0 w-32 h-16 bg-gradient-to-r ${brand.color} rounded-lg flex items-center justify-center font-bold text-white transform hover:scale-105 transition-transform duration-300 shadow-lg`}
                  data-testid={`brand-logo-duplicate-${index + 1}`}
                >
                  {brand.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }} data-testid="trust-indicator-1">
            <div className="text-3xl font-bold text-blue-400 mb-2">Fortune 500</div>
            <div className="text-gray-400">Companies trust us</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }} data-testid="trust-indicator-2">
            <div className="text-3xl font-bold text-purple-400 mb-2">15+</div>
            <div className="text-gray-400">Industry verticals</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }} data-testid="trust-indicator-3">
            <div className="text-3xl font-bold text-pink-400 mb-2">99%</div>
            <div className="text-gray-400">Client satisfaction</div>
          </div>
        </div>

        {/* Featured Partnerships */}
        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">Featured Brand Partnerships</h3>
            <p className="text-gray-400">Recent successful collaborations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors" data-testid="featured-partnership-1">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mx-auto mb-3"></div>
              <div className="font-semibold">TechCorp</div>
              <div className="text-sm text-gray-400">500+ creators • 2M+ reach</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors" data-testid="featured-partnership-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mx-auto mb-3"></div>
              <div className="font-semibold">FoodieHub</div>
              <div className="text-sm text-gray-400">300+ creators • 1.5M+ reach</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors" data-testid="featured-partnership-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mx-auto mb-3"></div>
              <div className="font-semibold">FashionX</div>
              <div className="text-sm text-gray-400">800+ creators • 3M+ reach</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
