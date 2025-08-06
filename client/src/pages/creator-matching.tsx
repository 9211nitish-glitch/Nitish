import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Star, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Zap,
  Target,
  Award,
  Filter,
  Search,
  UserCheck,
  Crown,
  Verified
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MatchingResult {
  id: string;
  campaignId: string;
  creatorId: string;
  matchScore: string;
  matchFactors: {
    categoryMatch: number;
    platformMatch: number;
    followerMatch: number;
    demographicMatch: number;
    locationMatch: number;
    engagementMatch: number;
    portfolioMatch: number;
  };
  isRecommended: boolean;
  status: string;
  creator: {
    id: string;
    username: string;
    platform: string | null;
    followerCount: number | null;
    tier: string | null;
    profileImage: string | null;
    completedCampaigns: number | null;
  };
  profile: {
    engagementRate: string | null;
    averageViews: number | null;
    isVerified: boolean | null;
    categories: string[] | null;
    platforms: any[] | null;
  };
}

interface CreatorRecommendations {
  topRecommended: MatchingResult[];
  otherMatches: MatchingResult[];
  totalFound: number;
  averageScore: number;
}

export default function CreatorMatching() {
  const params = useParams();
  const campaignId = params.id as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading: campaignLoading } = useQuery<any>({
    queryKey: ["/api/campaigns", campaignId],
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<CreatorRecommendations>({
    queryKey: ["/api/campaigns", campaignId, "recommendations"],
  });

  const { data: matches, isLoading: matchesLoading } = useQuery<MatchingResult[]>({
    queryKey: ["/api/campaigns", campaignId, "matches"],
  });

  const contactCreatorMutation = useMutation({
    mutationFn: async ({ creatorId }: { creatorId: string }) => {
      return apiRequest("POST", `/api/campaigns/${campaignId}/contact-creator`, {
        creatorId
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Creator contacted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "matches"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to contact creator. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (campaignLoading || recommendationsLoading || matchesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">Campaign not found</h2>
        </div>
      </div>
    );
  }

  const filteredMatches = matches?.filter(match => {
    const matchesSearch = match.creator.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = parseFloat(match.matchScore) >= minScore;
    return matchesSearch && matchesScore;
  }) || [];

  const handleContactCreator = (creatorId: string) => {
    contactCreatorMutation.mutate({ creatorId });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case "legendary":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "rising":
        return <Star className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="creator-matching-page">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="campaign-title">{campaign.title}</h1>
          <p className="text-muted-foreground mt-2">AI-powered creator matching and recommendations</p>
        </div>
        <Badge variant="secondary" data-testid="total-matches">
          <Target className="w-3 h-3 mr-1" />
          {recommendations?.totalFound || 0} matches found
        </Badge>
      </div>

      {/* Key Metrics */}
      {recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="metric-recommended">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Top Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations.topRecommended.length}</div>
              <p className="text-xs text-muted-foreground">Highly recommended creators</p>
            </CardContent>
          </Card>

          <Card data-testid="metric-average-score">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Match compatibility</p>
            </CardContent>
          </Card>

          <Card data-testid="metric-verified">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Verified className="h-4 w-4 text-blue-500" />
                Verified Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {matches?.filter(m => m.profile.isVerified).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Verified profiles</p>
            </CardContent>
          </Card>

          <Card data-testid="metric-legendary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Legendary Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {matches?.filter(m => m.creator.tier === "legendary").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Top-tier creators</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>Refine your creator search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Creators</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minScore">Minimum Match Score: {minScore}%</Label>
              <Input
                id="minScore"
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                data-testid="input-min-score"
              />
            </div>
            <div className="space-y-2">
              <Label>Quick Filters</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={minScore >= 80 ? "default" : "outline"}
                  onClick={() => setMinScore(80)}
                  data-testid="btn-filter-top"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Top Matches
                </Button>
                <Button
                  size="sm"
                  variant={minScore >= 60 ? "default" : "outline"}
                  onClick={() => setMinScore(60)}
                  data-testid="btn-filter-good"
                >
                  Good Matches
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creator Results */}
      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommended" data-testid="tab-recommended">
            Top Recommended ({recommendations?.topRecommended.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All Matches ({filteredMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations?.topRecommended.map((match, index) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow" data-testid={`recommended-creator-${index}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={match.creator.profileImage || ""} />
                        <AvatarFallback>{match.creator.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{match.creator.username}</h3>
                          {match.profile.isVerified && <Verified className="w-4 h-4 text-blue-500" />}
                          {getTierIcon(match.creator.tier)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.creator.followerCount?.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getMatchScoreColor(parseFloat(match.matchScore))}>
                      {parseFloat(match.matchScore).toFixed(0)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Match Score</span>
                      <span className="font-medium">{parseFloat(match.matchScore).toFixed(1)}%</span>
                    </div>
                    <Progress value={parseFloat(match.matchScore)} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Engagement</span>
                      <div className="font-medium">
                        {match.profile.engagementRate ? `${parseFloat(match.profile.engagementRate).toFixed(1)}%` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Campaigns</span>
                      <div className="font-medium">{match.creator.completedCampaigns || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Views</span>
                      <div className="font-medium">
                        {match.profile.averageViews ? match.profile.averageViews.toLocaleString() : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tier</span>
                      <div className="font-medium capitalize">{match.creator.tier || "Standard"}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleContactCreator(match.creatorId)}
                      disabled={contactCreatorMutation.isPending}
                      data-testid={`btn-contact-${index}`}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`btn-view-profile-${index}`}>
                      <Eye className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {recommendations?.topRecommended.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No top recommendations yet</h3>
              <p className="text-muted-foreground">
                Try adjusting your campaign requirements or check back later for new matches.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMatches.map((match, index) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow" data-testid={`all-creator-${index}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={match.creator.profileImage || ""} />
                        <AvatarFallback>{match.creator.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{match.creator.username}</h3>
                          {match.profile.isVerified && <Verified className="w-4 h-4 text-blue-500" />}
                          {getTierIcon(match.creator.tier)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.creator.followerCount?.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={match.isRecommended ? "default" : "secondary"}
                      className={getMatchScoreColor(parseFloat(match.matchScore))}
                    >
                      {parseFloat(match.matchScore).toFixed(0)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Match Score</span>
                      <span className="font-medium">{parseFloat(match.matchScore).toFixed(1)}%</span>
                    </div>
                    <Progress value={parseFloat(match.matchScore)} className="h-2" />
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{match.matchFactors.categoryMatch.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span>{match.matchFactors.platformMatch.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement:</span>
                      <span>{match.matchFactors.engagementMatch.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleContactCreator(match.creatorId)}
                      disabled={contactCreatorMutation.isPending}
                      data-testid={`btn-contact-all-${index}`}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`btn-view-profile-all-${index}`}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No creators found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters or criteria.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}