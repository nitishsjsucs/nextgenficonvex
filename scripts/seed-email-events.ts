import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Sample email events for testing analytics
const sampleEmailEvents = [
  // Campaign 1 - Earthquake Insurance
  { campaignId: "earthquake-campaign-001", personId: "person-001", eventType: "sent", timestamp: Date.now() - 86400000 * 2 }, // 2 days ago
  { campaignId: "earthquake-campaign-001", personId: "person-001", eventType: "delivered", timestamp: Date.now() - 86400000 * 2 + 300000 }, // 2 days ago + 5 min
  { campaignId: "earthquake-campaign-001", personId: "person-001", eventType: "opened", timestamp: Date.now() - 86400000 * 2 + 1800000 }, // 2 days ago + 30 min
  { campaignId: "earthquake-campaign-001", personId: "person-001", eventType: "clicked", timestamp: Date.now() - 86400000 * 2 + 3600000 }, // 2 days ago + 1 hour
  
  { campaignId: "earthquake-campaign-001", personId: "person-002", eventType: "sent", timestamp: Date.now() - 86400000 * 2 },
  { campaignId: "earthquake-campaign-001", personId: "person-002", eventType: "delivered", timestamp: Date.now() - 86400000 * 2 + 300000 },
  { campaignId: "earthquake-campaign-001", personId: "person-002", eventType: "opened", timestamp: Date.now() - 86400000 * 2 + 1800000 },
  
  { campaignId: "earthquake-campaign-001", personId: "person-003", eventType: "sent", timestamp: Date.now() - 86400000 * 2 },
  { campaignId: "earthquake-campaign-001", personId: "person-003", eventType: "delivered", timestamp: Date.now() - 86400000 * 2 + 300000 },
  { campaignId: "earthquake-campaign-001", personId: "person-003", eventType: "bounced", timestamp: Date.now() - 86400000 * 2 + 300000 },
  
  // Campaign 2 - Weather Insurance
  { campaignId: "weather-campaign-001", personId: "person-004", eventType: "sent", timestamp: Date.now() - 86400000 * 1 }, // 1 day ago
  { campaignId: "weather-campaign-001", personId: "person-004", eventType: "delivered", timestamp: Date.now() - 86400000 * 1 + 300000 },
  { campaignId: "weather-campaign-001", personId: "person-004", eventType: "opened", timestamp: Date.now() - 86400000 * 1 + 1800000 },
  { campaignId: "weather-campaign-001", personId: "person-004", eventType: "clicked", timestamp: Date.now() - 86400000 * 1 + 3600000 },
  
  { campaignId: "weather-campaign-001", personId: "person-005", eventType: "sent", timestamp: Date.now() - 86400000 * 1 },
  { campaignId: "weather-campaign-001", personId: "person-005", eventType: "delivered", timestamp: Date.now() - 86400000 * 1 + 300000 },
  { campaignId: "weather-campaign-001", personId: "person-005", eventType: "opened", timestamp: Date.now() - 86400000 * 1 + 1800000 },
  
  { campaignId: "weather-campaign-001", personId: "person-006", eventType: "sent", timestamp: Date.now() - 86400000 * 1 },
  { campaignId: "weather-campaign-001", personId: "person-006", eventType: "delivered", timestamp: Date.now() - 86400000 * 1 + 300000 },
  
  // Recent events (today)
  { campaignId: "earthquake-campaign-002", personId: "person-007", eventType: "sent", timestamp: Date.now() - 3600000 }, // 1 hour ago
  { campaignId: "earthquake-campaign-002", personId: "person-007", eventType: "delivered", timestamp: Date.now() - 3600000 + 300000 },
  { campaignId: "earthquake-campaign-002", personId: "person-007", eventType: "opened", timestamp: Date.now() - 1800000 }, // 30 min ago
  { campaignId: "earthquake-campaign-002", personId: "person-007", eventType: "clicked", timestamp: Date.now() - 900000 }, // 15 min ago
  
  { campaignId: "earthquake-campaign-002", personId: "person-008", eventType: "sent", timestamp: Date.now() - 3600000 },
  { campaignId: "earthquake-campaign-002", personId: "person-008", eventType: "delivered", timestamp: Date.now() - 3600000 + 300000 },
  { campaignId: "earthquake-campaign-002", personId: "person-008", eventType: "opened", timestamp: Date.now() - 1800000 },
  
  { campaignId: "earthquake-campaign-002", personId: "person-009", eventType: "sent", timestamp: Date.now() - 3600000 },
  { campaignId: "earthquake-campaign-002", personId: "person-009", eventType: "delivered", timestamp: Date.now() - 3600000 + 300000 },
  
  // Some unsubscribes
  { campaignId: "earthquake-campaign-001", personId: "person-010", eventType: "sent", timestamp: Date.now() - 86400000 * 3 },
  { campaignId: "earthquake-campaign-001", personId: "person-010", eventType: "delivered", timestamp: Date.now() - 86400000 * 3 + 300000 },
  { campaignId: "earthquake-campaign-001", personId: "person-010", eventType: "unsubscribed", timestamp: Date.now() - 86400000 * 2 },
];

async function seedEmailEvents() {
  console.log('🌱 Seeding sample email events...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const event of sampleEmailEvents) {
    try {
      await convex.mutation(api.campaigns.createEmailEvent, {
        campaignId: event.campaignId,
        personId: event.personId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        metadata: {
          source: 'sample-data',
          testEvent: true
        }
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create event for ${event.campaignId}:`, error);
      errorCount++;
    }
  }
  
  console.log(`✅ Email events seeding completed:`);
  console.log(`   - Successfully created: ${successCount} events`);
  console.log(`   - Failed: ${errorCount} events`);
  console.log(`   - Total campaigns: ${new Set(sampleEmailEvents.map(e => e.campaignId)).size}`);
  console.log(`   - Total unique persons: ${new Set(sampleEmailEvents.map(e => e.personId)).size}`);
}

// Run the seeding
seedEmailEvents()
  .catch(async (e) => {
    console.error('❌ Error seeding email events:', e);
    process.exit(1);
  });