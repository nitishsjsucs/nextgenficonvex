import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get person by ID
export const getPersonById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const person = await ctx.db
      .query("persons")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    
    if (!person) return null;
    
    // Get associated scout data
    const scoutData = await ctx.db
      .query("scoutData")
      .withIndex("by_person", (q) => q.eq("personId", args.id))
      .first();
    
    return {
      ...person,
      scoutData,
    };
  },
});

// Get persons by location
export const getPersonsByLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 100; // km
    const limit = args.limit || 100;
    const latRange = radius / 111; // rough conversion
    const lngRange = radius / (111 * Math.cos(args.latitude * Math.PI / 180));
    
    const persons = await ctx.db
      .query("persons")
      .filter((q) => 
        q.and(
          q.gte(q.field("latitude"), args.latitude - latRange),
          q.lte(q.field("latitude"), args.latitude + latRange),
          q.gte(q.field("longitude"), args.longitude - lngRange),
          q.lte(q.field("longitude"), args.longitude + lngRange)
        )
      )
      .take(limit);
    
    // Get scout data for each person
    const personsWithScoutData = await Promise.all(
      persons.map(async (person) => {
        const scoutData = await ctx.db
          .query("scoutData")
          .withIndex("by_person", (q) => q.eq("personId", person._id))
          .first();
        
        return {
          ...person,
          scoutData,
        };
      })
    );
    
    return personsWithScoutData;
  },
});

// Create or update person
export const upsertPerson = mutation({
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("persons")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        city: args.city,
        state: args.state,
        latitude: args.latitude,
        longitude: args.longitude,
        houseValue: args.houseValue,
        hasInsurance: args.hasInsurance,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("persons", {
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
      });
    }
  },
});

// Create or update scout data
export const upsertScoutData = mutation({
  args: {
    personId: v.string(),
    age: v.optional(v.number()),
    ehiV2: v.optional(v.string()),
    wealthscrV2: v.optional(v.string()),
    homeownercd: v.optional(v.string()),
    lor: v.optional(v.number()),
    educationcd: v.optional(v.string()),
    marriedcd: v.optional(v.string()),
    child: v.optional(v.string()),
    veterancd: v.optional(v.string()),
    propValcalc: v.optional(v.string()),
    propYrbld: v.optional(v.string()),
    propLivingsqft: v.optional(v.string()),
    propBedrms: v.optional(v.string()),
    propBaths: v.optional(v.string()),
    propPool: v.optional(v.string()),
    propFrpl: v.optional(v.string()),
    cpiInsuranceIndex: v.optional(v.number()),
    cpiHealthIndex: v.optional(v.number()),
    cpiHomeLivIndex: v.optional(v.number()),
    creditcard: v.optional(v.string()),
    charitydnr: v.optional(v.string()),
    dnc: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scoutData")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        age: args.age,
        ehiV2: args.ehiV2,
        wealthscrV2: args.wealthscrV2,
        homeownercd: args.homeownercd,
        lor: args.lor,
        educationcd: args.educationcd,
        marriedcd: args.marriedcd,
        child: args.child,
        veterancd: args.veterancd,
        propValcalc: args.propValcalc,
        propYrbld: args.propYrbld,
        propLivingsqft: args.propLivingsqft,
        propBedrms: args.propBedrms,
        propBaths: args.propBaths,
        propPool: args.propPool,
        propFrpl: args.propFrpl,
        cpiInsuranceIndex: args.cpiInsuranceIndex,
        cpiHealthIndex: args.cpiHealthIndex,
        cpiHomeLivIndex: args.cpiHomeLivIndex,
        creditcard: args.creditcard,
        charitydnr: args.charitydnr,
        dnc: args.dnc,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("scoutData", {
        personId: args.personId,
        age: args.age,
        ehiV2: args.ehiV2,
        wealthscrV2: args.wealthscrV2,
        homeownercd: args.homeownercd,
        lor: args.lor,
        educationcd: args.educationcd,
        marriedcd: args.marriedcd,
        child: args.child,
        veterancd: args.veterancd,
        propValcalc: args.propValcalc,
        propYrbld: args.propYrbld,
        propLivingsqft: args.propLivingsqft,
        propBedrms: args.propBedrms,
        propBaths: args.propBaths,
        propPool: args.propPool,
        propFrpl: args.propFrpl,
        cpiInsuranceIndex: args.cpiInsuranceIndex,
        cpiHealthIndex: args.cpiHealthIndex,
        cpiHomeLivIndex: args.cpiHomeLivIndex,
        creditcard: args.creditcard,
        charitydnr: args.charitydnr,
        dnc: args.dnc,
      });
    }
  },
});
