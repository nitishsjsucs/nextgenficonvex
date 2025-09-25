import { PrismaClient } from '../generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Major US cities with their coordinates and earthquake risk levels
const usCities = [
  // High earthquake risk areas (West Coast, Alaska, etc.)
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, risk: 'high' },
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, risk: 'high' },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, risk: 'high' },
  { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, risk: 'high' },
  { name: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712, risk: 'high' },
  { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, risk: 'high' },
  { name: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871, risk: 'high' },
  { name: 'Long Beach', state: 'CA', lat: 33.7701, lng: -118.1937, risk: 'high' },
  { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784, risk: 'high' },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, risk: 'high' },
  { name: 'Anchorage', state: 'AK', lat: 61.2181, lng: -149.9003, risk: 'high' },
  { name: 'Reno', state: 'NV', lat: 39.5296, lng: -119.8138, risk: 'high' },
  { name: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910, risk: 'high' },
  { name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, risk: 'high' },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, risk: 'high' },
  { name: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747, risk: 'high' },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, risk: 'high' },
  { name: 'Boise', state: 'ID', lat: 43.6150, lng: -116.2023, risk: 'high' },
  { name: 'Spokane', state: 'WA', lat: 47.6588, lng: -117.4260, risk: 'high' },
  { name: 'Eugene', state: 'OR', lat: 44.0521, lng: -123.0868, risk: 'high' },

  // Medium earthquake risk areas
  { name: 'New York City', state: 'NY', lat: 40.7128, lng: -74.0060, risk: 'medium' },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, risk: 'medium' },
  { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, risk: 'medium' },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, risk: 'medium' },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, risk: 'medium' },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, risk: 'medium' },
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, risk: 'medium' },
  { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557, risk: 'medium' },
  { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308, risk: 'medium' },
  { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, risk: 'medium' },
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, risk: 'medium' },
  { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, risk: 'medium' },
  { name: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369, risk: 'medium' },
  { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, risk: 'medium' },

  // Low earthquake risk areas (East Coast, Midwest, South)
  { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, risk: 'low' },
  { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, risk: 'low' },
  { name: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572, risk: 'low' },
  { name: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792, risk: 'low' },
  { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, risk: 'low' },
  { name: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490, risk: 'low' },
  { name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, risk: 'low' },
  { name: 'Birmingham', state: 'AL', lat: 33.5207, lng: -86.8025, risk: 'low' },
  { name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715, risk: 'low' },
  { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, risk: 'low' },
  { name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, risk: 'low' },
  { name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065, risk: 'low' },
  { name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, risk: 'low' },
  { name: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944, risk: 'low' },
  { name: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959, risk: 'low' },
  { name: 'Buffalo', state: 'NY', lat: 42.8864, lng: -78.8784, risk: 'low' },
  { name: 'Rochester', state: 'NY', lat: 43.1566, lng: -77.6088, risk: 'low' },
  { name: 'Syracuse', state: 'NY', lat: 43.0481, lng: -76.1474, risk: 'low' },
  { name: 'Albany', state: 'NY', lat: 42.6526, lng: -73.7562, risk: 'low' },
  { name: 'Hartford', state: 'CT', lat: 41.7658, lng: -72.6734, risk: 'low' },
  { name: 'Providence', state: 'RI', lat: 41.8240, lng: -71.4128, risk: 'low' },
  { name: 'Portland', state: 'ME', lat: 43.6591, lng: -70.2568, risk: 'low' },
  { name: 'Burlington', state: 'VT', lat: 44.4759, lng: -73.2121, risk: 'low' },
  { name: 'Concord', state: 'NH', lat: 43.2081, lng: -71.5376, risk: 'low' },
  { name: 'Montpelier', state: 'VT', lat: 44.2601, lng: -72.5754, risk: 'low' },
  { name: 'Augusta', state: 'ME', lat: 44.3106, lng: -69.7795, risk: 'low' },
  { name: 'Des Moines', state: 'IA', lat: 41.5868, lng: -93.6250, risk: 'low' },
  { name: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345, risk: 'low' },
  { name: 'Fargo', state: 'ND', lat: 46.8772, lng: -96.7898, risk: 'low' },
  { name: 'Sioux Falls', state: 'SD', lat: 43.5446, lng: -96.7311, risk: 'low' },
  { name: 'Billings', state: 'MT', lat: 45.7833, lng: -108.5007, risk: 'low' },
  { name: 'Cheyenne', state: 'WY', lat: 41.1400, lng: -104.8192, risk: 'low' },
  { name: 'Pierre', state: 'SD', lat: 44.3683, lng: -100.3510, risk: 'low' },
  { name: 'Bismarck', state: 'ND', lat: 46.8083, lng: -100.7837, risk: 'low' },
  { name: 'Helena', state: 'MT', lat: 46.5884, lng: -112.0245, risk: 'low' },
  { name: 'Casper', state: 'WY', lat: 42.8666, lng: -106.3131, risk: 'low' },
  { name: 'Rapid City', state: 'SD', lat: 43.0755, lng: -103.2021, risk: 'low' },
  { name: 'Grand Forks', state: 'ND', lat: 47.9253, lng: -97.0329, risk: 'low' },
  { name: 'Minot', state: 'ND', lat: 48.2325, lng: -101.2963, risk: 'low' },
  { name: 'Williston', state: 'ND', lat: 47.1470, lng: -103.6180, risk: 'low' },
  { name: 'Dickinson', state: 'ND', lat: 46.8792, lng: -102.7896, risk: 'low' },
  { name: 'Mandan', state: 'ND', lat: 46.8267, lng: -100.8896, risk: 'low' },
  { name: 'West Fargo', state: 'ND', lat: 46.8749, lng: -96.9006, risk: 'low' },
  { name: 'Jamestown', state: 'ND', lat: 46.9105, lng: -98.7084, risk: 'low' },
  { name: 'Wahpeton', state: 'ND', lat: 46.2652, lng: -96.6059, risk: 'low' },
  { name: 'Valley City', state: 'ND', lat: 46.9233, lng: -98.0032, risk: 'low' },
  { name: 'Devils Lake', state: 'ND', lat: 48.1128, lng: -98.8651, risk: 'low' },
  { name: 'Grafton', state: 'ND', lat: 48.4172, lng: -97.4106, risk: 'low' },
  { name: 'Beulah', state: 'ND', lat: 47.2631, lng: -101.7779, risk: 'low' },
  { name: 'Watford City', state: 'ND', lat: 47.8028, lng: -103.2831, risk: 'low' },
  { name: 'Stanley', state: 'ND', lat: 48.3172, lng: -102.3904, risk: 'low' },
  { name: 'New Town', state: 'ND', lat: 47.9800, lng: -102.4903, risk: 'low' },
  { name: 'Tioga', state: 'ND', lat: 48.3972, lng: -102.9381, risk: 'low' },
  { name: 'Crosby', state: 'ND', lat: 48.9142, lng: -103.2978, risk: 'low' },
  { name: 'Parshall', state: 'ND', lat: 47.9536, lng: -102.1347, risk: 'low' },
  { name: 'Makoti', state: 'ND', lat: 47.9608, lng: -101.8079, risk: 'low' },
  { name: 'Trenton', state: 'ND', lat: 48.0706, lng: -103.8363, risk: 'low' },
  { name: 'Ray', state: 'ND', lat: 48.3447, lng: -103.1653, risk: 'low' },
  { name: 'Ross', state: 'ND', lat: 48.3131, lng: -102.5464, risk: 'low' },
  { name: 'Alexander', state: 'ND', lat: 47.8414, lng: -103.6442, risk: 'low' },
  { name: 'Arnegard', state: 'ND', lat: 47.8078, lng: -103.4364, risk: 'low' },
  { name: 'Keene', state: 'ND', lat: 47.9297, lng: -102.9364, risk: 'low' },
  { name: 'Sawyer', state: 'ND', lat: 48.0881, lng: -101.0531, risk: 'low' },
  { name: 'Temple', state: 'ND', lat: 47.9208, lng: -102.3903, risk: 'low' },
  { name: 'Wheelock', state: 'ND', lat: 47.9208, lng: -102.3903, risk: 'low' },
  { name: 'Wildrose', state: 'ND', lat: 48.6308, lng: -103.1903, risk: 'low' },
  { name: 'Zahl', state: 'ND', lat: 48.5808, lng: -103.6403, risk: 'low' },
  { name: 'Ambrose', state: 'ND', lat: 48.5508, lng: -103.4803, risk: 'low' },
  { name: 'Appam', state: 'ND', lat: 48.4808, lng: -103.3203, risk: 'low' },
  { name: 'Banks', state: 'ND', lat: 48.4208, lng: -103.1603, risk: 'low' },
  { name: 'Bonetraill', state: 'ND', lat: 48.3608, lng: -103.0003, risk: 'low' },
  { name: 'Coleharbor', state: 'ND', lat: 48.3008, lng: -102.8403, risk: 'low' },
  { name: 'Douglas', state: 'ND', lat: 48.2408, lng: -102.6803, risk: 'low' },
  { name: 'Epping', state: 'ND', lat: 48.1808, lng: -102.5203, risk: 'low' },
  { name: 'Fortuna', state: 'ND', lat: 48.1208, lng: -102.3603, risk: 'low' },
  { name: 'Grenora', state: 'ND', lat: 48.0608, lng: -102.2003, risk: 'low' },
  { name: 'Hanks', state: 'ND', lat: 48.0008, lng: -102.0403, risk: 'low' },
  { name: 'Homer', state: 'ND', lat: 47.9408, lng: -101.8803, risk: 'low' },
  { name: 'Independence', state: 'ND', lat: 47.8808, lng: -101.7203, risk: 'low' },
  { name: 'Jasper', state: 'ND', lat: 47.8208, lng: -101.5603, risk: 'low' },
  { name: 'Kief', state: 'ND', lat: 47.7608, lng: -101.4003, risk: 'low' },
  { name: 'Lignite', state: 'ND', lat: 47.7008, lng: -101.2403, risk: 'low' },
  { name: 'Maddock', state: 'ND', lat: 47.6408, lng: -101.0803, risk: 'low' },
  { name: 'Niobe', state: 'ND', lat: 47.5808, lng: -100.9203, risk: 'low' },
  { name: 'Oberon', state: 'ND', lat: 47.5208, lng: -100.7603, risk: 'low' },
  { name: 'Parshall', state: 'ND', lat: 47.4608, lng: -100.6003, risk: 'low' },
  { name: 'Quentin', state: 'ND', lat: 47.4008, lng: -100.4403, risk: 'low' },
  { name: 'Raleigh', state: 'ND', lat: 47.3408, lng: -100.2803, risk: 'low' },
  { name: 'Sawyer', state: 'ND', lat: 47.2808, lng: -100.1203, risk: 'low' },
  { name: 'Temple', state: 'ND', lat: 47.2208, lng: -99.9603, risk: 'low' },
  { name: 'Upham', state: 'ND', lat: 47.1608, lng: -99.8003, risk: 'low' },
  { name: 'Velva', state: 'ND', lat: 47.1008, lng: -99.6403, risk: 'low' },
  { name: 'Washburn', state: 'ND', lat: 47.0408, lng: -99.4803, risk: 'low' },
  { name: 'Xenia', state: 'ND', lat: 46.9808, lng: -99.3203, risk: 'low' },
  { name: 'Ypsilanti', state: 'ND', lat: 46.9208, lng: -99.1603, risk: 'low' },
  { name: 'Zap', state: 'ND', lat: 46.8608, lng: -99.0003, risk: 'low' }
];

