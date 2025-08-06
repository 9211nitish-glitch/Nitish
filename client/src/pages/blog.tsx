import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/ui/navigation";
import GradientText from "@/components/ui/gradient-text";
import Card3D from "@/components/ui/card-3d";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ["/api/blog"],
  });

  const categories = ["all", "Content Creation", "Video Strategy", "Getting Started", "Monetization", "Social Media"];

  const filteredPosts = blogPosts.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="blog-page-title">
              Creator <GradientText>Insights & Tips</GradientText>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Learn from industry experts, discover new strategies, and stay updated with the latest trends in content creation
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8" data-testid="blog-filters">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 focus:border-blue-500"
                    data-testid="blog-search-input"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500" data-testid="blog-category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Post */}
          {featuredPost && (
            <Card3D className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 mb-12" data-testid="featured-blog-post">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <img 
                      src={featuredPost.featuredImage} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover rounded-l-xl"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-500 text-white">Featured</Badge>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(featuredPost.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {featuredPost.category}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 hover:text-blue-400 transition-colors">
                      <a href={`#blog/${featuredPost.slug}`}>{featuredPost.title}</a>
                    </h2>
                    
                    <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <a 
                      href={`#blog/${featuredPost.slug}`}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold"
                      data-testid="featured-post-read-more"
                    >
                      Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card3D>
          )}

          {/* Regular Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 animate-pulse">
                  <div className="h-48 bg-gray-700 rounded-t-xl"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post: any, index: number) => (
                <Card3D
                  key={post.id}
                  className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 overflow-hidden transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`blog-post-${index + 1}`}
                >
                  <div className="relative">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-gray-900/80 text-white">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 hover:text-blue-400 transition-colors line-clamp-2">
                      <a href={`#blog/${post.slug}`}>{post.title}</a>
                    </h3>
                    
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <a 
                      href={`#blog/${post.slug}`}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold"
                      data-testid={`blog-post-read-more-${index + 1}`}
                    >
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </CardContent>
                </Card3D>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-16" data-testid="no-blog-posts-message">
              <Tag className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}

          {/* Newsletter CTA */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 mt-16" data-testid="blog-newsletter-cta">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Stay Updated with <GradientText>Creator Insights</GradientText>
              </h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Get the latest articles, tips, and strategies delivered to your inbox. 
                Join thousands of creators who are growing their influence and income.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-700 border-gray-600 focus:border-blue-500"
                  data-testid="blog-newsletter-email-input"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
