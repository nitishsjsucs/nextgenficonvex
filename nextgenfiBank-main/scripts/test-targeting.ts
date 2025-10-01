import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testTargeting() {
  console.log('🔍 Testing targeting system...');
  
  try {
    // Check if we have earthquakes
    const earthquakeCount = await prisma.earthquake.count();
    console.log(`📊 Total earthquakes in database: ${earthquakeCount}`);
    
    if (earthquakeCount === 0) {
      console.log('❌ No earthquakes found! Need to fetch earthquake data first.');
      console.log('💡 Go to the dashboard and select an earthquake region from the map.');
      return;
    }
    
    // Get a sample earthquake
    const sampleEarthquake = await prisma.earthquake.findFirst({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    if (!sampleEarthquake) {
      console.log('❌ No earthquakes with location data found!');
      return;
    }
    
    console.log('🌋 Sample earthquake:', {
      id: sampleEarthquake.id,
      place: sampleEarthquake.place,
      magnitude: sampleEarthquake.magnitude,
      lat: sampleEarthquake.latitude,
      lng: sampleEarthquake.longitude
    });
    
    // Check customer data
    const customerCount = await prisma.person.count();
    console.log(`👥 Total customers: ${customerCount}`);
    
    const uninsuredCount = await prisma.person.count({
      where: { hasInsurance: false }
    });
    console.log(`🏠 Uninsured customers: ${uninsuredCount}`);
    
    const highValueCount = await prisma.person.count({
      where: { 
        houseValue: { gte: 100000 },
        hasInsurance: false 
      }
    });
    console.log(`💰 Uninsured customers with $100k+ homes: ${highValueCount}`);
    
    // Test targeting with a reasonable earthquake
    const testRequest = {
      earthquakeId: sampleEarthquake.id,
      maxDistance: 1000, // 1000km radius
      minHouseValue: 100000, // $100k minimum
      requireUninsured: true,
      requireHomeowner: false,
      excludeDoNotCall: false,
      limit: 10
    };
    
    console.log('\n🎯 Testing targeting with parameters:', testRequest);
    
    // Make API call
    const response = await fetch('http://localhost:3000/api/rag/targets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ API Error:', error);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Targeting Results:');
    console.log(`   Total targets: ${result.summary.total_targets}`);
    console.log(`   High risk: ${result.summary.high_risk_targets}`);
    console.log(`   Medium risk: ${result.summary.medium_risk_targets}`);
    console.log(`   Low risk: ${result.summary.low_risk_targets}`);
    
    if (result.targets.length > 0) {
      console.log('\n👤 Sample targets:');
      result.targets.slice(0, 3).forEach((target: any, i: number) => {
        console.log(`   ${i + 1}. ${target.person.firstName} ${target.person.lastName}`);
        console.log(`      Location: ${target.person.city}, ${target.person.state}`);
        console.log(`      House Value: $${target.person.houseValue.toLocaleString()}`);
        console.log(`      Distance: ${target.distance_km}km`);
        console.log(`      Risk: ${target.risk_level}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Wait a moment for server to start, then test
setTimeout(testTargeting, 3000);