// Bangladesh cities
const bangladeshCities = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { name: 'Chittagong', lat: 22.3569, lng: 91.7832 },
  { name: 'Sylhet', lat: 24.8949, lng: 91.8687 },
  { name: 'Rajshahi', lat: 24.3636, lng: 88.6241 },
  { name: 'Barisal', lat: 22.7010, lng: 90.3535 },
  { name: 'Rangpur', lat: 25.7439, lng: 89.2752 },
  { name: 'Khulna', lat: 22.8456, lng: 89.5403 },
  { name: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
  { name: 'Comilla', lat: 23.4607, lng: 91.1809 },
  { name: 'Narayanganj', lat: 23.6238, lng: 90.4990 },
  { name: 'Gazipur', lat: 23.9999, lng: 90.4203 },
  { name: 'Tongi', lat: 23.8979, lng: 90.4026 },
  { name: 'Cox\'s Bazar', lat: 21.4272, lng: 92.0058 },
  { name: 'Jessore', lat: 23.1697, lng: 89.2134 },
  { name: 'Bogra', lat: 24.8465, lng: 89.3779 }
];

// Function to generate realistic house values based on location and risk
function generateHouseValue(city: any, riskLevel: string): number {
  let baseValue = 60000; // Default base value
  
  // Adjust values by city (simplified)
  if (city.name.includes('Los Angeles') || city.name.includes('San Francisco')) {
    baseValue = faker.number.int({ min: 800000, max: 2000000 });
  } else if (city.name.includes('New York') || city.name.includes('Seattle')) {
    baseValue = faker.number.int({ min: 600000, max: 1500000 });
  } else if (city.name.includes('Denver') || city.name.includes('Portland')) {
    baseValue = faker.number.int({ min: 400000, max: 800000 });
  } else if (city.name.includes('Miami') || city.name.includes('Atlanta')) {
    baseValue = faker.number.int({ min: 300000, max: 600000 });
  } else if (city.name.includes('Chicago') || city.name.includes('Houston')) {
    baseValue = faker.number.int({ min: 250000, max: 500000 });
  } else {
    // For smaller cities and rural areas, use the default with some variation
    baseValue = faker.number.int({ min: 40000, max: 120000 });
  }
  
  // Adjust for earthquake risk (higher risk areas might have slightly lower values)
  if (riskLevel === 'high') {
    baseValue = Math.floor(baseValue * 0.95); // 5% reduction for high risk
  }
  
  return baseValue;
}

