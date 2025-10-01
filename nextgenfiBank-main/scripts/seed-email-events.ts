import { prisma } from '../lib/prisma';

async function seedEmailEvents() {
  console.log('🌱 Seeding email events for testing...');

  const now = new Date();
  const events = [];

  // Generate test events for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate some delivered events
    for (let j = 0; j < Math.floor(Math.random() * 50) + 20; j++) {
      events.push({
        type: 'delivered',
        email: `test${j}@example.com`,
        timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        campaignId: i < 3 ? 'test-campaign-1' : 'test-campaign-2',
        userId: `user-${j}`,
      });
    }

    // Generate some open events (30-50% of delivered)
    const openCount = Math.floor(events.filter(e => e.type === 'delivered' && e.timestamp.toDateString() === date.toDateString()).length * (0.3 + Math.random() * 0.2));
    for (let j = 0; j < openCount; j++) {
      events.push({
        type: 'open',
        email: `test${j}@example.com`,
        timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        campaignId: i < 3 ? 'test-campaign-1' : 'test-campaign-2',
        userId: `user-${j}`,
      });
    }

    // Generate some click events (5-15% of delivered)
    const clickCount = Math.floor(events.filter(e => e.type === 'delivered' && e.timestamp.toDateString() === date.toDateString()).length * (0.05 + Math.random() * 0.1));
    for (let j = 0; j < clickCount; j++) {
      events.push({
        type: 'click',
        email: `test${j}@example.com`,
        url: 'https://nextgenfi.com/insurance-quote',
        timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        campaignId: i < 3 ? 'test-campaign-1' : 'test-campaign-2',
        userId: `user-${j}`,
      });
    }

    // Generate some bounce events (1-3% of delivered)
    const bounceCount = Math.floor(events.filter(e => e.type === 'delivered' && e.timestamp.toDateString() === date.toDateString()).length * (0.01 + Math.random() * 0.02));
    for (let j = 0; j < bounceCount; j++) {
      events.push({
        type: 'bounce',
        email: `invalid${j}@example.com`,
        timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        campaignId: i < 3 ? 'test-campaign-1' : 'test-campaign-2',
        userId: `user-${j}`,
      });
    }
  }

  // Insert all events
  await prisma.emailEvent.createMany({
    data: events,
  });

  console.log(`✅ Created ${events.length} test email events`);
  console.log('📊 You can now view email analytics in your dashboard!');
}

seedEmailEvents()
  .catch((e) => {
    console.error('❌ Error seeding email events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

