import { eq, and, gte, lte, sql, desc, inArray } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  creatorProfiles, 
  brandPreferences, 
  matchingResults, 
  campaigns,
  campaignApplications,
  type CreatorProfile,
  type BrandPreferences,
  type MatchingResult
} from "@shared/schema";

interface MatchingCriteria {
  categories?: string[];
  platforms?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  demographics?: any;
  location?: string;
  budgetRange?: { min: number; max: number };
}

interface MatchScore {
  creatorId: string;
  score: number;
  factors: {
    categoryMatch: number;
    platformMatch: number;
    followerMatch: number;
    demographicMatch: number;
    locationMatch: number;
    engagementMatch: number;
    portfolioMatch: number;
  };
}

export class CreatorMatchingService {
  // Advanced matching algorithm for creator-brand pairing
  async findMatchingCreators(campaignId: string, limit: number = 20): Promise<MatchingResult[]> {
    try {
      // Get campaign and brand preferences
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId));

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      // Get or create brand preferences
      let [brandPrefs] = await db
        .select()
        .from(brandPreferences)
        .where(eq(brandPreferences.campaignId, campaignId));

      if (!brandPrefs) {
        // Create default preferences based on campaign
        const defaultPrefs = this.generateDefaultPreferences(campaign);
        await db.insert(brandPreferences).values({
          campaignId,
          ...defaultPrefs
        });
        [brandPrefs] = await db
          .select()
          .from(brandPreferences)
          .where(eq(brandPreferences.campaignId, campaignId));
      }

