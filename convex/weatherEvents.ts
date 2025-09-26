import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert weather event
export const upsertWeatherEvent = mutation({
  args: {
    id: v.string(),
    eventType: v.string(),
    severity: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    description: v.optional(v.string()),
    affectedArea: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("weatherEvents")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        eventType: args.eventType,
        severity: args.severity,
        latitude: args.latitude,
        longitude: args.longitude,
        startTime: args.startTime,
        endTime: args.endTime,
        description: args.description,
        affectedArea: args.affectedArea,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("weatherEvents", {
        id: args.id,
        eventType: args.eventType,
        severity: args.severity,
        latitude: args.latitude,
        longitude: args.longitude,
        startTime: args.startTime,
        endTime: args.endTime,
        description: args.description,
        affectedArea: args.affectedArea,
      });
    }
  },
});

// Get weather event by ID
export const getWeatherEventById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weatherEvents")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
  },
});

// Get weather events by location
export const getWeatherEventsByLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 50; // km
    const latRange = radius / 111; // rough conversion
    const lngRange = radius / (111 * Math.cos(args.latitude * Math.PI / 180));
    
    // Get all weather events and filter by location
    const allEvents = await ctx.db.query("weatherEvents").collect();
    
    return allEvents.filter(event => {
      const latDiff = Math.abs(event.latitude - args.latitude);
      const lngDiff = Math.abs(event.longitude - args.longitude);
      return latDiff <= latRange && lngDiff <= lngRange;
    });
  },
});
