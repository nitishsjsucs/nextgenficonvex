import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function comprehensiveTargetingTest() {
  console.log('🧪 COMPREHENSIVE TARGETING SYSTEM TEST');
  console.log('=====================================\n');
  
  try {
    // Test 1: Check database connectivity and basic data
    console.log('📊 TEST 1: Database Connectivity & Basic Data');
    console.log('---------------------------------------------');
    
    const personCount = await prisma.person.count();
    console.log(`✅ Total persons in database: ${personCount.toLocaleString()}`);
    
    const earthquakeCount = await prisma.earthquake.count();
    console.log(`✅ Total earthquakes in database: ${earthquakeCount}`);
    
    if (personCount === 0) {
      console.log('❌ No persons found! Run the seed scripts first.');
      return;
    }
    
    if (earthquakeCount === 0) {
      console.log('❌ No earthquakes found! Need to fetch earthquake data.');
      console.log('💡 Go to dashboard and select an earthquake region from the map.');
      return;
    }
    
    // Test 2: Analyze customer data distribution
    console.log('\n📈 TEST 2: Customer Data Analysis');
    console.log('----------------------------------');
    
    const stats = await prisma.person.aggregate({
      _count: { id: true },
      _min: { houseValue: true },
      _max: { houseValue: true },
      _avg: { houseValue: true }
    });
    
    console.log(`📊 House Value Statistics:`);
    console.log(`   Min: $${stats._min.houseValue?.toLocaleString()}`);
    console.log(`   Max: $${stats._max.houseValue?.toLocaleString()}`);
    console.log(`   Avg: $${Math.round(stats._avg.houseValue || 0).toLocaleString()}`);
    
    const uninsuredCount = await prisma.person.count({
      where: { hasInsurance: false }
    });
    console.log(`🏠 Uninsured customers: ${uninsuredCount.toLocaleString()} (${Math.round(uninsuredCount/personCount*100)}%)`);
    
    const insuredCount = await prisma.person.count({
      where: { hasInsurance: true }
    });
    console.log(`🛡️ Insured customers: ${insuredCount.toLocaleString()} (${Math.round(insuredCount/personCount*100)}%)`);
    
    // Test 3: Check earthquake data quality
    console.log('\n🌋 TEST 3: Earthquake Data Quality');
    console.log('----------------------------------');
    
    const earthquakesWithLocation = await prisma.earthquake.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`✅ Earthquakes with location data: ${earthquakesWithLocation}`);
    
    const sampleEarthquake = await prisma.earthquake.findFirst({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        place: true,
        magnitude: true,
        latitude: true,
        longitude: true,
        time: true
      }
    });
    
    if (sampleEarthquake) {
      console.log(`📋 Sample earthquake:`);
      console.log(`   ID: ${sampleEarthquake.id}`);
      console.log(`   Place: ${sampleEarthquake.place}`);
      console.log(`   Magnitude: ${sampleEarthquake.magnitude}`);
      console.log(`   Location: ${sampleEarthquake.latitude}, ${sampleEarthquake.longitude}`);
      console.log(`   Time: ${sampleEarthquake.time ? new Date(Number(sampleEarthquake.time)).toISOString() : 'N/A'}`);
    }
    
    // Test 4: Test different targeting scenarios
    console.log('\n🎯 TEST 4: Targeting Scenarios');
    console.log('------------------------------');
    
    if (!sampleEarthquake) {
      console.log('❌ Cannot test targeting without earthquake data');
      return;
    }
    
    const testScenarios = [
      {
        name: "Very Broad Search",
        params: {
          earthquakeId: sampleEarthquake.id,
          maxDistance: 10000, // 10,000km (very broad)
          minHouseValue: 0, // No minimum
          requireUninsured: false,
          requireHomeowner: false,
          excludeDoNotCall: false,
          limit: 100
        }
      },
      {
        name: "Realistic Search (Uninsured Only)",
        params: {
          earthquakeId: sampleEarthquake.id,
          maxDistance: 1000, // 1,000km
          minHouseValue: 50000, // $50k minimum
          requireUninsured: true,
          requireHomeowner: false,
          excludeDoNotCall: false,
          limit: 50
        }
      },
      {
        name: "Conservative Search",
        params: {
          earthquakeId: sampleEarthquake.id,
          maxDistance: 100, // 100km
          minHouseValue: 100000, // $100k minimum
          requireUninsured: true,
          requireHomeowner: false,
          excludeDoNotCall: false,
          limit: 20
        }
      }
    ];
    
    for (const scenario of testScenarios) {
      console.log(`\n🔍 Testing: ${scenario.name}`);
      console.log(`   Parameters:`, scenario.params);
      
      try {
        const response = await fetch('http://localhost:3000/api/rag/targets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scenario.params)
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.log(`   ❌ API Error: ${error}`);
          continue;
        }
        
        const result = await response.json();
        console.log(`   ✅ Results:`);
        console.log(`      Total targets: ${result.summary.total_targets}`);
        console.log(`      High risk: ${result.summary.high_risk_targets}`);
        console.log(`      Medium risk: ${result.summary.medium_risk_targets}`);
        console.log(`      Low risk: ${result.summary.low_risk_targets}`);
        
        if (result.targets.length > 0) {
          console.log(`   👤 Sample targets:`);
          result.targets.slice(0, 2).forEach((target: any, i: number) => {
            console.log(`      ${i + 1}. ${target.person.firstName} ${target.person.lastName}`);
            console.log(`         Location: ${target.person.city}, ${target.person.state}`);
            console.log(`         House Value: $${target.person.houseValue.toLocaleString()}`);
            console.log(`         Distance: ${target.distance_km}km`);
            console.log(`         Risk: ${target.risk_level}`);
            console.log(`         Has Insurance: ${target.person.hasInsurance}`);
          });
        } else {
          console.log(`   ⚠️ No targets found with these parameters`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error}`);
      }
    }
    
    // Test 5: Check geographic distribution
    console.log('\n🗺️ TEST 5: Geographic Distribution');
    console.log('------------------------------------');
    
    const stateCounts = await prisma.person.groupBy({
      by: ['state'],
      _count: { state: true },
      orderBy: { _count: { state: 'desc' } },
      take: 10
    });
    
    console.log('📊 Top 10 states by customer count:');
    stateCounts.forEach((state, i) => {
      console.log(`   ${i + 1}. ${state.state}: ${state._count.state.toLocaleString()} customers`);
    });
    
    // Test 6: Distance calculation test
    console.log('\n📏 TEST 6: Distance Calculation');
    console.log('--------------------------------');
    
    if (sampleEarthquake) {
      const nearbyCustomers = await prisma.person.findMany({
        where: {
          latitude: {
            gte: sampleEarthquake.latitude! - 1, // Within 1 degree
            lte: sampleEarthquake.latitude! + 1
          },
          longitude: {
            gte: sampleEarthquake.longitude! - 1,
            lte: sampleEarthquake.longitude! + 1
          }
        },
        take: 5,
        select: {
          firstName: true,
          lastName: true,
          city: true,
          state: true,
          latitude: true,
          longitude: true
        }
      });
      
      console.log(`📍 Customers within 1 degree of earthquake:`);
      nearbyCustomers.forEach((customer, i) => {
        const distance = calculateDistance(
          sampleEarthquake.latitude!,
          sampleEarthquake.longitude!,
          customer.latitude!,
          customer.longitude!
        );
        console.log(`   ${i + 1}. ${customer.firstName} ${customer.lastName}`);
        console.log(`      Location: ${customer.city}, ${customer.state}`);
        console.log(`      Distance: ${distance.toFixed(2)}km`);
      });
    }
    
    console.log('\n✅ COMPREHENSIVE TEST COMPLETED');
    console.log('===============================');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Wait for server to start, then run tests
setTimeout(comprehensiveTargetingTest, 5000);
