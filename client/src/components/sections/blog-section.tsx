import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/ui/gradient-text";
import Card3D from "@/components/ui/card-3d";

const mockBlogPosts = [
  {
    id: "1",
    title: "Mastering Captions & Hashtags – How to Boost Your Reach as a Creator",
    slug: "mastering-captions-hashtags-boost-reach",
    excerpt: "Learn the secrets of writing compelling captions and using hashtags strategically to maximize your content's reach and engagement.",
    content: "",
    featuredImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    category: "Content Creation",
    isPublished: true,
    publishedAt: new Date("2024-12-23"),
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "2",
    title: "5 Instagram Reels & YouTube Shorts Tips to Boost Views & Monetize",
    slug: "instagram-reels-youtube-shorts-tips",
    excerpt: "Discover proven strategies to create viral short-form content that not only gets views but also drives monetization opportunities.",
    content: "",
    featuredImage: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    category: "Video Strategy",
    isPublished: true,
    publishedAt: new Date("2024-12-22"),
    createdAt: new Date("2024-12-19"),
  },
  {
    id: "3",
    title: "Content Creation – Your First Step to Earning as a Creator",
    slug: "content-creation-first-step-earning",
    excerpt: "A beginner's guide to starting your creator journey with Stars Flock and turning your passion into a profitable career.",
    content: "",
    featuredImage: "https://images.unsplash.com/photo-1552664688-cf412ec27db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    category: "Getting Started",
    isPublished: true,
    publishedAt: new Date("2024-12-21"),
    createdAt: new Date("2024-12-18"),
  },
];

export default function BlogSection() {
  const { data: blogPosts = mockBlogPosts } = useQuery({
    queryKey: ["/api/blog"],
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      day: '2-digit',
      month: 'short'
    }).format(new Date(date));
  };

  return (
    <section id="blog" className="py-20 bg-gray-900" data-testid="blog-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h6 className="text-blue-400 font-semibold mb-4">LATEST ARTICLES</h6>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="blog-title">
            Latest News & Articles from <GradientText>the Blog Posts</GradientText>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.slice(0, 3).map((post, index) => (
            <Card3D
              key={post.id}
              className="bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-blue-500/50"
              style={{ animationDelay: `${index * 0.2}s` }}
              data-testid={`blog-post-${index + 1}`}
            >
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <span>{formatDate(post.publishedAt!)}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 hover:text-blue-400 transition-colors">
                  <a href={`#blog/${post.slug}`}>{post.title}</a>
                </h3>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <a 
                  href={`#blog/${post.slug}`} 
                  className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center"
                  data-testid={`read-more-${index + 1}`}
                >
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </Card3D>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105"
            data-testid="view-all-articles-button"
          >
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
}
