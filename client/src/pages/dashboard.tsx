import { useQuery } from "@tanstack/react-query";
import { Plus, Settings, ArrowUp, Clock, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/ui/navigation";
import GradientText from "@/components/ui/gradient-text";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Mock user data for demonstration
  const mockUser = {
    name: "Sarah",
    totalEarnings: 25400,
    activeCampaigns: 8,
    completedCampaigns: 24,
    referralEarnings: 3200,
  };

  const mockRecentCampaigns = [
    {
      id: "1",
      title: "Fashion Brand X - Instagram Reel",
      compensation: 2500,
      status: "In Progress",
      deadline: "Dec 25, 2024",
      icon: "camera",
    },
    {
      id: "2", 
      title: "FoodTech Startup - YouTube Review",
      compensation: 4000,
      status: "Completed",
      deadline: "Dec 20, 2024",
      icon: "utensils",
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
              <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-welcome">
                Welcome back, <GradientText>{mockUser.name}!</GradientText> 👋
              </h1>
              <p className="text-gray-400">Here's what's happening with your campaigns</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                data-testid="new-campaign-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
              <Button 
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
                data-testid="settings-button"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20" data-testid="total-earnings-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">₹{mockUser.totalEarnings.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Earnings</div>
                <div className="text-green-400 text-sm mt-1 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +12% this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20" data-testid="active-campaigns-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{mockUser.activeCampaigns}</div>
                <div className="text-gray-400 text-sm">Active Campaigns</div>
                <div className="text-blue-400 text-sm mt-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  3 pending approval
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border-pink-500/20" data-testid="completed-campaigns-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{mockUser.completedCampaigns}</div>
                <div className="text-gray-400 text-sm">Completed Campaigns</div>
                <div className="text-green-400 text-sm mt-1 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  100% success rate
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border-orange-500/20" data-testid="referral-earnings-card">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">₹{mockUser.referralEarnings.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Referral Earnings</div>
                <div className="text-purple-400 text-sm mt-1 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  6 active referrals
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card className="bg-gray-800/50 border-gray-700" data-testid="recent-campaigns-card">
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentCampaigns.map((campaign, index) => (
                  <div 
                    key={campaign.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors"
                    data-testid={`campaign-${index + 1}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {campaign.icon === "camera" ? "📷" : "🍽️"}
                      </div>
                      <div>
                        <div className="font-semibold">{campaign.title}</div>
                        <div className="text-gray-400 text-sm">Due: {campaign.deadline}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-green-400 font-semibold">₹{campaign.compensation.toLocaleString()}</div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        campaign.status === "Completed" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
