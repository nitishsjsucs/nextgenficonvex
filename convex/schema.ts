import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Convex Auth tables
  ...authTables,
  
  // Custom users table with additional fields
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    phoneNumberVerified: v.optional(v.boolean()),
    dateOfBirth: v.optional(v.string()),
    ssn: v.optional(v.string()),
    kycVerified: v.optional(v.boolean()),
    userId: v.optional(v.string()),
    username: v.optional(v.string()),
    displayUsername: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    twoFactorEnabled: v.optional(v.boolean()),
  }).index("email", ["email"]),
  
  // Earthquake data
  earthquakes: defineTable({
    id: v.string(),
    time: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    magnitude: v.optional(v.number()),
    place: v.optional(v.string()),
    depth: v.optional(v.number()),
    url: v.optional(v.string()),
  }).index("earthquake_id", ["id"]),
  
  // Weather events
  weatherEvents: defineTable({
    id: v.string(),
    eventType: v.string(),
    severity: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    description: v.optional(v.string()),
    affectedArea: v.optional(v.string()),
  }).index("by_location", ["latitude", "longitude"]),
  
  // Campaigns
  campaigns: defineTable({
    personId: v.optional(v.string()),
    earthquakeId: v.string(),
    subject: v.string(),
    content: v.string(),
    riskLevel: v.string(),
    targetCount: v.number(),
    sentCount: v.number(),
    openCount: v.number(),
    clickCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_earthquake", ["earthquakeId"]),
  
  // Email events
  emailEvents: defineTable({
    campaignId: v.string(),
    personId: v.string(),
    eventType: v.string(), // 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_campaign", ["campaignId"]),
  
  // Persons/Users data
  persons: defineTable({
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
    userId: v.optional(v.string()), // Reference to users table
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]).index("by_user", ["userId"]),
  
  // Scout data enrichment
  scoutData: defineTable({
    personId: v.string(),
    age: v.optional(v.number()),
    ehiV2: v.optional(v.string()), // income
    wealthscrV2: v.optional(v.string()), // wealth
    homeownercd: v.optional(v.string()),
    lor: v.optional(v.number()), // length of residence
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
    dnc: v.optional(v.string()), // do not call
  }).index("by_person", ["personId"]),
  
  // Weather campaigns
  weatherCampaigns: defineTable({
    personId: v.optional(v.string()),
    weatherEventId: v.string(),
    subject: v.string(),
    content: v.string(),
    riskLevel: v.string(),
    targetCount: v.number(),
    sentCount: v.number(),
    openCount: v.number(),
    clickCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_weather_event", ["weatherEventId"]),
});
