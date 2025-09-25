import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Bangladesh-specific data
const bangladeshCities = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125, zipCodes: ['1000', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009'] },
  { name: 'Chittagong', lat: 22.3569, lng: 91.7832, zipCodes: ['4000', '4001', '4002', '4003', '4004', '4100', '4200', '4300', '4400', '4500'] },
  { name: 'Sylhet', lat: 24.8949, lng: 91.8687, zipCodes: ['3100', '3101', '3102', '3103', '3104', '3105', '3106', '3107', '3108', '3109'] },
  { name: 'Rajshahi', lat: 24.3636, lng: 88.6241, zipCodes: ['6000', '6001', '6002', '6003', '6004', '6100', '6200', '6300', '6400', '6500'] },
  { name: 'Barisal', lat: 22.7010, lng: 90.3535, zipCodes: ['8200', '8201', '8202', '8203', '8204', '8205', '8206', '8207', '8208', '8209'] },
  { name: 'Rangpur', lat: 25.7439, lng: 89.2752, zipCodes: ['5400', '5401', '5402', '5403', '5404', '5405', '5406', '5407', '5408', '5409'] },
  { name: 'Khulna', lat: 22.8456, lng: 89.5403, zipCodes: ['9000', '9001', '9002', '9003', '9004', '9100', '9200', '9300', '9400', '9500'] },
  { name: 'Mymensingh', lat: 24.7471, lng: 90.4203, zipCodes: ['2200', '2201', '2202', '2203', '2204', '2205', '2206', '2207', '2208', '2209'] },
  { name: 'Comilla', lat: 23.4607, lng: 91.1809, zipCodes: ['3500', '3501', '3502', '3503', '3504', '3505', '3506', '3507', '3508', '3509'] },
  { name: 'Narayanganj', lat: 23.6238, lng: 90.4990, zipCodes: ['1400', '1401', '1402', '1403', '1404', '1405', '1406', '1407', '1408', '1409'] },
  { name: 'Gazipur', lat: 23.9999, lng: 90.4203, zipCodes: ['1700', '1701', '1702', '1703', '1704', '1705', '1706', '1707', '1708', '1709'] },
  { name: 'Tongi', lat: 23.8979, lng: 90.4026, zipCodes: ['1710', '1711', '1712', '1713', '1714', '1715', '1716', '1717', '1718', '1719'] },
  { name: 'Cox\'s Bazar', lat: 21.4272, lng: 92.0058, zipCodes: ['4700', '4701', '4702', '4703', '4704', '4705', '4706', '4707', '4708', '4709'] },
  { name: 'Jessore', lat: 23.1697, lng: 89.2134, zipCodes: ['7400', '7401', '7402', '7403', '7404', '7405', '7406', '7407', '7408', '7409'] },
  { name: 'Bogra', lat: 24.8465, lng: 89.3779, zipCodes: ['5800', '5801', '5802', '5803', '5804', '5805', '5806', '5807', '5808', '5809'] }
];

const bangladeshiFirstNames = [
  // Male names
  'Abdul', 'Ahmed', 'Ali', 'Aminul', 'Anwar', 'Ashraf', 'Aziz', 'Babul', 'Delwar', 'Farid',
  'Hafiz', 'Hasan', 'Ibrahim', 'Jalal', 'Kamal', 'Mahbub', 'Mahmud', 'Matin', 'Mizanur', 'Moktar',
  'Mostafa', 'Nazrul', 'Omar', 'Rafiq', 'Rahman', 'Rashid', 'Ruhul', 'Salam', 'Shamsul', 'Siraj',
  'Zakir', 'Ziaur', 'Mohammad', 'Md', 'Shah', 'Golam', 'Abu', 'Nurul', 'Abdur', 'Khandaker',
  // Female names
  'Fatima', 'Rashida', 'Salma', 'Nasreen', 'Rahima', 'Sultana', 'Ruma', 'Shahida', 'Farida', 'Hasina',
  'Jahanara', 'Kamrun', 'Laila', 'Mahmuda', 'Nasir', 'Parvin', 'Rasheda', 'Sabina', 'Tahmina', 'Yasmin',
  'Rehana', 'Rokeya', 'Shahnaz', 'Shireen', 'Syeda', 'Nazma', 'Bilkis', 'Amena', 'Marium', 'Hosneara'
];

