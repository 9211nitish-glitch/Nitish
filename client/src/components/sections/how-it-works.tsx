import { UserPlus, Edit, Search, Handshake, DollarSign, Share2, ArrowRight } from "lucide-react";
import GradientText from "@/components/ui/gradient-text";
import Card3D from "@/components/ui/card-3d";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up on our platform with your basic details—name, contact info, and social media handles.",
    gradient: "from-blue-500 to-purple-600",
    delay: "0s",
  },
  {
    icon: Edit,
    title: "Complete Your Profile",
    description: "Fill in your profile to help us know you better and get more chances to get selected!",
    gradient: "from-purple-500 to-pink-500",
    delay: "0.1s",
  },
  {
    icon: Search,
    title: "Find Brand",
    description: "Our team will review your profile and connect you with brands looking for influencers like you.",
    gradient: "from-pink-500 to-orange-500",
    delay: "0.2s",
  },
  {
    icon: Handshake,
    title: "Collaborate",
    description: "Once matched, you'll receive campaign briefs and collaboration details. Accept campaigns that fit your style.",
    gradient: "from-orange-500 to-cyan-500",
    delay: "0.3s",
  },
  {
    icon: DollarSign,
    title: "Get Paid & Grow",
    description: "After successful completion of campaigns, you'll receive payments as per agreed terms.",
    gradient: "from-cyan-500 to-blue-500",
    delay: "0.4s",
  },
  {
    icon: Share2,
    title: "Earn More via Referrals",
    description: "Invite creators using your link and earn bonus for each active referral. No limit!",
    gradient: "from-blue-500 to-purple-600",
    delay: "0.5s",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="services" className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden" data-testid="how-it-works-section">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transform rotate-12 scale-150"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h6 className="text-blue-400 font-semibold mb-4 tracking-wider uppercase">Start As Influencer</h6>
          <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="how-it-works-title">
            India's 1st and Only <GradientText>UGC Creator Platform</GradientText>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Become an Influencer Partner with Stars Flock and start your journey to monetize your content
          </p>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-8 mb-8">
            {steps.slice(0, 3).map((step, index) => (
              <div key={step.title} className="relative">
                <Card3D
                  className="text-center p-8 bg-gray-800/50 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-blue-500/50"
                  style={{ animationDelay: step.delay }}
                  data-testid={`process-step-${index + 1}`}
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <step.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </Card3D>
                
                {index < 2 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-blue-400 opacity-50" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            {steps.slice(3).map((step, index) => (
              <div key={step.title} className="relative">
                <Card3D
                  className="text-center p-8 bg-gray-800/50 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-blue-500/50"
                  style={{ animationDelay: step.delay }}
                  data-testid={`process-step-${index + 4}`}
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <step.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </Card3D>
                
                {index < 2 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-blue-400 opacity-50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <Card3D
              key={step.title}
              className="text-center p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-blue-500/50"
              style={{ animationDelay: step.delay }}
              data-testid={`process-step-mobile-${index + 1}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <step.icon className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </Card3D>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-blue-400 font-medium">Ready to get started?</span>
          </div>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg" data-testid="join-stars-flock-cta">
            Join Stars Flock Today
          </button>
        </div>
      </div>
    </section>
  );
}
