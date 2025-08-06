import { useQuery } from "@tanstack/react-query";
import { Star, Quote } from "lucide-react";
import GradientText from "@/components/ui/gradient-text";
import Card3D from "@/components/ui/card-3d";

const testimonialImages = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
];

const mockTestimonials = [
  {
    id: "1",
    userId: "user1",
    content: "I received my first brand task just one day after subscribing. The video task was simple, and I instantly earned ₹500. Even the referral income is great!",
    rating: 5,
    isVisible: true,
    createdAt: new Date(),
    user: {
      name: "Anjali Verma",
      location: "Lucknow",
      image: testimonialImages[0],
      tier: "Rising Star",
    },
    title: "Create videos from home and earn money!",
    earnings: "₹15,000",
    timeframe: "2 months",
  },
  {
    id: "2",
    userId: "user2",
    content: "I've also done offline campaigns with Stars Flock. It's fun and great for networking. I'm now earning over ₹10,000 per month from brand collabs.",
    rating: 5,
    isVisible: true,
    createdAt: new Date(),
    user: {
      name: "Arjun Singh",
      location: "Mumbai",
      image: testimonialImages[1],
      tier: "Legendary Star",
    },
    title: "Onsite shoots gave me new exposure",
    earnings: "₹45,000",
    timeframe: "3 months",
  },
  {
    id: "3",
    userId: "user3",
    content: "After joining Stars Flock, I earned ₹1200 in my very first week. I get a new brand task every day. It's the best platform for those who want to earn by making videos.",
    rating: 5,
    isVisible: true,
    createdAt: new Date(),
    user: {
      name: "Priya Sharma",
      location: "Delhi",
      image: testimonialImages[2],
      tier: "Rising Star",
    },
    title: "First time I actually got paid from a platform!",
    earnings: "₹25,000",
    timeframe: "6 weeks",
  },
];

export default function TestimonialsSection() {
  const { data: testimonials = mockTestimonials } = useQuery({
    queryKey: ["/api/testimonials"],
  });

  return (
    <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden" data-testid="testimonials-section">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transform rotate-12 scale-150"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h6 className="text-blue-400 font-semibold mb-4 tracking-wider uppercase">Testimonials</h6>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="testimonials-title">
            What Our Creator are <GradientText>Saying?</GradientText>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real stories from real creators who are building their careers with Stars Flock
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <Card3D
              key={testimonial.id}
              className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 relative"
              style={{ animationDelay: `${index * 0.2}s` }}
              data-testid={`testimonial-${index + 1}`}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Quote className="h-4 w-4 text-white" />
              </div>

              {/* Creator Info */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img 
                    src={testimonial.user.image} 
                    alt={`${testimonial.user.name} profile`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-bold text-lg">{testimonial.user.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.user.location}</div>
                  <div className="flex items-center mt-1">
                    <div className="text-yellow-400 flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-blue-400 font-medium">{testimonial.user.tier}</span>
                  </div>
                </div>
              </div>

              {/* Testimonial Content */}
              <h4 className="font-bold text-lg mb-3 text-blue-400">{testimonial.title}</h4>
              <p className="text-gray-400 italic mb-6 leading-relaxed">"{testimonial.content}"</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="font-bold text-green-400">{testimonial.earnings}</div>
                  <div className="text-xs text-gray-500">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-400">{testimonial.timeframe}</div>
                  <div className="text-xs text-gray-500">Time Period</div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-full backdrop-blur-sm">
            <div className="flex -space-x-2 mr-4">
              {testimonialImages.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Creator ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                />
              ))}
            </div>
            <span className="text-gray-400">
              Join <span className="text-blue-400 font-semibold">50,000+</span> successful creators
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
