import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth tables
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.union(v.null(), v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    phoneNumber: v.optional(v.union(v.null(), v.string())),
    dateOfBirth: v.optional(v.union(v.null(), v.string())),
    ssn: v.optional(v.union(v.null(), v.string())),
    kycVerified: v.optional(v.union(v.null(), v.boolean())),
  }).index("email", ["email"]),
  
  session: defineTable({
    expiresAt: v.number(),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.union(v.null(), v.string())),
    userAgent: v.optional(v.union(v.null(), v.string())),
    userId: v.string(),
  }).index("token", ["token"]).index("userId", ["userId"]),
  
  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.string(),
    accessToken: v.optional(v.union(v.null(), v.string())),
    refreshToken: v.optional(v.union(v.null(), v.string())),
    idToken: v.optional(v.union(v.null(), v.string())),
    accessTokenExpiresAt: v.optional(v.union(v.null(), v.number())),
    refreshTokenExpiresAt: v.optional(v.union(v.null(), v.number())),
    scope: v.optional(v.union(v.null(), v.string())),
    password: v.optional(v.union(v.null(), v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("accountId", ["accountId"]).index("userId", ["userId"]),
  
  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("identifier", ["identifier"]),
  
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
  }).index("by_email", ["email"]),
  
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
