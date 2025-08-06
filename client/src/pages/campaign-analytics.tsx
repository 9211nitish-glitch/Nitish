import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  UserCheck, 
  CheckCircle, 
  DollarSign,
  Activity,
  Target,
  Clock,
  BarChart3
} from "lucide-react";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface CampaignAnalytics {
  metrics: {
    totalViews: number;
    totalApplications: number;
    totalAccepted: number;
    totalCompleted: number;
    totalPaid: number;
    conversionRate: string;
    averageRating: string;
    totalBudgetSpent: string;
  };
  recentEvents: Array<{
    id: string;
    eventType: string;
    eventData: any;
    createdAt: string;
    user?: {
      username: string;
      profileImage?: string;
    };
  }>;
  hourlyActivity: Array<{
    hour: string;
    eventType: string;
    count: number;
  }>;
}

export default function CampaignAnalytics() {
  const params = useParams();
  const campaignId = params.id as string;

  // Track page view
  useEffect(() => {
    if (campaignId) {
      apiRequest("POST", `/api/campaigns/${campaignId}/track`, {
        eventType: "analytics_view",
        eventData: { source: "dashboard" }
      }).catch(console.error);
    }
  }, [campaignId]);

  const { data: analytics, isLoading } = useQuery<CampaignAnalytics>({
    queryKey: ["/api/campaigns", campaignId, "analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });

  const { data: campaign, isLoading: campaignLoading } = useQuery<any>({
    queryKey: ["/api/campaigns", campaignId],
  });

  if (isLoading || campaignLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || !campaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">Campaign not found</h2>
        </div>
      </div>
    );
  }

  const conversionRate = parseFloat(analytics.metrics?.conversionRate || "0");
  const averageRating = parseFloat(analytics.metrics?.averageRating || "0");

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="campaign-analytics-page">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="campaign-title">{campaign.title}</h1>
          <p className="text-muted-foreground mt-2">Real-time campaign analytics and performance</p>
        </div>
        <Badge 
          variant={campaign.status === "active" ? "default" : "secondary"}
          data-testid="campaign-status"
        >
          <Activity className="w-3 h-3 mr-1" />
          {campaign.status}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="metric-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">Campaign impressions</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-applications">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Creator applications</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-conversion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Application to acceptance</p>
            <Progress value={conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="metric-budget">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.metrics?.totalBudgetSpent || "0"}</div>
            <p className="text-xs text-muted-foreground">Total compensation paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Campaign Progress
                </CardTitle>
                <CardDescription>Track your campaign milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Applications Received</span>
                  <span className="font-semibold">{analytics.metrics?.totalApplications || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Creators Accepted</span>
                  <span className="font-semibold">{analytics.metrics?.totalAccepted || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Work Completed</span>
                  <span className="font-semibold">{analytics.metrics?.totalCompleted || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Payments Processed</span>
                  <span className="font-semibold">{analytics.metrics?.totalPaid || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quality Metrics
                </CardTitle>
                <CardDescription>Campaign quality indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-semibold">{averageRating.toFixed(1)}/5.0</span>
                  </div>
                  <Progress value={averageRating * 20} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-semibold">
                      {analytics.metrics?.totalAccepted > 0 
                        ? ((analytics.metrics.totalCompleted / analytics.metrics.totalAccepted) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={analytics.metrics?.totalAccepted > 0 
                      ? (analytics.metrics.totalCompleted / analytics.metrics.totalAccepted) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Live updates from your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-auto">
                {analytics.recentEvents?.length > 0 ? (
                  analytics.recentEvents.map((event, index) => (
                    <div 
                      key={event.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                      data-testid={`activity-${index}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {event.eventType === "view" && <Eye className="w-4 h-4" />}
                        {event.eventType === "apply" && <Users className="w-4 h-4" />}
                        {event.eventType === "accept" && <UserCheck className="w-4 h-4" />}
                        {event.eventType === "complete" && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {event.eventType === "view" && "Campaign viewed"}
                          {event.eventType === "apply" && "New application received"}
                          {event.eventType === "accept" && "Creator accepted"}
                          {event.eventType === "complete" && "Work completed"}
                          {event.user && ` by ${event.user.username}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Activity Overview</CardTitle>
              <CardDescription>Hourly breakdown of campaign activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Hourly activity chart will be displayed here</p>
                <p className="text-xs mt-2">Data points: {analytics.hourlyActivity?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your campaign</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" data-testid="btn-view-applications">
            <Users className="w-4 h-4 mr-2" />
            View Applications
          </Button>
          <Button variant="outline" data-testid="btn-creator-matching">
            <Target className="w-4 h-4 mr-2" />
            Creator Matching
          </Button>
          <Button variant="outline" data-testid="btn-export-data">
            <TrendingUp className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}