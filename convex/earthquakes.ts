import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert earthquake data
export const upsertEarthquake = mutation({
  args: {
    id: v.string(),
    time: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    magnitude: v.optional(v.number()),
    place: v.optional(v.string()),
    depth: v.optional(v.number()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("earthquakes")
      .withIndex("earthquake_id", (q) => q.eq("id", args.id))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        time: args.time,
        latitude: args.latitude,
        longitude: args.longitude,
        magnitude: args.magnitude,
        place: args.place,
        depth: args.depth,
        url: args.url,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("earthquakes", {
        id: args.id,
        time: args.time,
        latitude: args.latitude,
        longitude: args.longitude,
        magnitude: args.magnitude,
        place: args.place,
        depth: args.depth,
        url: args.url,
      });
    }
  },
});

// Get earthquake by ID
export const getEarthquakeById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("earthquakes")
      .withIndex("earthquake_id", (q) => q.eq("id", args.id))
      .first();
  },
});

// Get all earthquakes with pagination
export const getAllEarthquakes = query({
  args: { 
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    return await ctx.db
      .query("earthquakes")
      .order("desc")
      .take(limit);
  },
});
