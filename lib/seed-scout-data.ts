// TODO: Update this script to use Convex instead of Prisma
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper functions for generating realistic data
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel',
  'Melissa', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth', 'Mark', 'Helen',
  'Donald', 'Maria', 'Steven', 'Michelle', 'Paul', 'Laura', 'Andrew', 'Lisa'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

// Major US cities with earthquake risk and high-value properties
const usLocations = [
  // California - High earthquake risk
  { city: 'Los Angeles', state: 'CA', zip: '90210', lat: 34.0522, lng: -118.2437 },
  { city: 'San Francisco', state: 'CA', zip: '94102', lat: 37.7749, lng: -122.4194 },
  { city: 'San Diego', state: 'CA', zip: '92101', lat: 32.7157, lng: -117.1611 },
  { city: 'San Jose', state: 'CA', zip: '95113', lat: 37.3382, lng: -121.8863 },
  { city: 'Oakland', state: 'CA', zip: '94612', lat: 37.8044, lng: -122.2712 },
  { city: 'Sacramento', state: 'CA', zip: '95814', lat: 38.5816, lng: -121.4944 },
  { city: 'Long Beach', state: 'CA', zip: '90802', lat: 33.7701, lng: -118.1937 },
  { city: 'Anaheim', state: 'CA', zip: '92805', lat: 33.8366, lng: -117.9143 },
  { city: 'Riverside', state: 'CA', zip: '92501', lat: 33.9533, lng: -117.3962 },
  { city: 'Stockton', state: 'CA', zip: '95202', lat: 37.9577, lng: -121.2908 },
  
  // Pacific Northwest - Moderate earthquake risk
  { city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
  { city: 'Portland', state: 'OR', zip: '97201', lat: 45.5152, lng: -122.6784 },
  { city: 'Spokane', state: 'WA', zip: '99201', lat: 47.6587, lng: -117.4260 },
  { city: 'Tacoma', state: 'WA', zip: '98402', lat: 47.2529, lng: -122.4443 },
  { city: 'Eugene', state: 'OR', zip: '97401', lat: 44.0521, lng: -123.0868 },
  { city: 'Salem', state: 'OR', zip: '97301', lat: 44.9429, lng: -123.0351 },
  
  // Alaska - High earthquake risk
  { city: 'Anchorage', state: 'AK', zip: '99501', lat: 61.2181, lng: -149.9003 },
  { city: 'Fairbanks', state: 'AK', zip: '99701', lat: 64.8378, lng: -147.7164 },
  { city: 'Juneau', state: 'AK', zip: '99801', lat: 58.3019, lng: -134.4197 },
  
  // New Madrid Seismic Zone - Moderate earthquake risk
  { city: 'Memphis', state: 'TN', zip: '38103', lat: 35.1495, lng: -90.0490 },
  { city: 'St. Louis', state: 'MO', zip: '63101', lat: 38.6270, lng: -90.1994 },
  { city: 'Little Rock', state: 'AR', zip: '72201', lat: 34.7465, lng: -92.2896 },
  { city: 'Nashville', state: 'TN', zip: '37201', lat: 36.1627, lng: -86.7816 },
  { city: 'Louisville', state: 'KY', zip: '40202', lat: 38.2527, lng: -85.7585 },
  
  // Eastern US - Lower earthquake risk but high property values
  { city: 'New York', state: 'NY', zip: '10001', lat: 40.7128, lng: -74.0060 },
  { city: 'Boston', state: 'MA', zip: '02101', lat: 42.3601, lng: -71.0589 },
  { city: 'Philadelphia', state: 'PA', zip: '19101', lat: 39.9526, lng: -75.1652 },
  { city: 'Washington', state: 'DC', zip: '20001', lat: 38.9072, lng: -77.0369 },
  { city: 'Atlanta', state: 'GA', zip: '30301', lat: 33.7490, lng: -84.3880 },
  { city: 'Miami', state: 'FL', zip: '33101', lat: 25.7617, lng: -80.1918 },
  { city: 'Tampa', state: 'FL', zip: '33602', lat: 27.9506, lng: -82.4572 },
  { city: 'Orlando', state: 'FL', zip: '32801', lat: 28.5383, lng: -81.3792 },
  { city: 'Jacksonville', state: 'FL', zip: '32202', lat: 30.3322, lng: -81.6557 },
  { city: 'Charlotte', state: 'NC', zip: '28202', lat: 35.2271, lng: -80.8431 },
  { city: 'Raleigh', state: 'NC', zip: '27601', lat: 35.7796, lng: -78.6382 },
  { city: 'Virginia Beach', state: 'VA', zip: '23451', lat: 36.8529, lng: -75.9780 },
  { city: 'Richmond', state: 'VA', zip: '23219', lat: 37.5407, lng: -77.4360 },
  
  // Central US - Mixed earthquake risk
  { city: 'Chicago', state: 'IL', zip: '60601', lat: 41.8781, lng: -87.6298 },
  { city: 'Detroit', state: 'MI', zip: '48201', lat: 42.3314, lng: -83.0458 },
  { city: 'Indianapolis', state: 'IN', zip: '46201', lat: 39.7684, lng: -86.1581 },
  { city: 'Columbus', state: 'OH', zip: '43215', lat: 39.9612, lng: -82.9988 },
  { city: 'Cleveland', state: 'OH', zip: '44113', lat: 41.4993, lng: -81.6944 },
  { city: 'Cincinnati', state: 'OH', zip: '45202', lat: 39.1031, lng: -84.5120 },
  { city: 'Milwaukee', state: 'WI', zip: '53202', lat: 43.0389, lng: -87.9065 },
  { city: 'Kansas City', state: 'MO', zip: '64108', lat: 39.0997, lng: -94.5786 },
  { city: 'Minneapolis', state: 'MN', zip: '55401', lat: 44.9778, lng: -93.2650 },
  
  // Texas - Growing earthquake activity (fracking-induced)
  { city: 'Houston', state: 'TX', zip: '77001', lat: 29.7604, lng: -95.3698 },
  { city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
  { city: 'San Antonio', state: 'TX', zip: '78205', lat: 29.4241, lng: -98.4936 },
  { city: 'Austin', state: 'TX', zip: '78701', lat: 30.2672, lng: -97.7431 },
  { city: 'Fort Worth', state: 'TX', zip: '76102', lat: 32.7555, lng: -97.3308 },
  { city: 'El Paso', state: 'TX', zip: '79901', lat: 31.7619, lng: -106.4850 },
  
  // Mountain West - Moderate earthquake risk
  { city: 'Denver', state: 'CO', zip: '80202', lat: 39.7392, lng: -104.9903 },
  { city: 'Salt Lake City', state: 'UT', zip: '84101', lat: 40.7608, lng: -111.8910 },
  { city: 'Phoenix', state: 'AZ', zip: '85001', lat: 33.4484, lng: -112.0740 },
  { city: 'Tucson', state: 'AZ', zip: '85701', lat: 32.2226, lng: -110.9747 },
  { city: 'Albuquerque', state: 'NM', zip: '87101', lat: 35.0844, lng: -106.6504 },
  { city: 'Las Vegas', state: 'NV', zip: '89101', lat: 36.1699, lng: -115.1398 },
  { city: 'Reno', state: 'NV', zip: '89501', lat: 39.5296, lng: -119.8138 },
  { city: 'Boise', state: 'ID', zip: '83702', lat: 43.6150, lng: -116.2023 },
  
  // Hawaii - Volcanic earthquake activity
  { city: 'Honolulu', state: 'HI', zip: '96813', lat: 21.3099, lng: -157.8581 },
  { city: 'Hilo', state: 'HI', zip: '96720', lat: 19.7297, lng: -155.0900 }
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generatePhone(): string {
  return `${randomInt(200, 999)}${randomInt(200, 999)}${randomInt(1000, 9999)}`;
}

function generateEmail(firstName: string, lastName: string, index?: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const separators = ['.', '_', ''];
  const separator = randomChoice(separators);
  const domain = randomChoice(domains);
  const suffix = index ? `${index}` : `${randomInt(1, 9999)}`;
  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${suffix}@${domain}`;
}

function generateHomeValue(): string {
  // Home value ranges A-S from Scout schema
  const ranges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
  // Weight towards higher values for California
  const weights = [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 15, 12, 8, 5];
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < ranges.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return ranges[i];
    }
  }
  return 'M'; // Default to $300k-$349k range
}

function generateIncome(): string {
  // Income ranges A-M from Scout schema
  const ranges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  // Weight towards middle-to-upper income for California
  const weights = [2, 3, 4, 5, 6, 8, 10, 12, 10, 8, 6, 4, 2];
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < ranges.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return ranges[i];
    }
  }
  return 'G'; // Default to $75k-$99k range
}

function generateWealth(): string {
  // Wealth ranges A-L from Scout schema
  const ranges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  // Weight towards middle wealth for most people
  const weights = [5, 8, 10, 12, 14, 16, 12, 10, 8, 6, 4, 2];
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < ranges.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return ranges[i];
    }
  }
  return 'F'; // Default to $100k-$149k range
}

function generateAgeRange(): string {
  const ranges = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // 18-24, 25-34, 35-44, 45-54, 55-64, 65-74, 75+
  const weights = [8, 15, 18, 20, 16, 12, 8]; // Weight towards middle ages
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < ranges.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return ranges[i];
    }
  }
  return 'D'; // Default to 45-54
}

function ageRangeToNumeric(range: string): number {
  const mapping: { [key: string]: number } = {
    'A': 21, 'B': 29, 'C': 39, 'D': 49, 'E': 59, 'F': 69, 'G': 79
  };
  return mapping[range] || 45;
}

function generateScoutDataRecord(location: typeof usLocations[0]): any {
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(lastNames);
  const ageRange = generateAgeRange();
  const age = ageRangeToNumeric(ageRange);
  const homeValue = generateHomeValue();
  const income = generateIncome();
  const wealth = generateWealth();
  
  // Add some coordinate variation within the city
  const latVariation = randomFloat(-0.05, 0.05);
  const lngVariation = randomFloat(-0.05, 0.05);
  
  return {
    pid: `PID${randomInt(100000, 999999)}`,
    hhid: `HH${randomInt(1000000, 9999999)}`,
    fname: firstName,
    lname: lastName,
    gender: Math.random() > 0.5 ? 'M' : 'F',
    age: age,
    dob: `${2024 - age}${String(randomInt(1, 12)).padStart(2, '0')}`,
    
    // Address
    addrid: `ADDR${randomInt(100000, 999999)}`,
    address: `${randomInt(100, 9999)} ${randomChoice(['Main', 'Oak', 'Pine', 'Cedar', 'Elm', 'Park', 'First', 'Second'])} ${randomChoice(['St', 'Ave', 'Blvd', 'Dr', 'Way'])}`,
    city: location.city,
    state: location.state,
    zip: location.zip,
    latitude: location.lat + latVariation,
    longitude: location.lng + lngVariation,
    
    // Phone
    phone: generatePhone(),
    dnc: Math.random() > 0.8 ? 'Y' : null, // 20% on do not call list
    
    // Demographics
    lor: randomInt(0, 15), // Length of residence
    homeownercd: Math.random() > 0.3 ? 'H' : 'R', // 70% homeowners in CA
    dwelltype: Math.random() > 0.2 ? 'S' : 'M', // 80% single family
    marriedcd: Math.random() > 0.4 ? 'M' : 'S', // 60% married
    veterancd: Math.random() > 0.9 ? 'Y' : null, // 10% veterans
    creditcard: Math.random() > 0.2 ? 'Y' : null, // 80% have credit cards
    
    // Financial
    mrkthomeval: homeValue,
    ehiV2: income,
    wealthscrV2: wealth,
    educationcd: randomChoice(['A', 'B', 'C', 'D', 'E', 'F']), // Education levels
    
    // Children
    child: Math.random() > 0.6 ? 'Y' : null, // 40% have children
    childnbrcd: Math.random() > 0.6 ? null : randomChoice(['B', 'C', 'D']), // Number of children
    
    // Property
    yrbld: String(randomInt(1950, 2020)), // Year built
    pool: Math.random() > 0.7 ? 'Y' : null, // 30% have pools
    fireplcd: Math.random() > 0.5 ? 'Y' : null, // 50% have fireplaces
    
    // Age ranges
    ageRangeEstimated: ageRange,
    ageRangeCombined: ageRange,
    
    // CPI Interest Indices (0-9, with some correlation to demographics)
    cpiInsuranceIndex: randomInt(3, 9), // Higher interest in insurance
    cpiHealthIndex: age > 50 ? randomInt(6, 9) : randomInt(2, 6),
    cpiHomeLivIndex: homeValue > 'K' ? randomInt(5, 9) : randomInt(2, 6),
    cpiAutoIndex: randomInt(3, 8),
    cpiFamilyIndex: Math.random() > 0.6 ? null : randomInt(4, 9),
    cpiTravelIndex: income > 'H' ? randomInt(4, 8) : randomInt(1, 5),
    cpiOutdoorsIndex: randomInt(2, 7),
    
    // Property data
    propOwnerocc: Math.random() > 0.3 ? 'Y' : null,
    propValcalc: String(randomInt(300000, 2000000)), // Actual dollar values
    propYrbld: String(randomInt(1950, 2020)),
    propLivingsqft: String(randomInt(1200, 4000)),
    propBedrms: String(randomInt(2, 5)),
    propBaths: String(randomInt(1, 4)),
    propPool: Math.random() > 0.7 ? 'Y' : null,
    propFrpl: Math.random() > 0.5 ? 'Y' : null,
    
    // Home equity & AVM
    avmEstimate: randomFloat(400000, 1800000),
    hequityEst: randomFloat(100000, 800000),
    hequityConf: randomChoice(['1', '2', '3', '4']),
    
    // InMarket scores (1-8, 1 = highest likelihood)
    imsHomebuyer: randomInt(3, 8),
    imsMtgRefi: randomInt(2, 7),
    imsMtgOverall: randomInt(3, 7),
    
    // Intent scores (0-150, 150 = highest)
    buyerScore: randomInt(20, 120),
    sellerScore: randomInt(10, 100)
  };
}

// Convert Scout data to simplified Person record for RAG
function scoutDataToPerson(scoutData: any, scoutDataId: string, index: number): any {
  // Map home value range to numeric value (midpoint of range)
  const homeValueMapping: { [key: string]: number } = {
    'A': 12500, 'B': 37500, 'C': 62500, 'D': 87500, 'E': 112500,
    'F': 137500, 'G': 162500, 'H': 187500, 'I': 212500, 'J': 237500,
    'K': 262500, 'L': 287500, 'M': 325000, 'N': 375000, 'O': 425000,
    'P': 475000, 'Q': 625000, 'R': 875000, 'S': 1000000
  };
  
  const houseValue = homeValueMapping[scoutData.mrkthomeval] || 500000;
  
  // Determine insurance status (assume homeowners more likely to have insurance)
  // But for earthquake insurance, assume many don't have it (good for targeting)
  const hasInsurance = Math.random() > 0.6; // 40% have earthquake insurance
  
  return {
    scoutDataId: scoutDataId,
    firstName: scoutData.fname,
    lastName: scoutData.lname,
    email: generateEmail(scoutData.fname, scoutData.lname, index),
    city: scoutData.city,
    state: scoutData.state,
    latitude: scoutData.latitude,
    longitude: scoutData.longitude,
    houseValue: houseValue,
    hasInsurance: hasInsurance
  };
}

export async function seedScoutData(count: number = 5000) {
  console.log(`🌱 Seeding ${count} Scout data records...`);
  console.log('⚠️ This function needs to be updated to use Convex');
  console.log('📊 TODO: Implement Convex-based Scout data seeding');
  
  // TODO: Implement Convex-based seeding
  // 1. Use convex.mutation to create persons and scout data
  // 2. Use the upsertPerson and upsertScoutData functions
  // 3. Handle the data generation and insertion logic
  
  return;
  
  try {
    // Clear existing data - DISABLED (Prisma removed)
    // await prisma.campaign.deleteMany();
    // await prisma.person.deleteMany();
    // await prisma.scoutData.deleteMany();
    
    console.log('🗑️  Cleared existing data');
    
    // Generate Scout data records
    const scoutDataRecords = [];
    const personRecords = [];
    
    for (let i = 0; i < count; i++) {
      const location = randomChoice(usLocations);
      const scoutData = generateScoutDataRecord(location);
      scoutDataRecords.push(scoutData);
      
      if (i % 100 === 0) {
        console.log(`📊 Generated ${i}/${count} records...`);
      }
    }
    
    // Insert Scout data in batches
    console.log('💾 Inserting Scout data records...');
    const batchSize = 100;
    const createdScoutData = [];
    
    for (let i = 0; i < scoutDataRecords.length; i += batchSize) {
      const batch = scoutDataRecords.slice(i, i + batchSize);
      // const created = await prisma.scoutData.createMany({
      //   data: batch,
      // });
      console.log(`📥 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(scoutDataRecords.length / batchSize)}`);
    }
    
    // Get created Scout data to link to Person records
    // const allScoutData = await prisma.scoutData.findMany({
    //   select: { id: true, fname: true, lname: true, city: true, state: true, 
    //            latitude: true, longitude: true, mrkthomeval: true }
    // });
    const allScoutData = []; // Placeholder - needs Convex implementation
    
    // Generate Person records linked to Scout data
    console.log('👥 Creating Person records...');
    for (let i = 0; i < allScoutData.length; i++) {
      const scout = allScoutData[i];
      const person = scoutDataToPerson(scout, scout.id, i + 1);
      personRecords.push(person);
    }
    
    // Insert Person records in batches
    for (let i = 0; i < personRecords.length; i += batchSize) {
      const batch = personRecords.slice(i, i + batchSize);
      // await prisma.person.createMany({
      //   data: batch,
      // });
      console.log(`👤 Inserted Person batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(personRecords.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully seeded:`);
    console.log(`   📊 ${scoutDataRecords.length} Scout data records`);
    console.log(`   👥 ${personRecords.length} Person records`);
    console.log(`   🎯 Ready for earthquake insurance RAG targeting!`);
    
    // Print some sample statistics
    // const stats = await prisma.scoutData.groupBy({
    //   by: ['city'],
    //   _count: { city: true },
    //   orderBy: { _count: { city: 'desc' } },
    //   take: 5
    // });
    const stats = []; // Placeholder - needs Convex implementation
    
    console.log('\n📈 Top 5 cities by record count:');
    stats.forEach(stat => {
      console.log(`   ${stat.city}: ${stat._count.city} records`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    // await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 5000;
  seedScoutData(count)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
