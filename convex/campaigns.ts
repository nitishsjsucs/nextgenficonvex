import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create campaign
export const createCampaign = mutation({
  args: {
    personId: v.optional(v.string()),
    earthquakeId: v.string(),
    subject: v.string(),
    content: v.string(),
    riskLevel: v.string(),
    targetCount: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("campaigns", {
      personId: args.personId,
      earthquakeId: args.earthquakeId,
      subject: args.subject,
      content: args.content,
      riskLevel: args.riskLevel,
      targetCount: args.targetCount,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all campaigns
export const getAllCampaigns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("campaigns")
      .order("desc")
      .take(limit);
  },
});

// Create email event
export const createEmailEvent = mutation({
  args: {
    campaignId: v.string(),
    personId: v.string(),
    eventType: v.string(),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log('💾 [DEBUG] ===== CONVEX CREATE EMAIL EVENT =====');
    console.log('💾 [DEBUG] Args:', {
      campaignId: args.campaignId,
      personId: args.personId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      metadata: args.metadata
    });
    
    const result = await ctx.db.insert("emailEvents", {
      campaignId: args.campaignId,
      personId: args.personId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      metadata: args.metadata,
    });
    
    console.log('💾 [DEBUG] Email event created with ID:', result);
    console.log('💾 [DEBUG] ===== CONVEX CREATE EMAIL EVENT COMPLETED =====');
    
    return result;
  },
});

// Delete email event
export const deleteEmailEvent = mutation({
  args: { id: v.id("emailEvents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get all email events
export const getAllEmailEvents = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db.query("emailEvents").collect();
    
    // Filter by date range if provided
    let filteredEvents = events;
    if (args.startDate || args.endDate) {
      filteredEvents = events.filter(event => {
        if (args.startDate && event.timestamp < args.startDate) return false;
        if (args.endDate && event.timestamp > args.endDate) return false;
        return true;
      });
    }
    
    return filteredEvents;
  },
});

// Get email stats
export const getEmailStats = query({
  args: {
    campaignId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('📊 [DEBUG] ===== CONVEX GET EMAIL STATS =====');
    console.log('📊 [DEBUG] Args:', {
      campaignId: args.campaignId,
      startDate: args.startDate,
      endDate: args.endDate,
      startDateStr: args.startDate ? new Date(args.startDate).toISOString() : null,
      endDateStr: args.endDate ? new Date(args.endDate).toISOString() : null
    });
    
    let events;
    
    if (args.campaignId) {
      console.log('📊 [DEBUG] Filtering by campaign ID:', args.campaignId);
      events = await ctx.db
        .query("emailEvents")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId!))
        .collect();
    } else {
      console.log('📊 [DEBUG] Getting all email events');
      events = await ctx.db.query("emailEvents").collect();
    }
    
    console.log('📊 [DEBUG] Raw events count:', events.length);
    console.log('📊 [DEBUG] Raw events sample:', events.slice(0, 3).map(e => ({
      id: e._id,
      campaignId: e.campaignId,
      personId: e.personId,
      eventType: e.eventType,
      timestamp: new Date(e.timestamp).toISOString()
    })));
    
    // Filter by date range if provided
    let filteredEvents = events;
    if (args.startDate || args.endDate) {
      console.log('📊 [DEBUG] Filtering by date range...');
      filteredEvents = events.filter(event => {
        if (args.startDate && event.timestamp < args.startDate) return false;
        if (args.endDate && event.timestamp > args.endDate) return false;
        return true;
      });
      console.log('📊 [DEBUG] Filtered events count:', filteredEvents.length);
    }
    
    // Aggregate stats with proper SendGrid event type mapping
    const stats = {
      total: filteredEvents.length,
      sent: filteredEvents.filter(e => e.eventType === 'sent' || e.eventType === 'processed').length,
      delivered: filteredEvents.filter(e => e.eventType === 'delivered').length,
      opened: filteredEvents.filter(e => e.eventType === 'opened' || e.eventType === 'open').length,
      clicked: filteredEvents.filter(e => e.eventType === 'clicked' || e.eventType === 'click').length,
      bounced: filteredEvents.filter(e => e.eventType === 'bounced' || e.eventType === 'bounce').length,
      unsubscribed: filteredEvents.filter(e => e.eventType === 'unsubscribed' || e.eventType === 'unsubscribe').length,
    };
    
    console.log('📊 [DEBUG] Calculated stats:', stats);
    console.log('📊 [DEBUG] ===== CONVEX GET EMAIL STATS COMPLETED =====');
    
    return stats;
  },
});

// Get campaign performance stats
export const getCampaignPerformance = query({
  args: {
    campaignId: v.optional(v.string()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('📊 [DEBUG] ===== CONVEX GET CAMPAIGN PERFORMANCE =====');
    console.log('📊 [DEBUG] Args:', {
      campaignId: args.campaignId,
      days: args.days
    });
    
    // Calculate date range
    const now = Date.now();
    const daysBack = args.days || 30;
    const startDate = now - (daysBack * 24 * 60 * 60 * 1000);
    
    console.log('📊 [DEBUG] Date range:', {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(now).toISOString(),
      daysBack
    });
    
    let events;
    
    if (args.campaignId) {
      console.log('📊 [DEBUG] Filtering by campaign ID:', args.campaignId);
      events = await ctx.db
        .query("emailEvents")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId!))
        .collect();
    } else {
      console.log('📊 [DEBUG] Getting all email events');
      events = await ctx.db.query("emailEvents").collect();
    }
    
    // Filter by date range
    const filteredEvents = events.filter(event => {
      return event.timestamp >= startDate && event.timestamp <= now;
    });
    
    console.log('📊 [DEBUG] Filtered events count:', filteredEvents.length);
    
    // Calculate performance metrics
    const performance = {
      totalEvents: filteredEvents.length,
      processed: filteredEvents.filter(e => e.eventType === 'sent' || e.eventType === 'processed').length,
      delivered: filteredEvents.filter(e => e.eventType === 'delivered').length,
      opened: filteredEvents.filter(e => e.eventType === 'opened' || e.eventType === 'open').length,
      clicked: filteredEvents.filter(e => e.eventType === 'clicked' || e.eventType === 'click').length,
      bounced: filteredEvents.filter(e => e.eventType === 'bounced' || e.eventType === 'bounce').length,
      unsubscribed: filteredEvents.filter(e => e.eventType === 'unsubscribed' || e.eventType === 'unsubscribe').length,
    };
    
    // Calculate rates
    const rates = {
      openRate: performance.delivered > 0 ? (performance.opened / performance.delivered) * 100 : 0,
      clickRate: performance.delivered > 0 ? (performance.clicked / performance.delivered) * 100 : 0,
      bounceRate: performance.processed > 0 ? (performance.bounced / performance.processed) * 100 : 0,
      deliveryRate: performance.processed > 0 ? (performance.delivered / performance.processed) * 100 : 0,
    };
    
    const result = {
      ...performance,
      ...rates,
      dateRange: {
        start: startDate,
        end: now,
        days: daysBack
      }
    };
    
    console.log('📊 [DEBUG] Campaign performance result:', result);
    console.log('📊 [DEBUG] ===== CONVEX GET CAMPAIGN PERFORMANCE COMPLETED =====');
    
    return result;
  },
});
