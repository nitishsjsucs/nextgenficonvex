#!/usr/bin/env node

/**
 * Comprehensive People Generation Script for Earthquake Insurance RAG System
 * 
 * This script generates realistic people data with demographics for the RAG targeting system.
 * It creates both Person records and Scout Data enrichment records in Convex.
 * 
 * Usage:
 *   npm run generate-people [count]
 *   node scripts/generate-people.js [count]
 * 
 * Examples:
 *   npm run generate-people 1000    # Generate 1000 people
 *   npm run generate-people 5000    # Generate 5000 people (default)
 *   npm run generate-people 10000   # Generate 10000 people
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper functions for generating realistic data
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel',
  'Melissa', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth', 'Mark', 'Helen',
  'Donald', 'Maria', 'Steven', 'Michelle', 'Paul', 'Laura', 'Andrew', 'Lisa',
  'Joshua', 'Kimberly', 'Kenneth', 'Deborah', 'Kevin', 'Dorothy', 'Brian',
  'Lisa', 'George', 'Nancy', 'Edward', 'Karen', 'Ronald', 'Betty', 'Timothy',
  'Helen', 'Jason', 'Sandra', 'Jeffrey', 'Donna', 'Ryan', 'Carol', 'Jacob',
  'Ruth', 'Gary', 'Sharon', 'Nicholas', 'Michelle', 'Eric', 'Laura', 'Jonathan',
  'Sarah', 'Stephen', 'Kimberly', 'Larry', 'Deborah', 'Justin', 'Dorothy',
  'Scott', 'Lisa', 'Brandon', 'Nancy', 'Benjamin', 'Karen', 'Samuel', 'Betty',
  'Gregory', 'Helen', 'Alexander', 'Sandra', 'Patrick', 'Donna', 'Jack',
  'Carol', 'Dennis', 'Ruth', 'Jerry', 'Sharon', 'Tyler', 'Michelle', 'Aaron',
  'Laura', 'Jose', 'Sarah', 'Henry', 'Kimberly', 'Adam', 'Deborah', 'Douglas',
  'Dorothy', 'Nathan', 'Lisa', 'Zachary', 'Nancy', 'Kyle', 'Karen', 'Walter',
  'Betty', 'Harold', 'Helen', 'Carl', 'Sandra', 'Jeremy', 'Donna', 'Arthur',
  'Carol', 'Gerald', 'Ruth', 'Keith', 'Sharon', 'Roger', 'Michelle', 'Lawrence',
  'Laura', 'Sean', 'Sarah', 'Christian', 'Kimberly', 'Ethan', 'Deborah', 'Austin',
  'Dorothy', 'Joe', 'Lisa', 'Albert', 'Nancy', 'Jesse', 'Karen', 'Willie', 'Betty'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner',
  'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox',
  'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett',
  'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders',
  'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins',
  'Perry', 'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes',
  'Gonzales', 'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan', 'Patterson',
  'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin', 'Wallace', 'Moreno',
  'West', 'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Tran',
  'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro', 'Marshall', 'Owens'
];

// Major US cities with earthquake risk and high-value properties
const usLocations = [
  // California - High earthquake risk (more people here)
  { city: 'Los Angeles', state: 'CA', zip: '90210', lat: 34.0522, lng: -118.2437, weight: 15 },
  { city: 'San Francisco', state: 'CA', zip: '94102', lat: 37.7749, lng: -122.4194, weight: 12 },
  { city: 'San Diego', state: 'CA', zip: '92101', lat: 32.7157, lng: -117.1611, weight: 10 },
  { city: 'San Jose', state: 'CA', zip: '95113', lat: 37.3382, lng: -121.8863, weight: 8 },
  { city: 'Oakland', state: 'CA', zip: '94612', lat: 37.8044, lng: -122.2712, weight: 6 },
  { city: 'Sacramento', state: 'CA', zip: '95814', lat: 38.5816, lng: -121.4944, weight: 5 },
  { city: 'Long Beach', state: 'CA', zip: '90802', lat: 33.7701, lng: -118.1937, weight: 4 },
  { city: 'Anaheim', state: 'CA', zip: '92805', lat: 33.8366, lng: -117.9143, weight: 4 },
  { city: 'Riverside', state: 'CA', zip: '92501', lat: 33.9533, lng: -117.3962, weight: 3 },
  { city: 'Stockton', state: 'CA', zip: '95202', lat: 37.9577, lng: -121.2908, weight: 3 },
  { city: 'Fresno', state: 'CA', zip: '93721', lat: 36.7378, lng: -119.7871, weight: 3 },
  { city: 'Bakersfield', state: 'CA', zip: '93301', lat: 35.3733, lng: -119.0187, weight: 2 },
  { city: 'Santa Ana', state: 'CA', zip: '92701', lat: 33.7455, lng: -117.8677, weight: 2 },
  { city: 'Irvine', state: 'CA', zip: '92618', lat: 33.6846, lng: -117.8265, weight: 2 },
  { city: 'Fremont', state: 'CA', zip: '94536', lat: 37.5483, lng: -121.9886, weight: 2 },
  
  // Pacific Northwest - Moderate earthquake risk
  { city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321, weight: 8 },
  { city: 'Portland', state: 'OR', zip: '97201', lat: 45.5152, lng: -122.6784, weight: 6 },
  { city: 'Spokane', state: 'WA', zip: '99201', lat: 47.6587, lng: -117.4260, weight: 2 },
  { city: 'Tacoma', state: 'WA', zip: '98402', lat: 47.2529, lng: -122.4443, weight: 2 },
  { city: 'Eugene', state: 'OR', zip: '97401', lat: 44.0521, lng: -123.0868, weight: 2 },
  { city: 'Salem', state: 'OR', zip: '97301', lat: 44.9429, lng: -123.0351, weight: 2 },
  
  // Alaska - High earthquake risk
  { city: 'Anchorage', state: 'AK', zip: '99501', lat: 61.2181, lng: -149.9003, weight: 3 },
  { city: 'Fairbanks', state: 'AK', zip: '99701', lat: 64.8378, lng: -147.7164, weight: 1 },
  { city: 'Juneau', state: 'AK', zip: '99801', lat: 58.3019, lng: -134.4197, weight: 1 },
  
  // New Madrid Seismic Zone - Moderate earthquake risk
  { city: 'Memphis', state: 'TN', zip: '38103', lat: 35.1495, lng: -90.0490, weight: 4 },
  { city: 'St. Louis', state: 'MO', zip: '63101', lat: 38.6270, lng: -90.1994, weight: 3 },
  { city: 'Little Rock', state: 'AR', zip: '72201', lat: 34.7465, lng: -92.2896, weight: 2 },
  { city: 'Nashville', state: 'TN', zip: '37201', lat: 36.1627, lng: -86.7816, weight: 2 },
  { city: 'Louisville', state: 'KY', zip: '40202', lat: 38.2527, lng: -85.7585, weight: 2 },
  
  // Eastern US - Lower earthquake risk but high property values
  { city: 'New York', state: 'NY', zip: '10001', lat: 40.7128, lng: -74.0060, weight: 6 },
  { city: 'Boston', state: 'MA', zip: '02101', lat: 42.3601, lng: -71.0589, weight: 4 },
  { city: 'Philadelphia', state: 'PA', zip: '19101', lat: 39.9526, lng: -75.1652, weight: 3 },
  { city: 'Washington', state: 'DC', zip: '20001', lat: 38.9072, lng: -77.0369, weight: 3 },
  { city: 'Atlanta', state: 'GA', zip: '30301', lat: 33.7490, lng: -84.3880, weight: 3 },
  { city: 'Miami', state: 'FL', zip: '33101', lat: 25.7617, lng: -80.1918, weight: 3 },
  { city: 'Tampa', state: 'FL', zip: '33602', lat: 27.9506, lng: -82.4572, weight: 2 },
  { city: 'Orlando', state: 'FL', zip: '32801', lat: 28.5383, lng: -81.3792, weight: 2 },
  { city: 'Jacksonville', state: 'FL', zip: '32202', lat: 30.3322, lng: -81.6557, weight: 2 },
  { city: 'Charlotte', state: 'NC', zip: '28202', lat: 35.2271, lng: -80.8431, weight: 2 },
  { city: 'Raleigh', state: 'NC', zip: '27601', lat: 35.7796, lng: -78.6382, weight: 2 },
  { city: 'Virginia Beach', state: 'VA', zip: '23451', lat: 36.8529, lng: -75.9780, weight: 2 },
  { city: 'Richmond', state: 'VA', zip: '23219', lat: 37.5407, lng: -77.4360, weight: 2 },
  
  // Central US - Mixed earthquake risk
  { city: 'Chicago', state: 'IL', zip: '60601', lat: 41.8781, lng: -87.6298, weight: 4 },
  { city: 'Detroit', state: 'MI', zip: '48201', lat: 42.3314, lng: -83.0458, weight: 3 },
  { city: 'Indianapolis', state: 'IN', zip: '46201', lat: 39.7684, lng: -86.1581, weight: 2 },
  { city: 'Columbus', state: 'OH', zip: '43215', lat: 39.9612, lng: -82.9988, weight: 2 },
  { city: 'Cleveland', state: 'OH', zip: '44113', lat: 41.4993, lng: -81.6944, weight: 2 },
  { city: 'Cincinnati', state: 'OH', zip: '45202', lat: 39.1031, lng: -84.5120, weight: 2 },
  { city: 'Milwaukee', state: 'WI', zip: '53202', lat: 43.0389, lng: -87.9065, weight: 2 },
  { city: 'Kansas City', state: 'MO', zip: '64108', lat: 39.0997, lng: -94.5786, weight: 2 },
  { city: 'Minneapolis', state: 'MN', zip: '55401', lat: 44.9778, lng: -93.2650, weight: 2 },
  
  // Texas - Growing earthquake activity (fracking-induced)
  { city: 'Houston', state: 'TX', zip: '77001', lat: 29.7604, lng: -95.3698, weight: 4 },
  { city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970, weight: 4 },
  { city: 'San Antonio', state: 'TX', zip: '78205', lat: 29.4241, lng: -98.4936, weight: 3 },
  { city: 'Austin', state: 'TX', zip: '78701', lat: 30.2672, lng: -97.7431, weight: 3 },
  { city: 'Fort Worth', state: 'TX', zip: '76102', lat: 32.7555, lng: -97.3308, weight: 2 },
  { city: 'El Paso', state: 'TX', zip: '79901', lat: 31.7619, lng: -106.4850, weight: 2 },
  
  // Mountain West - Moderate earthquake risk
  { city: 'Denver', state: 'CO', zip: '80202', lat: 39.7392, lng: -104.9903, weight: 3 },
  { city: 'Salt Lake City', state: 'UT', zip: '84101', lat: 40.7608, lng: -111.8910, weight: 2 },
  { city: 'Phoenix', state: 'AZ', zip: '85001', lat: 33.4484, lng: -112.0740, weight: 3 },
  { city: 'Tucson', state: 'AZ', zip: '85701', lat: 32.2226, lng: -110.9747, weight: 2 },
  { city: 'Albuquerque', state: 'NM', zip: '87101', lat: 35.0844, lng: -106.6504, weight: 2 },
  { city: 'Las Vegas', state: 'NV', zip: '89101', lat: 36.1699, lng: -115.1398, weight: 2 },
  { city: 'Reno', state: 'NV', zip: '89501', lat: 39.5296, lng: -119.8138, weight: 1 },
  { city: 'Boise', state: 'ID', zip: '83702', lat: 43.6150, lng: -116.2023, weight: 1 },
  
  // Hawaii - Volcanic earthquake activity
  { city: 'Honolulu', state: 'HI', zip: '96813', lat: 21.3099, lng: -157.8581, weight: 2 },
  { city: 'Hilo', state: 'HI', zip: '96720', lat: 19.7297, lng: -155.0900, weight: 1 }
];

// Utility functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandomChoice<T extends { weight: number }>(array: T[]): T {
  const totalWeight = array.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of array) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return array[array.length - 1]; // Fallback
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
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
  const separators = ['.', '_', ''];
  const separator = randomChoice(separators);
  const domain = randomChoice(domains);
  const suffix = index ? `${index}` : `${randomInt(1, 9999)}`;
  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${suffix}@${domain}`;
}

function generateHomeValue(): number {
  // Generate realistic home values based on location and demographics
  const baseValue = randomInt(200000, 800000);
  const variation = randomFloat(0.7, 1.3);
  return Math.round(baseValue * variation);
}

function generateAge(): number {
  // Weight towards middle ages (25-65) for homeowners
  const ageGroups = [
    { min: 25, max: 34, weight: 20 },
    { min: 35, max: 44, weight: 25 },
    { min: 45, max: 54, weight: 25 },
    { min: 55, max: 64, weight: 20 },
    { min: 65, max: 75, weight: 10 }
  ];
  
  const totalWeight = ageGroups.reduce((sum, group) => sum + group.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const group of ageGroups) {
    random -= group.weight;
    if (random <= 0) {
      return randomInt(group.min, group.max);
    }
  }
  
  return randomInt(35, 55); // Fallback
}

function generateIncome(): string {
  // Income ranges A-M from Scout schema
  const ranges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  // Weight towards middle-to-upper income for homeowners
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

function generateEducation(): string {
  const ranges = ['A', 'B', 'C', 'D', 'E', 'F']; // Education levels
  const weights = [15, 25, 20, 10, 20, 10]; // Weight towards college education
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < ranges.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return ranges[i];
    }
  }
  return 'B'; // Default to college
}

function generatePersonRecord(location: typeof usLocations[0], index: number): {
  person: any;
  scoutData: any;
} {
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(lastNames);
  const age = generateAge();
  const houseValue = generateHomeValue();
  const income = generateIncome();
  const wealth = generateWealth();
  const education = generateEducation();
  
  // Add some coordinate variation within the city
  const latVariation = randomFloat(-0.05, 0.05);
  const lngVariation = randomFloat(-0.05, 0.05);
  
  // Determine insurance status (assume homeowners more likely to have insurance)
  // But for earthquake insurance, assume many don't have it (good for targeting)
  const hasInsurance = Math.random() > 0.6; // 40% have earthquake insurance
  
  const person = {
    firstName,
    lastName,
    email: generateEmail(firstName, lastName, index),
    phone: generatePhone(),
    city: location.city,
    state: location.state,
    latitude: location.lat + latVariation,
    longitude: location.lng + lngVariation,
    houseValue,
    hasInsurance,
  };
  
  const scoutData = {
    age,
    ehiV2: income,
    wealthscrV2: wealth,
    homeownercd: Math.random() > 0.3 ? 'H' : 'R', // 70% homeowners
    lor: randomInt(0, 15), // Length of residence
    educationcd: education,
    marriedcd: Math.random() > 0.4 ? 'M' : 'S', // 60% married
    child: Math.random() > 0.6 ? 'Y' : null, // 40% have children
    veterancd: Math.random() > 0.9 ? 'Y' : null, // 10% veterans
    propValcalc: String(houseValue),
    propYrbld: String(randomInt(1950, 2020)),
    propLivingsqft: String(randomInt(1200, 4000)),
    propBedrms: String(randomInt(2, 5)),
    propBaths: String(randomInt(1, 4)),
    propPool: Math.random() > 0.7 ? 'Y' : null, // 30% have pools
    propFrpl: Math.random() > 0.5 ? 'Y' : null, // 50% have fireplaces
    cpiInsuranceIndex: randomInt(3, 9), // Higher interest in insurance
    cpiHealthIndex: age > 50 ? randomInt(6, 9) : randomInt(2, 6),
    cpiHomeLivIndex: houseValue > 500000 ? randomInt(5, 9) : randomInt(2, 6),
    creditcard: Math.random() > 0.2 ? 'Y' : null, // 80% have credit cards
    charitydnr: Math.random() > 0.7 ? 'Y' : null, // 30% charity donors
    dnc: Math.random() > 0.8 ? 'Y' : null, // 20% on do not call list
  };
  
  return { person, scoutData };
}

async function generatePeople(count: number = 5000): Promise<void> {
  console.log(`🌱 Generating ${count} people with demographics...`);
  console.log(`📍 Using ${usLocations.length} US locations with earthquake risk`);
  
  const batchSize = 50; // Process in smaller batches to avoid timeouts
  let processed = 0;
  let errors = 0;
  
  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const batch = [];
    
    // Generate batch of people
    for (let j = 0; j < currentBatchSize; j++) {
      const location = weightedRandomChoice(usLocations);
      const { person, scoutData } = generatePersonRecord(location, i + j);
      batch.push({ person, scoutData });
    }
    
    // Insert batch into Convex
    try {
      for (const { person, scoutData } of batch) {
        try {
          // Create person first
          const personId = await convex.mutation(api.scoutData.upsertPerson, person);
          
          // Then create scout data
          await convex.mutation(api.scoutData.upsertScoutData, {
            personId,
            ...scoutData,
          });
          
          processed++;
        } catch (error) {
          console.error(`❌ Error creating person ${i + j}:`, error);
          errors++;
        }
      }
      
      // Progress update
      const progress = Math.round(((i + currentBatchSize) / count) * 100);
      console.log(`📊 Progress: ${i + currentBatchSize}/${count} (${progress}%) - Processed: ${processed}, Errors: ${errors}`);
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Batch error:`, error);
      errors += currentBatchSize;
    }
  }
  
  console.log(`\n✅ Generation complete!`);
  console.log(`📊 Total processed: ${processed}`);
  console.log(`❌ Total errors: ${errors}`);
  console.log(`🎯 Ready for earthquake insurance RAG targeting!`);
  
  // Print some sample statistics
  console.log(`\n📈 Sample locations used:`);
  const locationCounts: { [key: string]: number } = {};
  for (let i = 0; i < Math.min(100, count); i++) {
    const location = weightedRandomChoice(usLocations);
    locationCounts[location.city] = (locationCounts[location.city] || 0) + 1;
  }
  
  Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([city, count]) => {
      console.log(`   ${city}: ${count} people`);
    });
}

// Main execution
async function main() {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 5000;
  
  if (isNaN(count) || count <= 0) {
    console.error('❌ Invalid count. Please provide a positive number.');
    console.log('Usage: npm run generate-people [count]');
    console.log('Example: npm run generate-people 1000');
    process.exit(1);
  }
  
  if (count > 50000) {
    console.error('❌ Count too large. Maximum 50,000 people per run.');
    process.exit(1);
  }
  
  try {
    await generatePeople(count);
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generatePeople };
