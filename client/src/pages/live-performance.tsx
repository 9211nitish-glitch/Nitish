import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  DollarSign,
  Activity,
  Target,
  Clock,
  BarChart3,
  RefreshCw,
  Zap,
  Award,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveCampaign {
  campaign: {
    id: string;
    title: string;
    brandName: string;
    status: string;
    compensation: number;
    maxParticipants: number;
    currentParticipants: number;
  };
  metrics: {
    totalViews: number;
    totalApplications: number;
    totalAccepted: number;
    conversionRate: string;
    totalBudgetSpent: string;
  };
}

export default function LivePerformance() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  // Fetch live campaign performance data
  const { data: livePerformance, isLoading, refetch } = useQuery<LiveCampaign[]>({
    queryKey: ["/api/campaigns/live-performance"],
    refetchInterval: autoRefresh ? 15000 : false, // Refresh every 15 seconds
  });

  // Update last updated time when data changes
  useEffect(() => {
    if (livePerformance) {
      setLastUpdated(new Date());
    }
  }, [livePerformance]);

  // Manual refresh function
  const handleManualRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Live performance data has been updated",
    });
  };

  // Auto-refresh toggle
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast({
      title: autoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: autoRefresh 
        ? "Data will no longer update automatically" 
        : "Data will update every 15 seconds",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals across all campaigns
  const totalMetrics = livePerformance ? livePerformance.reduce(
    (acc: any, campaign: LiveCampaign) => ({
      totalViews: acc.totalViews + (campaign.metrics?.totalViews || 0),
      totalApplications: acc.totalApplications + (campaign.metrics?.totalApplications || 0),
      totalAccepted: acc.totalAccepted + (campaign.metrics?.totalAccepted || 0),
      totalBudget: acc.totalBudget + parseFloat(campaign.metrics?.totalBudgetSpent || "0"),
      activeCampaigns: acc.activeCampaigns + (campaign.campaign.status === "active" ? 1 : 0),
    }),
    { totalViews: 0, totalApplications: 0, totalAccepted: 0, totalBudget: 0, activeCampaigns: 0 }
  ) : null;

  const overallConversionRate = totalMetrics && totalMetrics.totalApplications > 0
    ? (totalMetrics.totalAccepted / totalMetrics.totalApplications) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="live-performance-page">
      {/* Header with Controls */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="page-title">
            <Activity className="w-8 h-8 text-primary" />
            Live Campaign Performance
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time analytics across all active campaigns
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Badge 
              variant={autoRefresh ? "default" : "secondary"}
              className="text-xs"
            >
              {autoRefresh ? "Live Updates" : "Manual Refresh"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            data-testid="btn-toggle-refresh"
          >
            <Zap className="w-4 h-4 mr-2" />
            {autoRefresh ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            data-testid="btn-manual-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="metric-active-campaigns">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics?.activeCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-total-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics?.totalViews.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-total-applications">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Creator applications</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-overall-conversion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Application to acceptance</p>
            <Progress value={overallConversionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance" data-testid="tab-performance">Campaign Performance</TabsTrigger>
          <TabsTrigger value="trending" data-testid="tab-trending">Trending</TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Real-time Campaign Performance
              </CardTitle>
              <CardDescription>Live metrics for all active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {livePerformance && Array.isArray(livePerformance) && livePerformance.length > 0 ? (
                  livePerformance.map((item: LiveCampaign, index: number) => (
                    <Card key={item.campaign.id} className="border-l-4 border-l-primary" data-testid={`campaign-${index}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg" data-testid={`campaign-title-${index}`}>
                              {item.campaign.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {item.campaign.brandName}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={item.campaign.status === "active" ? "default" : "secondary"}
                              data-testid={`campaign-status-${index}`}
                            >
                              {item.campaign.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              ₹{item.campaign.compensation.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {item.metrics?.totalViews || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {item.metrics?.totalApplications || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Applications</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {item.metrics?.totalAccepted || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Accepted</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {parseFloat(item.metrics?.conversionRate || "0").toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">Conversion</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Participation Progress</span>
                            <span>{item.campaign.currentParticipants}/{item.campaign.maxParticipants}</span>
                          </div>
                          <Progress 
                            value={(item.campaign.currentParticipants / item.campaign.maxParticipants) * 100} 
                            className="h-2" 
                          />
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`btn-view-analytics-${index}`}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            View Analytics
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`btn-creator-matching-${index}`}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Creator Matching
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Active Campaigns</h3>
                    <p className="text-muted-foreground">
                      Create new campaigns to see live performance data here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Campaigns
              </CardTitle>
              <CardDescription>Campaigns with highest activity in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Trending Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced trending analysis will be available here based on activity patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Performance Insights
                </CardTitle>
                <CardDescription>AI-powered campaign recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">
                    High Performance Alert
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your campaigns are performing {overallConversionRate.toFixed(0)}% above industry average!
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    Optimization Opportunity
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Consider increasing budgets for top-performing campaigns to maximize reach.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Views per Campaign</span>
                  <span className="font-semibold">
                    {totalMetrics && totalMetrics.activeCampaigns > 0 
                      ? Math.round(totalMetrics.totalViews / totalMetrics.activeCampaigns).toLocaleString()
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Budget Allocated</span>
                  <span className="font-semibold">₹{totalMetrics?.totalBudget.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Creator Pool</span>
                  <span className="font-semibold">{totalMetrics?.totalApplications || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {overallConversionRate.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}