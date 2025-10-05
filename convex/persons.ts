import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new person
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    houseValue: v.number(),
    hasInsurance: v.boolean(),
    userId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const personId = await ctx.db.insert("persons", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      city: args.city,
      state: args.state,
      latitude: args.latitude,
      longitude: args.longitude,
      houseValue: args.houseValue,
      hasInsurance: args.hasInsurance,
      userId: args.userId,
      createdAt: args.createdAt || Date.now(),
      updatedAt: args.updatedAt || Date.now(),
    });
    return personId;
  },
});

// Get all persons
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("persons").collect();
  },
});

// Get persons by location (within a bounding box)
export const getByLocation = query({
  args: {
    minLat: v.number(),
    maxLat: v.number(),
    minLng: v.number(),
    maxLng: v.number(),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    return persons.filter(person => 
      person.latitude >= args.minLat &&
      person.latitude <= args.maxLat &&
      person.longitude >= args.minLng &&
      person.longitude <= args.maxLng
    );
  },
});

// Get persons within a radius of a point
export const getByRadius = query({
  args: {
    centerLat: v.number(),
    centerLng: v.number(),
    radiusKm: v.number(),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    
    // Simple distance calculation (not perfectly accurate but good enough for demo)
    const earthRadiusKm = 6371;
    
    return persons.filter(person => {
      const lat1Rad = (args.centerLat * Math.PI) / 180;
      const lat2Rad = (person.latitude * Math.PI) / 180;
      const deltaLatRad = ((person.latitude - args.centerLat) * Math.PI) / 180;
      const deltaLngRad = ((person.longitude - args.centerLng) * Math.PI) / 180;

      const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = earthRadiusKm * c;

      return distanceKm <= args.radiusKm;
    });
  },
});

// Get persons without insurance
export const getUninsured = query({
  args: {
    minLat: v.optional(v.number()),
    maxLat: v.optional(v.number()),
    minLng: v.optional(v.number()),
    maxLng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    
    let filtered = persons.filter(person => !person.hasInsurance);
    
    // Apply location filter if provided
    if (args.minLat !== undefined && args.maxLat !== undefined && 
        args.minLng !== undefined && args.maxLng !== undefined) {
      filtered = filtered.filter(person => 
        person.latitude >= args.minLat! &&
        person.latitude <= args.maxLat! &&
        person.longitude >= args.minLng! &&
        person.longitude <= args.maxLng!
      );
    }
    
    return filtered;
  },
});

// Get persons with high house values
export const getHighValueHomes = query({
  args: {
    minValue: v.number(),
    minLat: v.optional(v.number()),
    maxLat: v.optional(v.number()),
    minLng: v.optional(v.number()),
    maxLng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    
    let filtered = persons.filter(person => person.houseValue >= args.minValue);
    
    // Apply location filter if provided
    if (args.minLat !== undefined && args.maxLat !== undefined && 
        args.minLng !== undefined && args.maxLng !== undefined) {
      filtered = filtered.filter(person => 
        person.latitude >= args.minLat! &&
        person.latitude <= args.maxLat! &&
        person.longitude >= args.minLng! &&
        person.longitude <= args.maxLng!
      );
    }
    
    return filtered;
  },
});

// Count total persons
export const count = query({
  args: {},
  handler: async (ctx) => {
    const persons = await ctx.db.query("persons").collect();
    return persons.length;
  },
});

// Count insured persons
export const countInsured = query({
  args: {},
  handler: async (ctx) => {
    const persons = await ctx.db.query("persons").collect();
    return persons.filter(person => person.hasInsurance).length;
  },
});

// Get sample persons
export const getSample = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    return persons.slice(0, args.limit);
  },
});

// Get persons by state
export const getByState = query({
  args: {
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    return persons.filter(person => person.state === args.state);
  },
});

// Get persons by city
export const getByCity = query({
  args: {
    city: v.string(),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const persons = await ctx.db.query("persons").collect();
    return persons.filter(person => 
      person.city === args.city && 
      (args.state === undefined || person.state === args.state)
    );
  },
});

// Get persons by email
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("persons")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update person
export const update = mutation({
  args: {
    id: v.id("persons"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    houseValue: v.optional(v.number()),
    hasInsurance: v.optional(v.boolean()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete person
export const remove = mutation({
  args: {
    id: v.id("persons"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Clear all persons (for testing)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const persons = await ctx.db.query("persons").collect();
    for (const person of persons) {
      await ctx.db.delete(person._id);
    }
    return persons.length;
  },
});