const bangladeshiLastNames = [
  'Rahman', 'Ahmed', 'Ali', 'Khan', 'Hasan', 'Islam', 'Uddin', 'Alam', 'Hossain', 'Sheikh',
  'Miah', 'Begum', 'Khatun', 'Bibi', 'Chowdhury', 'Sarkar', 'Das', 'Roy', 'Saha', 'Dey',
  'Barua', 'Chakma', 'Marma', 'Tripura', 'Garo', 'Santal', 'Oraon', 'Munda', 'Bhattacharya', 'Majumdar',
  'Ghosh', 'Bose', 'Sen', 'Gupta', 'Nath', 'Paul', 'Rozario', 'Gomes', 'Pereira', 'Correia'
];

const bangladeshiStreetTypes = ['Road', 'Lane', 'Avenue', 'Street', 'Para', 'Goli', 'Bazar'];
const bangladeshiAreaNames = [
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Wari', 'Old Dhaka',
  'Ramna', 'Tejgaon', 'Panthapath', 'Farmgate', 'Karwan Bazar', 'Motijheel', 'Paltan',
  'Elephant Road', 'Green Road', 'New Market', 'Azimpur', 'Lalbagh', 'Sadarghat', 'Kotwali',
  'Agrabad', 'Panchlaish', 'Halishahar', 'Khulshi', 'Nasirabad', 'Double Mooring', 'Chawk Bazar',
  'GEC Circle', 'Tiger Pass', 'Oxygen', 'Bahaddarhat', 'Chandgaon', 'Bayazid', 'Sholoshahar'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com'];
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const randomNum = Math.floor(Math.random() * 999) + 1;
  
  const patterns = [
    `${cleanFirst}.${cleanLast}@${getRandomElement(domains)}`,
    `${cleanFirst}${cleanLast}@${getRandomElement(domains)}`,
    `${cleanFirst}${randomNum}@${getRandomElement(domains)}`,
    `${cleanFirst}.${cleanLast}${randomNum}@${getRandomElement(domains)}`
  ];
  
  return getRandomElement(patterns);
}

function generateBangladeshiAddress(city: any): string {
  const houseNumber = getRandomNumber(1, 999);
  const streetName = `${getRandomElement(bangladeshiAreaNames)} ${getRandomElement(bangladeshiStreetTypes)}`;
  const zipCode = getRandomElement(city.zipCodes);
  
  return `${houseNumber}, ${streetName}, ${city.name} ${zipCode}`;
}