async function pushAllPersonsToNeon() {
  console.log('🚀 Pushing all persons to Neon database...');
  
  try {
    // First, let's clear existing data to ensure clean insertion
    console.log('🧹 Clearing existing person data...');
    await prisma.person.deleteMany({});
    console.log('✅ Existing data cleared');
    
    const startTime = Date.now();
    let totalInserted = 0;
    const batchSize = 1000;
    
    // Generate 20,000 US customers (50% high risk, 50% other)
    console.log('🌎 Generating 20,000 US customers...');
    const highRiskCount = 10000;
    const otherRiskCount = 10000;
    
    const highRiskCities = usCities.filter(city => city.risk === 'high');
    const otherRiskCities = usCities.filter(city => city.risk !== 'high');
    
    // Generate high-risk customers
    console.log('🌋 Generating high-risk customers...');
    for (let i = 0; i < highRiskCount; i += batchSize) {
      const batchSizeActual = Math.min(batchSize, highRiskCount - i);
      const batch = [];
      
      for (let j = 0; j < batchSizeActual; j++) {
        const city = faker.helpers.arrayElement(highRiskCities);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });
        
        const customer = {
          firstName,
          lastName,
          email,
          city: city.name,
          state: city.state,
          latitude: city.lat + (faker.number.float({ min: -0.1, max: 0.1 })),
          longitude: city.lng + (faker.number.float({ min: -0.1, max: 0.1 })),
          houseValue: generateHouseValue(city, 'high'),
          hasInsurance: faker.datatype.boolean({ probability: 0.3 }),
          createdAt: faker.date.between({ from: '2020-01-01', to: '2024-12-31' }),
          updatedAt: new Date()
        };
        
        batch.push(customer);
      }
      
      await prisma.person.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      totalInserted += batchSizeActual;
      console.log(`✅ Processed ${totalInserted}/${highRiskCount} high-risk customers`);
    }
    
    // Generate other-risk customers
    console.log('🏠 Generating other-risk customers...');
    for (let i = 0; i < otherRiskCount; i += batchSize) {
      const batchSizeActual = Math.min(batchSize, otherRiskCount - i);
      const batch = [];
      
      for (let j = 0; j < batchSizeActual; j++) {
        const city = faker.helpers.arrayElement(otherRiskCities);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });
        
        const customer = {
          firstName,
          lastName,
          email,
          city: city.name,
          state: city.state,
          latitude: city.lat + (faker.number.float({ min: -0.1, max: 0.1 })),
          longitude: city.lng + (faker.number.float({ min: -0.1, max: 0.1 })),
          houseValue: generateHouseValue(city, city.risk),
          hasInsurance: faker.datatype.boolean({ probability: 0.4 }),
          createdAt: faker.date.between({ from: '2020-01-01', to: '2024-12-31' }),
          updatedAt: new Date()
        };
        
        batch.push(customer);
      }
      
      await prisma.person.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      totalInserted += batchSizeActual;
      console.log(`✅ Processed ${totalInserted}/${otherRiskCount} other-risk customers`);
    }
    
    // Generate 2,000 Bangladesh customers
    console.log('🇧🇩 Generating 2,000 Bangladesh customers...');
    const bangladeshCount = 2000;
    
    for (let i = 0; i < bangladeshCount; i += batchSize) {
      const batchSizeActual = Math.min(batchSize, bangladeshCount - i);
      const batch = [];
      
      for (let j = 0; j < batchSizeActual; j++) {
        const city = faker.helpers.arrayElement(bangladeshCities);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });
        
        const customer = {
          firstName,
          lastName,
          email,
          city: city.name,
          state: 'Bangladesh',
          latitude: city.lat + (faker.number.float({ min: -0.1, max: 0.1 })),
          longitude: city.lng + (faker.number.float({ min: -0.1, max: 0.1 })),
          houseValue: faker.number.int({ min: 40000, max: 80000 }), // $60k range
          hasInsurance: faker.datatype.boolean({ probability: 0.3 }),
          createdAt: faker.date.between({ from: '2020-01-01', to: '2024-12-31' }),
          updatedAt: new Date()
        };
        
        batch.push(customer);
      }
      
      await prisma.person.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      totalInserted += batchSizeActual;
      console.log(`✅ Processed ${totalInserted}/${bangladeshCount} Bangladesh customers`);
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`🎉 Successfully pushed ${totalInserted} customers to Neon in ${duration.toFixed(2)} seconds!`);
    
    // Verify the data
    const finalCount = await prisma.person.count();
    console.log(`📊 Final count in Neon database: ${finalCount.toLocaleString()}`);
    
    // Get sample data to verify
    const sampleData = await prisma.person.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        state: true,
        houseValue: true,
        createdAt: true
      }
    });
    
    console.log('\n👥 Sample of newly inserted customers:');
    sampleData.forEach((person, index) => {
      console.log(`${index + 1}. ${person.firstName} ${person.lastName} (${person.email})`);
      console.log(`   Location: ${person.city}, ${person.state}`);
      console.log(`   House Value: $${person.houseValue.toLocaleString()}`);
      console.log(`   Created: ${person.createdAt.toISOString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error pushing data to Neon:', error);
    throw error;
  }
}

// Run the push
pushAllPersonsToNeon()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
