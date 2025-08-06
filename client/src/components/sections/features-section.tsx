import GradientText from "@/components/ui/gradient-text";
import Card3D from "@/components/ui/card-3d";

const features = [
  {
    title: "Brand Deals That Match Your Niche",
    description: "We connect you with brands that truly fit your content style and audience—so every collab feels natural and authentic.",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    alt: "Professional brand collaboration workspace with multiple screens showing campaign analytics",
  },
  {
    title: "Opportunities for All Sizes",
    description: "Whether you're a nano, micro, or macro influencer—you'll find campaigns that match your reach and potential.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    alt: "Diverse group of content creators collaborating and live streaming on various social media platforms",
  },
  {
    title: "Easy & Hassle-Free Process",
    description: "From campaign brief to content approval—we make your journey smooth, clear, and creator-friendly.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    alt: "Clean and intuitive workflow management interface showing campaign progress and approval process",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900" data-testid="features-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h6 className="text-blue-400 font-semibold mb-4">WHY CHOOSE US</h6>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="features-title">
            Why Should Choose <GradientText>Our Company</GradientText>
          </h2>
          <p className="text-gray-400 text-lg">Because at Stars Flock, we don't just create collaborations—we create impact.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card3D
              key={feature.title}
              className="bg-gray-800/50 p-8 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-blue-500/50"
              style={{ animationDelay: `${index * 0.2}s` }}
              data-testid={`feature-${index + 1}`}
            >
              <img 
                src={feature.image} 
                alt={feature.alt}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}