function generatePhoneNumber(): string {
  // Bangladesh mobile numbers start with +880 1
  const prefixes = ['017', '018', '019', '015', '016', '013', '014'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8 digit number
  return `+880${prefix}${number}`;
}

// Generate realistic house values for Bangladesh (in USD)
function generateHouseValue(): number {
  const valueRanges = [
    { min: 40000, max: 80000, weight: 40 },      // Around $60k default range
    { min: 25000, max: 50000, weight: 20 },      // Lower-middle class
    { min: 50000, max: 100000, weight: 20 },     // Middle class
    { min: 100000, max: 200000, weight: 12 },    // Upper-middle class
    { min: 200000, max: 500000, weight: 6 },     // Upper class
    { min: 500000, max: 1000000, weight: 2 }     // Wealthy
  ];
  
  const totalWeight = valueRanges.reduce((sum, range) => sum + range.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const range of valueRanges) {
    random -= range.weight;
    if (random <= 0) {
      return getRandomNumber(range.min, range.max);
    }
  }
  
  return getRandomNumber(40000, 80000); // fallback to $60k range
}

async function generateBangladeshCustomers(count: number) {
  console.log(`🇧🇩 Generating ${count} Bangladesh customers...`);
  
  const customers = [];
  const emails = new Set(); // To ensure unique emails
  
  for (let i = 0; i < count; i++) {
    const city = getRandomElement(bangladeshCities);
    const firstName = getRandomElement(bangladeshiFirstNames);
    const lastName = getRandomElement(bangladeshiLastNames);
    
    let email = generateEmail(firstName, lastName);
    let attempts = 0;
    
    // Ensure unique email
    while (emails.has(email) && attempts < 10) {
      email = generateEmail(firstName, lastName);
      attempts++;
    }
    
    if (emails.has(email)) {
      email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@gmail.com`;
    }
    
    emails.add(email);
    
    // Add some random variation to coordinates (within ~5km radius)
    const latVariation = (Math.random() - 0.5) * 0.09; // ~5km variation
    const lngVariation = (Math.random() - 0.5) * 0.09;
    
    const customer = {
      firstName,
      lastName,
      email,
      city: city.name,
      state: 'Bangladesh',
      latitude: city.lat + latVariation,
      longitude: city.lng + lngVariation,
      houseValue: generateHouseValue(),
      hasInsurance: Math.random() < 0.3 // 30% have insurance
    };
    
    customers.push(customer);
    
    if ((i + 1) % 100 === 0) {
      console.log(`Generated ${i + 1}/${count} customers...`);
    }
  }
  
  console.log('💾 Inserting customers into database...');
  
  // Insert in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize);
    
    await prisma.person.createMany({
      data: batch,
      skipDuplicates: true
    });
    
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(customers.length / batchSize)}`);
  }
  
  console.log('✅ Successfully generated Bangladesh customers!');
  
  // Generate statistics
  const stats = {
    totalCustomers: customers.length,
    citiesDistribution: {} as Record<string, number>,
    insuranceStats: {
      insured: customers.filter(c => c.hasInsurance).length,
      uninsured: customers.filter(c => !c.hasInsurance).length
    },
    valueRanges: {
      under50k: customers.filter(c => c.houseValue < 50000).length,
      '50k-100k': customers.filter(c => c.houseValue >= 50000 && c.houseValue < 100000).length,
      '100k-200k': customers.filter(c => c.houseValue >= 100000 && c.houseValue < 200000).length,
      '200k-500k': customers.filter(c => c.houseValue >= 200000 && c.houseValue < 500000).length,
      '500k+': customers.filter(c => c.houseValue >= 500000).length
    }
  };
  
  // Calculate city distribution
  for (const customer of customers) {
    stats.citiesDistribution[customer.city] = (stats.citiesDistribution[customer.city] || 0) + 1;
  }
  
  console.log('\n📊 Customer Statistics:');
  console.log(`Total Customers: ${stats.totalCustomers}`);
  console.log(`Insured: ${stats.insuranceStats.insured} (${(stats.insuranceStats.insured / stats.totalCustomers * 100).toFixed(1)}%)`);
  console.log(`Uninsured: ${stats.insuranceStats.uninsured} (${(stats.insuranceStats.uninsured / stats.totalCustomers * 100).toFixed(1)}%)`);
  
  console.log('\n🏙️ City Distribution:');
  Object.entries(stats.citiesDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([city, count]) => {
      console.log(`${city}: ${count} (${(count / stats.totalCustomers * 100).toFixed(1)}%)`);
    });
  
  console.log('\n💰 House Value Distribution:');
  console.log(`Under $50k: ${stats.valueRanges.under50k}`);
  console.log(`$50k-$100k: ${stats.valueRanges['50k-100k']}`);
  console.log(`$100k-$200k: ${stats.valueRanges['100k-200k']}`);
  console.log(`$200k-$500k: ${stats.valueRanges['200k-500k']}`);
  console.log(`$500k+: ${stats.valueRanges['500k+']}`);
}

async function main() {
  try {
    // Check if customers already exist
    const existingCount = await prisma.person.count({
      where: { state: 'Bangladesh' }
    });
    
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing Bangladesh customers.`);
      console.log('Do you want to add more customers or clear existing ones?');
      console.log('This script will add 2000 new customers...');
    }
    
    await generateBangladeshCustomers(2000);
    
  } catch (error) {
    console.error('❌ Error generating customers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Customer generation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Customer generation failed:', error);
      process.exit(1);
    });
}

export { main as generateBangladeshCustomers };
