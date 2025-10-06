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
    return await ctx.db.insert("emailEvents", {
      campaignId: args.campaignId,
      personId: args.personId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      metadata: args.metadata,
    });
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
    let events;
    
    if (args.campaignId) {
      events = await ctx.db
        .query("emailEvents")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId!))
        .collect();
    } else {
      events = await ctx.db.query("emailEvents").collect();
    }
    
    // Filter by date range if provided
    let filteredEvents = events;
    if (args.startDate || args.endDate) {
      filteredEvents = events.filter(event => {
        if (args.startDate && event.timestamp < args.startDate) return false;
        if (args.endDate && event.timestamp > args.endDate) return false;
        return true;
      });
    }
    
    // Aggregate stats
    const stats = {
      total: filteredEvents.length,
      sent: filteredEvents.filter(e => e.eventType === 'sent').length,
      delivered: filteredEvents.filter(e => e.eventType === 'delivered').length,
      opened: filteredEvents.filter(e => e.eventType === 'opened').length,
      clicked: filteredEvents.filter(e => e.eventType === 'clicked').length,
      bounced: filteredEvents.filter(e => e.eventType === 'bounced').length,
      unsubscribed: filteredEvents.filter(e => e.eventType === 'unsubscribed').length,
    };
    
    return stats;
  },
});
