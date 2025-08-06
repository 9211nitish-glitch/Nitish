import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Calendar, DollarSign, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/ui/navigation";
import GradientText from "@/components/ui/gradient-text";
import Card3D from "@/components/ui/card-3d";

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const categories = ["all", "fashion", "tech", "food", "lifestyle", "beauty", "fitness"];
  const types = ["all", "online", "onsite", "both"];

  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
    const matchesType = typeFilter === "all" || campaign.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="campaigns-title">
              Discover <GradientText>Brand Campaigns</GradientText>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find the perfect collaboration opportunities that match your content style and audience
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8" data-testid="campaigns-filters">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 focus:border-blue-500"
                    data-testid="campaigns-search-input"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500" data-testid="category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500" data-testid="type-filter">
                    <SelectValue placeholder="Campaign Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  className="border-gray-600 hover:bg-gray-700"
                  data-testid="advanced-filters-button"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign: any, index: number) => (
                <Card3D
                  key={campaign.id}
                  className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`campaign-card-${index + 1}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{campaign.title}</CardTitle>
                        <p className="text-gray-400 text-sm font-medium">{campaign.brandName}</p>
                      </div>
                      {campaign.brandLogo && (
                        <img 
                          src={campaign.brandLogo} 
                          alt={`${campaign.brandName} logo`}
                          className="w-12 h-12 rounded-lg bg-gray-700"
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                        {campaign.category}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {campaign.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {campaign.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>Compensation</span>
                        </div>
                        <span className="text-green-400 font-semibold">₹{campaign.compensation.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Participants</span>
                        </div>
                        <span className="text-blue-400">{campaign.currentParticipants}/{campaign.maxParticipants}</span>
                      </div>

                      {campaign.deadline && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Deadline</span>
                          </div>
                          <span className="text-orange-400">{formatDate(campaign.deadline)}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        data-testid={`apply-campaign-${index + 1}`}
                      >
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 hover:bg-gray-700"
                        data-testid={`view-details-${index + 1}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card3D>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredCampaigns.length === 0 && (
            <div className="text-center py-16" data-testid="no-campaigns-message">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search terms to find more opportunities
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setTypeFilter("all");
                }}
                className="bg-blue-500 hover:bg-blue-600"
                data-testid="clear-filters-button"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Load More */}
          {!isLoading && filteredCampaigns.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline"
                className="border-gray-600 hover:bg-gray-700"
                data-testid="load-more-campaigns-button"
              >
                Load More Campaigns
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
