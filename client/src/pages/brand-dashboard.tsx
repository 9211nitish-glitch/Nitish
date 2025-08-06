import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, TrendingUp, Users, Target, BarChart3, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import GradientText from "@/components/ui/gradient-text";
import AnimatedCounter from "@/components/ui/animated-counter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BrandDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/campaigns", campaignData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Campaign created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  // Mock brand data
  const mockBrand = {
    name: "TechBrand Inc",
    activeCampaigns: 12,
    totalSpend: 450000,
    totalReach: 2500000,
    avgEngagement: 8.5,
    completedCampaigns: 48,
    activeCreators: 156,
  };

  const mockCampaignPerformance = [
    {
      id: "1",
      name: "Summer Tech Collection",
      status: "Active",
      creators: 15,
      reach: 750000,
      engagement: 12.3,
      spend: 85000,
      applications: 45,
    },
    {
      id: "2", 
      name: "Back to School Campaign",
      status: "Completed",
      creators: 8,
      reach: 420000,
      engagement: 9.8,
      spend: 32000,
      applications: 28,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="brand-dashboard-welcome">
                Welcome back, <GradientText>{mockBrand.name}!</GradientText> 📈
              </h1>
              <p className="text-gray-400">
                Manage your campaigns and track performance
              </p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                data-testid="create-campaign-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
              <Button 
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
                data-testid="brand-settings-button"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Brand Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20" data-testid="brand-total-spend-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={mockBrand.totalSpend} prefix="₹" />
                    </div>
                    <div className="text-gray-400 text-sm">Total Campaign Spend</div>
                    <div className="text-green-400 text-sm mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +8% this quarter
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20" data-testid="brand-total-reach-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={Math.floor(mockBrand.totalReach / 1000)} suffix="K" />
                    </div>
                    <div className="text-gray-400 text-sm">Total Reach</div>
                    <div className="text-blue-400 text-sm mt-1 flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Across all campaigns
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border-pink-500/20" data-testid="brand-avg-engagement-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={mockBrand.avgEngagement} suffix="%" />
                    </div>
                    <div className="text-gray-400 text-sm">Avg Engagement</div>
                    <div className="text-green-400 text-sm mt-1 flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      Above industry avg
                    </div>
                  </div>
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border-orange-500/20" data-testid="brand-active-creators-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={mockBrand.activeCreators} />
                    </div>
                    <div className="text-gray-400 text-sm">Active Creators</div>
                    <div className="text-purple-400 text-sm mt-1 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {mockBrand.activeCampaigns} campaigns
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700" data-testid="campaign-performance-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Campaign Performance
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      {mockBrand.activeCampaigns} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCampaignPerformance.map((campaign, index) => (
                      <div 
                        key={campaign.id}
                        className="p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors"
                        data-testid={`campaign-performance-${index + 1}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-lg">{campaign.name}</h4>
                              <Badge 
                                variant={campaign.status === "Active" ? "default" : "secondary"}
                                className={campaign.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                              >
                                {campaign.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Creators:</span>
                                <div className="font-semibold text-blue-400">{campaign.creators}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Reach:</span>
                                <div className="font-semibold text-purple-400">{(campaign.reach / 1000).toFixed(0)}K</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Engagement:</span>
                                <div className="font-semibold text-green-400">{campaign.engagement}%</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Spend:</span>
                                <div className="font-semibold text-orange-400">₹{(campaign.spend / 1000).toFixed(0)}K</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{campaign.applications} applications received</span>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Insights */}
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700" data-testid="quick-actions-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Campaign
                    </Button>
                    <Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20">
                      <Users className="mr-2 h-4 w-4" />
                      Browse Creators
                    </Button>
                    <Button className="w-full justify-start bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700" data-testid="brand-insights-card">
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-sm font-medium text-green-400">Performance Up</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your campaigns are performing 23% better than last month
                      </p>
                    </div>

                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center mb-2">
                        <Target className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-blue-400">Best Category</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Tech & Gadgets campaigns show highest engagement rates
                      </p>
                    </div>

                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm font-medium text-purple-400">Creator Pool</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        156 creators are actively engaging with your brand
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
