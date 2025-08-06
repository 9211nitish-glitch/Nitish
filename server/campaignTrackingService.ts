import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  campaigns, 
  campaignMetrics, 
  campaignEvents, 
  campaignApplications,
  users,
  type CampaignEvent,
  type CampaignMetrics
} from "@shared/schema";

export class CampaignTrackingService {
  // Track campaign events in real-time
  async trackEvent(campaignId: string, eventType: string, userId?: string, eventData?: any): Promise<void> {
    try {
      await db.insert(campaignEvents).values({
        campaignId,
        userId,
        eventType,
        eventData
      });

      // Update campaign metrics immediately
      await this.updateCampaignMetrics(campaignId);
    } catch (error) {
      console.error("Error tracking campaign event:", error);
      throw error;
    }
  }

  // Update real-time campaign metrics
  async updateCampaignMetrics(campaignId: string): Promise<void> {
    try {
      // Get event counts
      const eventCounts = await db
        .select({
          eventType: campaignEvents.eventType,
          count: sql<number>`count(*)`.as('count')
        })
        .from(campaignEvents)
        .where(eq(campaignEvents.campaignId, campaignId))
        .groupBy(campaignEvents.eventType);

      // Get application stats
      const appStats = await db
        .select({
          totalApplications: sql<number>`count(*)`.as('total_applications'),
          totalAccepted: sql<number>`sum(case when status = 'approved' then 1 else 0 end)`.as('total_accepted'),
          totalCompleted: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`.as('total_completed'),
          totalPaid: sql<number>`sum(case when payment_status = 'paid' then 1 else 0 end)`.as('total_paid')
        })
        .from(campaignApplications)
        .where(eq(campaignApplications.campaignId, campaignId));

      const stats = appStats[0];
      const viewCount = eventCounts.find(e => e.eventType === 'view')?.count || 0;
      
      // Calculate conversion rate
      const conversionRate = stats.totalApplications > 0 
        ? (stats.totalAccepted / stats.totalApplications * 100)
        : 0;

      // Update or create metrics record
      const existingMetrics = await db
        .select()
        .from(campaignMetrics)
        .where(eq(campaignMetrics.campaignId, campaignId))
        .limit(1);

      const metricsData = {
        totalViews: viewCount,
        totalApplications: stats.totalApplications,
        totalAccepted: stats.totalAccepted,
        totalCompleted: stats.totalCompleted,
        totalPaid: stats.totalPaid,
        conversionRate: conversionRate.toFixed(2)
      };

      if (existingMetrics.length > 0) {
        await db
          .update(campaignMetrics)
          .set(metricsData)
          .where(eq(campaignMetrics.campaignId, campaignId));
      } else {
        await db.insert(campaignMetrics).values({
          campaignId,
          ...metricsData
        });
      }
    } catch (error) {
      console.error("Error updating campaign metrics:", error);
      throw error;
    }
  }

  // Get real-time campaign analytics
  async getCampaignAnalytics(campaignId: string): Promise<{
    metrics: CampaignMetrics | null;
    recentEvents: CampaignEvent[];
    hourlyActivity: any[];
  }> {
    try {
      // Get current metrics
      const [metrics] = await db
        .select()
        .from(campaignMetrics)
        .where(eq(campaignMetrics.campaignId, campaignId));

      // Get recent events (last 24 hours)
      const recentEvents = await db
        .select({
          id: campaignEvents.id,
          eventType: campaignEvents.eventType,
          eventData: campaignEvents.eventData,
          createdAt: campaignEvents.createdAt,
          user: {
            id: users.id,
            username: users.username,
            profileImage: users.profileImage
          }
        })
        .from(campaignEvents)
        .leftJoin(users, eq(campaignEvents.userId, users.id))
        .where(
          and(
            eq(campaignEvents.campaignId, campaignId),
            sql`${campaignEvents.createdAt} >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
          )
        )
        .orderBy(desc(campaignEvents.createdAt))
        .limit(50);

      // Get hourly activity for the last 24 hours
      const hourlyActivity = await db
        .select({
          hour: sql<string>`DATE_FORMAT(${campaignEvents.createdAt}, '%H:00')`.as('hour'),
          eventType: campaignEvents.eventType,
          count: sql<number>`count(*)`.as('count')
        })
        .from(campaignEvents)
        .where(
          and(
            eq(campaignEvents.campaignId, campaignId),
            sql`${campaignEvents.createdAt} >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
          )
        )
        .groupBy(sql`DATE_FORMAT(${campaignEvents.createdAt}, '%H:00')`, campaignEvents.eventType)
        .orderBy(sql`hour`);

      return {
        metrics: metrics || null,
        recentEvents: recentEvents as CampaignEvent[],
        hourlyActivity
      };
    } catch (error) {
      console.error("Error getting campaign analytics:", error);
      throw error;
    }
  }

  // Get live campaign performance
  async getLiveCampaignPerformance(): Promise<any[]> {
    try {
      const activeCampaigns = await db
        .select({
          campaign: {
            id: campaigns.id,
            title: campaigns.title,
            brandName: campaigns.brandName,
            status: campaigns.status,
            compensation: campaigns.compensation,
            maxParticipants: campaigns.maxParticipants,
            currentParticipants: campaigns.currentParticipants
          },
          metrics: {
            totalViews: campaignMetrics.totalViews,
            totalApplications: campaignMetrics.totalApplications,
            totalAccepted: campaignMetrics.totalAccepted,
            conversionRate: campaignMetrics.conversionRate,
            totalBudgetSpent: campaignMetrics.totalBudgetSpent
          }
        })
        .from(campaigns)
        .leftJoin(campaignMetrics, eq(campaigns.id, campaignMetrics.campaignId))
        .where(eq(campaigns.status, 'active'))
        .orderBy(desc(campaignMetrics.totalViews));

      return activeCampaigns;
    } catch (error) {
      console.error("Error getting live campaign performance:", error);
      throw error;
    }
  }
}