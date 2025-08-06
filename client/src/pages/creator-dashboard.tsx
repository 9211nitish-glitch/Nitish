import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, ArrowUp, Clock, Check, Users, Camera, Video, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import GradientText from "@/components/ui/gradient-text";
import AnimatedCounter from "@/components/ui/animated-counter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreatorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const applyCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/apply`, {
        userId: "user1" // In real app, get from auth context
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply for campaign",
        variant: "destructive",
      });
    },
  });

  // Mock user data - in real app, get from auth context
  const mockUser = {
    name: "Sarah",
    tier: "Rising Star",
    totalEarnings: 25400,
    activeCampaigns: 8,
    completedCampaigns: 24,
    referralEarnings: 3200,
    successRate: 100,
    referralCount: 6,
  };

  const handleApplyCampaign = (campaignId: string) => {
    applyCampaign.mutate(campaignId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="creator-dashboard-welcome">
                Welcome back, <GradientText>{mockUser.name}!</GradientText> 👋
              </h1>
              <p className="text-gray-400">
                {mockUser.tier} • Here's your creator dashboard overview
              </p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                data-testid="create-content-button"
              >
                <Camera className="mr-2 h-4 w-4" />
                Create Content
              </Button>
              <Button 
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
                data-testid="creator-settings-button"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20" data-testid="creator-total-earnings-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={mockUser.totalEarnings} prefix="₹" />
                    </div>
                    <div className="text-gray-400 text-sm">Total Earnings</div>
                    <div className="text-green-400 text-sm mt-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +12% this month
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20" data-testid="creator-active-campaigns-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{mockUser.activeCampaigns}</div>
                    <div className="text-gray-400 text-sm">Active Campaigns</div>
                    <div className="text-blue-400 text-sm mt-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      3 pending approval
                    </div>
                  </div>
                  <Video className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border-pink-500/20" data-testid="creator-completed-campaigns-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{mockUser.completedCampaigns}</div>
                    <div className="text-gray-400 text-sm">Completed</div>
                    <div className="text-green-400 text-sm mt-1 flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      {mockUser.successRate}% success rate
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border-orange-500/20" data-testid="creator-referral-earnings-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={mockUser.referralEarnings} prefix="₹" />
                    </div>
                    <div className="text-gray-400 text-sm">Referral Earnings</div>
                    <div className="text-purple-400 text-sm mt-1 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {mockUser.referralCount} active referrals
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Campaigns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 border-gray-700" data-testid="available-campaigns-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Available Campaigns
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    {campaigns.length} New
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign: any, index: number) => (
                    <div 
                      key={campaign.id}
                      className="p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors"
                      data-testid={`available-campaign-${index + 1}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{campaign.title}</h4>
                          <p className="text-gray-400 text-sm mb-2">{campaign.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-400 font-semibold">₹{campaign.compensation}</span>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {campaign.category}
                            </Badge>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {campaign.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApplyCampaign(campaign.id)}
                            disabled={applyCampaign.isPending}
                            className="bg-blue-500 hover:bg-blue-600"
                            data-testid={`apply-campaign-${index + 1}`}
                          >
                            {applyCampaign.isPending ? "Applying..." : "Apply"}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{campaign.currentParticipants}/{campaign.maxParticipants} participants</span>
                        {campaign.deadline && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Due: {new Date(campaign.deadline).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {campaigns.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns available at the moment.</p>
                      <p className="text-sm">Check back later for new opportunities!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="bg-gray-800/50 border-gray-700" data-testid="performance-overview-card">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Campaign Success Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full" 
                          style={{ width: `${mockUser.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-semibold">{mockUser.successRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Monthly Growth</span>
                    <div className="flex items-center space-x-2">
                      <ArrowUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">+12%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Streak</span>
                    <span className="text-blue-400 font-semibold">15 days</span>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-semibold mb-4">Recent Achievements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Campaign Master</p>
                          <p className="text-xs text-gray-400">Completed 25 campaigns</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Referral Champion</p>
                          <p className="text-xs text-gray-400">Referred 6 active creators</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
