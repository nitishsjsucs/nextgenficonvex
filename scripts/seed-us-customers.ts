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
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, risk: 'medium' },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, risk: 'medium' },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, risk: 'medium' },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, risk: 'medium' },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, risk: 'medium' },
  { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, risk: 'medium' },
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, risk: 'medium' },
  { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557, risk: 'medium' },
  { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308, risk: 'medium' },
  { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, risk: 'medium' },
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, risk: 'medium' },
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, risk: 'medium' },
  { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, risk: 'medium' },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, risk: 'medium' },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, risk: 'medium' },
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
  { name: 'Williston', state: 'ND', lat: 48.1470, lng: -103.6180, risk: 'low' },
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

// Function to generate a random US phone number
function generateUSPhoneNumber(): string {
  const areaCode = faker.number.int({ min: 200, max: 999 });
  const exchange = faker.number.int({ min: 200, max: 999 });
  const number = faker.number.int({ min: 1000, max: 9999 });
  return `+1${areaCode}${exchange}${number}`;
}

// Function to generate a random US zip code
function generateUSZipCode(): string {
  return faker.location.zipCode('#####');
}

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

async function seedUSCustomers(count: number) {
  console.log(`🌎 Generating ${count} US customers...`);
  
  const startTime = Date.now();
  let processed = 0;
  const batchSize = 1000;
  
  // Calculate distribution: 50% in earthquake-prone zones (high risk), 50% in other areas
  const highRiskCount = Math.floor(count * 0.5);
  const otherRiskCount = count - highRiskCount;
  
  console.log(`📊 Distribution: ${highRiskCount} in high-risk areas, ${otherRiskCount} in other areas`);
  
  // Filter cities by risk level
  const highRiskCities = usCities.filter(city => city.risk === 'high');
  const otherRiskCities = usCities.filter(city => city.risk !== 'high');
  
  console.log(`🏙️ High-risk cities: ${highRiskCities.length}, Other cities: ${otherRiskCities.length}`);
  
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
        hasInsurance: faker.datatype.boolean({ probability: 0.3 }), // 30% have insurance
        createdAt: faker.date.between({ from: '2020-01-01', to: '2024-12-31' }),
        updatedAt: new Date()
      };
      
      batch.push(customer);
    }
    
    await prisma.person.createMany({
      data: batch,
      skipDuplicates: true
    });
    
    processed += batchSizeActual;
    console.log(`✅ Processed ${processed}/${highRiskCount} high-risk customers`);
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
        hasInsurance: faker.datatype.boolean({ probability: 0.4 }), // 40% have insurance
        createdAt: faker.date.between({ from: '2020-01-01', to: '2024-12-31' }),
        updatedAt: new Date()
      };
      
      batch.push(customer);
    }
    
    await prisma.person.createMany({
      data: batch,
      skipDuplicates: true
    });
    
    processed += batchSizeActual;
    console.log(`✅ Processed ${processed}/${otherRiskCount} other-risk customers`);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`🎉 Successfully generated ${count} US customers in ${duration.toFixed(2)} seconds!`);
  
  // Get final statistics
  const totalCustomers = await prisma.person.count();
  
  const insuredCustomers = await prisma.person.count({
    where: { hasInsurance: true }
  });
  
  console.log('\n📊 Final Statistics:');
  console.log(`Total customers: ${totalCustomers.toLocaleString()}`);
  console.log(`Insured customers: ${insuredCustomers.toLocaleString()} (${(insuredCustomers/totalCustomers*100).toFixed(1)}%)`);
  
  // Get state distribution
  const stateStats = await prisma.person.groupBy({
    by: ['state'],
    _count: {
      state: true
    },
    orderBy: {
      _count: {
        state: 'desc'
      }
    },
    take: 10
  });
  
  console.log('\n🗺️ Top 10 States by Customer Count:');
  stateStats.forEach(stat => {
    console.log(`${stat.state}: ${stat._count.state.toLocaleString()} customers`);
  });
  
  // Get city distribution
  const cityStats = await prisma.person.groupBy({
    by: ['city', 'state'],
    _count: {
      city: true
    },
    orderBy: {
      _count: {
        city: 'desc'
      }
    },
    take: 10
  });
  
  console.log('\n🏙️ Top 10 Cities by Customer Count:');
  cityStats.forEach(stat => {
    console.log(`${stat.city}, ${stat.state}: ${stat._count.city.toLocaleString()} customers`);
  });
  
  // Get house value distribution
  const houseValueStats = await prisma.person.aggregate({
    _avg: {
      houseValue: true
    },
    _min: {
      houseValue: true
    },
    _max: {
      houseValue: true
    }
  });
  
  console.log('\n🏠 House Value Statistics:');
  console.log(`Average: $${houseValueStats._avg.houseValue?.toLocaleString()}`);
  console.log(`Minimum: $${houseValueStats._min.houseValue?.toLocaleString()}`);
  console.log(`Maximum: $${houseValueStats._max.houseValue?.toLocaleString()}`);
}

// Run the seeding
seedUSCustomers(20000)
  .catch((e) => {
    console.error('❌ Error seeding US customers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