      // Get all eligible creators with their profiles
      const eligibleCreators = await db
        .select({
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            platform: users.platform,
            followerCount: users.followerCount,
            tier: users.tier,
            totalEarnings: users.totalEarnings,
            completedCampaigns: users.completedCampaigns
          },
          profile: {
            categories: creatorProfiles.categories,
            platforms: creatorProfiles.platforms,
            demographics: creatorProfiles.demographics,
            engagementRate: creatorProfiles.engagementRate,
            averageViews: creatorProfiles.averageViews,
            collaborationPreferences: creatorProfiles.collaborationPreferences,
            portfolioItems: creatorProfiles.portfolioItems,
            isVerified: creatorProfiles.isVerified,
            matchingScore: creatorProfiles.matchingScore
          }
        })
        .from(users)
        .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
        .where(
          and(
            eq(users.isActive, true),
            eq(users.role, 'user'),
            gte(users.followerCount, brandPrefs.minFollowerCount || 0),
            lte(users.followerCount, brandPrefs.maxFollowerCount || 1000000)
          )
        );

      // Calculate match scores for each creator
      const matchScores: MatchScore[] = [];
      
      for (const creator of eligibleCreators) {
        const score = await this.calculateMatchScore(creator, brandPrefs, campaign);
        matchScores.push(score);
      }

      // Sort by score and get top matches
      matchScores.sort((a, b) => b.score - a.score);
      const topMatches = matchScores.slice(0, limit);

      // Save matching results
      const matchingResults: any[] = [];
      for (const match of topMatches) {
        const existingResult = await db
          .select()
          .from(matchingResults)
          .where(
            and(
              eq(matchingResults.campaignId, campaignId),
              eq(matchingResults.creatorId, match.creatorId)
            )
          )
          .limit(1);

        const resultData = {
          campaignId,
          creatorId: match.creatorId,
          matchScore: match.score.toFixed(2),
          matchFactors: match.factors,
          isRecommended: match.score >= 75 // Recommend if score >= 75%
        };

        if (existingResult.length > 0) {
          await db
            .update(matchingResults)
            .set(resultData)
            .where(eq(matchingResults.id, existingResult[0].id));
        } else {
          await db.insert(matchingResults).values(resultData);
        }
      }

      // Return full matching results with creator details
      return await db
        .select({
          id: matchingResults.id,
          campaignId: matchingResults.campaignId,
          creatorId: matchingResults.creatorId,
          matchScore: matchingResults.matchScore,
          matchFactors: matchingResults.matchFactors,
          isRecommended: matchingResults.isRecommended,
          status: matchingResults.status,
          createdAt: matchingResults.createdAt,
          creator: {
            id: users.id,
            username: users.username,
            platform: users.platform,
            followerCount: users.followerCount,
            tier: users.tier,
            profileImage: users.profileImage,
            completedCampaigns: users.completedCampaigns
          },
          profile: {
            engagementRate: creatorProfiles.engagementRate,
            averageViews: creatorProfiles.averageViews,
            isVerified: creatorProfiles.isVerified,
            categories: creatorProfiles.categories,
            platforms: creatorProfiles.platforms
          }
        })
        .from(matchingResults)
        .leftJoin(users, eq(matchingResults.creatorId, users.id))
        .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
        .where(eq(matchingResults.campaignId, campaignId))
        .orderBy(desc(matchingResults.matchScore));

    } catch (error) {
      console.error("Error finding matching creators:", error);
      throw error;
    }
  }

  // Calculate advanced match score based on multiple factors
  private async calculateMatchScore(
    creator: any,
    brandPrefs: BrandPreferences,
    campaign: any
  ): Promise<MatchScore> {
    const factors = {
      categoryMatch: 0,
      platformMatch: 0,
      followerMatch: 0,
      demographicMatch: 0,
      locationMatch: 0,
      engagementMatch: 0,
      portfolioMatch: 0
    };

    // Category matching (25% weight)
    if (creator.profile?.categories && brandPrefs.preferredCategories) {
      const creatorCategories = Array.isArray(creator.profile.categories) ? creator.profile.categories : [];
      const brandCategories = Array.isArray(brandPrefs.preferredCategories) ? brandPrefs.preferredCategories : [];
      const intersection = creatorCategories.filter((cat: string) => brandCategories.includes(cat));
      factors.categoryMatch = brandCategories.length > 0 ? (intersection.length / brandCategories.length) * 25 : 0;
    }

    // Platform matching (20% weight)
    if (creator.profile?.platforms && brandPrefs.requiredPlatforms) {
      const creatorPlatforms = Array.isArray(creator.profile.platforms) 
        ? creator.profile.platforms.map((p: any) => p.platform) 
        : [];
      const requiredPlatforms = Array.isArray(brandPrefs.requiredPlatforms) ? brandPrefs.requiredPlatforms : [];
      const intersection = creatorPlatforms.filter((platform: string) => requiredPlatforms.includes(platform));
      factors.platformMatch = requiredPlatforms.length > 0 ? (intersection.length / requiredPlatforms.length) * 20 : 0;
    }

    // Follower count matching (15% weight)
    const followerCount = creator.user.followerCount || 0;
    if (followerCount >= (brandPrefs.minFollowerCount || 0) && 
        followerCount <= (brandPrefs.maxFollowerCount || 1000000)) {
      // Give higher score for followers in optimal range
      const optimalRange = (brandPrefs.maxFollowerCount || 100000) * 0.7;
      if (followerCount >= optimalRange) {
        factors.followerMatch = 15;
      } else {
        factors.followerMatch = (followerCount / optimalRange) * 15;
      }
    }

    // Engagement rate matching (15% weight)
    const engagementRate = parseFloat(creator.profile?.engagementRate || '0');
    if (engagementRate > 0) {
      // Higher engagement rates get better scores
      factors.engagementMatch = Math.min((engagementRate / 10) * 15, 15);
    }

    // Portfolio/experience matching (10% weight)
    const completedCampaigns = creator.user.completedCampaigns || 0;
    if (completedCampaigns > 0) {
      factors.portfolioMatch = Math.min((completedCampaigns / 10) * 10, 10);
    }

    // Tier matching (10% weight)
    const tierScores = { 'rising': 5, 'legendary': 10 };
    factors.portfolioMatch += tierScores[creator.user.tier as keyof typeof tierScores] || 0;

    // Verification bonus (5% weight)
    if (creator.profile?.isVerified) {
      factors.portfolioMatch += 5;
    }

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);

    return {
      creatorId: creator.user.id,
      score: Math.min(totalScore, 100), // Cap at 100%
      factors
    };
  }

  // Generate default brand preferences based on campaign
  private generateDefaultPreferences(campaign: any) {
    return {
      preferredCategories: [campaign.category],
      requiredPlatforms: ['instagram', 'youtube'],
      minFollowerCount: 1000,
      maxFollowerCount: 100000,
      preferredDemographics: { ageRange: '18-35', gender: 'any' },
      budgetRange: { min: campaign.compensation * 0.8, max: campaign.compensation * 1.2 },
      locationPreferences: ['any']
    };
  }

  // Get creator recommendations for a campaign
  async getCreatorRecommendations(campaignId: string): Promise<any> {
    try {
      const recommendations = await this.findMatchingCreators(campaignId, 10);
      
      const topRecommended = recommendations.filter(r => r.isRecommended);
      const otherMatches = recommendations.filter(r => !r.isRecommended);

      return {
        topRecommended,
        otherMatches,
        totalFound: recommendations.length,
        averageScore: recommendations.reduce((sum, r) => sum + parseFloat(r.matchScore), 0) / recommendations.length
      };
    } catch (error) {
      console.error("Error getting creator recommendations:", error);
      throw error;
    }
  }

  // Update creator profile for better matching
  async updateCreatorProfile(userId: string, profileData: any): Promise<void> {
    try {
      const existingProfile = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, userId))
        .limit(1);

      if (existingProfile.length > 0) {
        await db
          .update(creatorProfiles)
          .set({
            ...profileData,
            updatedAt: new Date()
          })
          .where(eq(creatorProfiles.userId, userId));
      } else {
        await db.insert(creatorProfiles).values({
          userId,
          ...profileData
        });
      }

      // Recalculate matching score for all active campaigns
      await this.recalculateCreatorMatching(userId);
    } catch (error) {
      console.error("Error updating creator profile:", error);
      throw error;
    }
  }

  // Recalculate matching for a creator across all campaigns
  private async recalculateCreatorMatching(userId: string): Promise<void> {
    try {
      const activeCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.status, 'active'));

      for (const campaign of activeCampaigns) {
        await this.findMatchingCreators(campaign.id, 1);
      }
    } catch (error) {
      console.error("Error recalculating creator matching:", error);
    }
  }
}