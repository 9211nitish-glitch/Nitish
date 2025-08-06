import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Target, Award } from "lucide-react";
import AnimatedCounter from "@/components/ui/animated-counter";

export default function StatsSection() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const statItems = [
    {
      icon: Target,
      value: stats?.successRate || 95,
      suffix: "%",
      label: "Success Campaign",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      icon: Users,
      value: stats?.happyInfluencers || 89,
      suffix: "%", 
      label: "Happy Influencer",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: Award,
      value: stats?.brandsCount || 2000,
      suffix: "+",
      label: "Promote Brand",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
    {
      icon: TrendingUp,
      value: 150,
      suffix: "K+",
      label: "Active Creators",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
  ];

  return (
    <section className="py-20 bg-gray-800/50 border-y border-gray-700" data-testid="stats-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="stats-title">
            Trusted by Thousands of <span className="gradient-text">Creators & Brands</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Join the fastest-growing creator economy platform in India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className={`animate-slide-up p-8 rounded-2xl border ${stat.bgColor} ${stat.borderColor} hover:scale-105 transition-all duration-300`}
              style={{ animationDelay: `${index * 0.2}s` }}
              data-testid={`stat-${index + 1}`}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} ${stat.borderColor} border mb-6`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                
                <div className={`text-4xl lg:text-5xl font-bold ${stat.color} mb-2`}>
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix}
                  />
                </div>
                
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="text-2xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-400">Creator Support</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="text-2xl font-bold text-blue-400 mb-2">Same Day</div>
            <div className="text-gray-400">Payment Processing</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
            <div className="text-2xl font-bold text-purple-400 mb-2">Zero</div>
            <div className="text-gray-400">Hidden Charges</div>
          </div>
        </div>
      </div>
    </section>
  );
}
