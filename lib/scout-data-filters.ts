import { prisma } from '@/lib/prisma';

// Types for RAG system
export interface RAGTarget {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  houseValue: number;
  hasInsurance: boolean;
  
  // Enriched from Scout data
  age?: number;
  income?: string;
  wealth?: string;
  homeOwner: boolean;
  lengthOfResidence?: number;
  educationLevel?: string;
  maritalStatus?: string;
  hasChildren?: boolean;
  veteranStatus?: boolean;
  
  // Property details
  propertyValue?: number;
  propertyAge?: number;
  livingSquareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasPool?: boolean;
  hasFireplace?: boolean;
  
  // Risk indicators
  insuranceInterestLevel?: number; // CPI Insurance Index 0-9
  healthInterestLevel?: number;
  homeInterestLevel?: number;
  
  // Financial indicators
  creditCardUser?: boolean;
  charityDonor?: boolean;
  estimatedNetWorth?: string;
  
  // Contact preferences
  doNotCall?: boolean;
}

// Home value range to numeric conversion
const HOME_VALUE_RANGES: { [key: string]: number } = {
  'A': 12500,   // $1,000 - $24,999
  'B': 37500,   // $25,000 - $49,999
  'C': 62500,   // $50,000 - $74,999
  'D': 87500,   // $75,000 - $99,999
  'E': 112500,  // $100,000 - $124,999
  'F': 137500,  // $125,000 - $149,999
  'G': 162500,  // $150,000 - $174,999
  'H': 187500,  // $175,000 - $199,999
  'I': 212500,  // $200,000 - $224,999
  'J': 237500,  // $225,000 - $249,999
  'K': 262500,  // $250,000 - $274,999
  'L': 287500,  // $275,000 - $299,999
  'M': 325000,  // $300,000 - $349,999
  'N': 375000,  // $350,000 - $399,999
  'O': 425000,  // $400,000 - $449,999
  'P': 475000,  // $450,000 - $499,999
  'Q': 625000,  // $500,000 - $749,999
  'R': 875000,  // $750,000 - $999,999
  'S': 1000000  // $1,000,000+
};

// Income range descriptions
const INCOME_RANGES: { [key: string]: string } = {
  'A': 'Less than $20,000',
  'B': '$20,000-$29,999',
  'C': '$30,000-$39,999',
  'D': '$40,000-$49,999',
  'E': '$50,000-$59,999',
  'F': '$60,000-$74,999',
  'G': '$75,000-$99,999',
  'H': '$100,000-$124,999',
  'I': '$125,000-$149,999',
  'J': '$150,000-$199,999',
  'K': '$200,000-$249,999',
  'L': '$250,000-$499,999',
  'M': '$500,000+'
};

// Wealth score descriptions
const WEALTH_RANGES: { [key: string]: string } = {
  'A': '$0 or less',
  'B': '$1 - $24,999',
  'C': '$25,000 - $49,999',
  'D': '$50,000 - $74,999',
  'E': '$75,000 - $99,999',
  'F': '$100,000 - $149,999',
  'G': '$150,000 - $249,999',
  'H': '$250,000 - $374,999',
  'I': '$375,000 - $499,999',
  'J': '$500,000 - $749,999',
  'K': '$750,000 - $999,999',
  'L': '$1,000,000+'
};

// Education level descriptions
const EDUCATION_LEVELS: { [key: string]: string } = {
  'A': 'Completed High School',
  'B': 'Completed College',
  'C': 'Completed Graduate School',
  'D': 'Attended Vocational/Technical',
  'E': 'Some High School',
  'F': 'Some College'
};

/**
 * Convert Scout data to RAG target format
 */
function convertScoutDataToRAGTarget(person: any, scoutData: any): RAGTarget {
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
    phone: scoutData?.phone || undefined,
    city: person.city,
    state: person.state,
    latitude: person.latitude,
    longitude: person.longitude,
    houseValue: person.houseValue,
    hasInsurance: person.hasInsurance,
    
    // Enriched from Scout data
    age: scoutData?.age || undefined,
    income: scoutData?.ehiV2 || undefined,
    wealth: scoutData?.wealthscrV2 || undefined,
    homeOwner: scoutData?.homeownercd === 'H',
    lengthOfResidence: scoutData?.lor || undefined,
    educationLevel: scoutData?.educationcd || undefined,
    maritalStatus: scoutData?.marriedcd === 'M' ? 'Married' : scoutData?.marriedcd === 'S' ? 'Single' : undefined,
    hasChildren: scoutData?.child === 'Y',
    veteranStatus: scoutData?.veterancd === 'Y',
    
    // Property details
    propertyValue: scoutData?.propValcalc ? parseInt(scoutData.propValcalc) : undefined,
    propertyAge: scoutData?.propYrbld ? new Date().getFullYear() - parseInt(scoutData.propYrbld) : undefined,
    livingSquareFeet: scoutData?.propLivingsqft ? parseInt(scoutData.propLivingsqft) : undefined,
    bedrooms: scoutData?.propBedrms ? parseInt(scoutData.propBedrms) : undefined,
    bathrooms: scoutData?.propBaths ? parseFloat(scoutData.propBaths) : undefined,
    hasPool: scoutData?.propPool === 'Y',
    hasFireplace: scoutData?.propFrpl === 'Y',
    
    // Risk indicators
    insuranceInterestLevel: scoutData?.cpiInsuranceIndex || undefined,
    healthInterestLevel: scoutData?.cpiHealthIndex || undefined,
    homeInterestLevel: scoutData?.cpiHomeLivIndex || undefined,
    
    // Financial indicators
    creditCardUser: scoutData?.creditcard === 'Y',
    charityDonor: scoutData?.charitydnr === 'Y',
    estimatedNetWorth: scoutData?.wealthscrV2 || undefined,
    
    // Contact preferences
    doNotCall: scoutData?.dnc === 'Y'
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
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

/**
 * Find targets for earthquake insurance campaigns
 */
export async function findEarthquakeInsuranceTargets(
  earthquakeLat: number,
  earthquakeLng: number,
  criteria: {
    maxDistance?: number;      // km from earthquake
    minMagnitude?: number;     // minimum earthquake magnitude
    minHouseValue?: number;    // minimum house value
    maxHouseValue?: number;    // maximum house value
    requireUninsured?: boolean; // only target uninsured
    requireHomeowner?: boolean; // only target homeowners
    excludeDoNotCall?: boolean; // exclude DNC list
    minAge?: number;           // minimum age
    maxAge?: number;           // maximum age
    hasChildren?: boolean;     // has children
    limit?: number;            // max results
  } = {}
): Promise<RAGTarget[]> {
  
  const {
    maxDistance = 100,
    minHouseValue = 200000,
    maxHouseValue = 2000000,
    requireUninsured = true,
    requireHomeowner = true,
    excludeDoNotCall = true,
    limit = 100
  } = criteria;

  // Build where conditions
  const whereConditions: any = {
    latitude: {
      gte: earthquakeLat - (maxDistance / 111), // Rough conversion: 1 degree ≈ 111km
      lte: earthquakeLat + (maxDistance / 111)
    },
    longitude: {
      gte: earthquakeLng - (maxDistance / 111),
      lte: earthquakeLng + (maxDistance / 111)
    },
    houseValue: {
      gte: minHouseValue,
      lte: maxHouseValue
    }
  };

  if (requireUninsured) {
    whereConditions.hasInsurance = false;
  }

  // Query with Scout data joined
  const results = await prisma.person.findMany({
    where: whereConditions,
    include: {
      scoutData: true
    },
    take: limit * 2 // Get more than needed for filtering
  });

  // Convert and apply additional filters
  const targets: RAGTarget[] = [];
  
  for (const person of results) {
    const scoutData = person.scoutData;
    
    // Apply Scout-data specific filters
    if (requireHomeowner && scoutData?.homeownercd !== 'H') continue;
    if (excludeDoNotCall && scoutData?.dnc === 'Y') continue;
    if (criteria.minAge && (!scoutData?.age || scoutData.age < criteria.minAge)) continue;
    if (criteria.maxAge && (!scoutData?.age || scoutData.age > criteria.maxAge)) continue;
    if (criteria.hasChildren !== undefined && (scoutData?.child === 'Y') !== criteria.hasChildren) continue;
    
    // Calculate actual distance
    const distance = calculateDistance(
      earthquakeLat, earthquakeLng,
      person.latitude, person.longitude
    );
    
    if (distance <= maxDistance) {
      const target = convertScoutDataToRAGTarget(person, scoutData);
      targets.push(target);
    }
    
    if (targets.length >= limit) break;
  }

  // Sort by distance and house value (prioritize closer, higher value homes)
  return targets.sort((a, b) => {
    const distanceA = calculateDistance(earthquakeLat, earthquakeLng, a.latitude, a.longitude);
    const distanceB = calculateDistance(earthquakeLat, earthquakeLng, b.latitude, b.longitude);
    
    // Primary sort: distance (closer first)
    if (Math.abs(distanceA - distanceB) > 5) {
      return distanceA - distanceB;
    }
    
    // Secondary sort: house value (higher first)
    return b.houseValue - a.houseValue;
  });
}

/**
 * Get earthquake statistics for dashboard
 */
export async function getEarthquakeStats() {
  const earthquakeCount = await prisma.earthquake.count();
  const recentEarthquakes = await prisma.earthquake.count({
    where: {
      time: {
        gte: Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  });

  return {
    total_earthquakes: earthquakeCount,
    recent_earthquakes_7_days: recentEarthquakes
  };
}

/**
 * Get demographic statistics for dashboard
 */
export async function getDemographicStats() {
  const totalPeople = await prisma.person.count();
  
  const highValueHomes = await prisma.person.count({
    where: {
      houseValue: {
        gte: 500000
      }
    }
  });
  
  const uninsuredHomes = await prisma.person.count({
    where: {
      hasInsurance: false
    }
  });
  
  const uninsuredPercentage = totalPeople > 0 ? 
    ((uninsuredHomes / totalPeople) * 100).toFixed(1) : '0.0';

  return {
    high_value_homes: highValueHomes,
    uninsured_homes: uninsuredHomes,
    uninsured_percentage: uninsuredPercentage
  };
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats() {
  const totalCampaigns = await prisma.campaign.count();
  
  const campaignsByRisk = await prisma.campaign.groupBy({
    by: ['riskLevel'],
    _count: {
      riskLevel: true
    }
  });
  
  const riskCounts = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  campaignsByRisk.forEach(group => {
    if (group.riskLevel in riskCounts) {
      riskCounts[group.riskLevel as keyof typeof riskCounts] = group._count.riskLevel;
    }
  });

  return {
    total_campaigns: totalCampaigns,
    ...riskCounts
  };
}

/**
 * Determine risk level based on distance and other factors
 */
export function calculateRiskLevel(
  distance: number, 
  magnitude: number, 
  houseValue: number
): 'high' | 'medium' | 'low' {
  // High risk: Close distance OR high magnitude OR high value
  if (distance <= 50 && (magnitude >= 3.0 || houseValue >= 500000)) {
    return 'high';
  }
  
  // Medium risk: Medium distance OR medium factors
  if (distance <= 100 && (magnitude >= 2.0 || houseValue >= 200000)) {
    return 'medium';
  }
  
  // Low risk: Far distance and lower factors
  return 'low';
}

/**
 * Format target data for email generation
 */
export function formatTargetForEmail(target: RAGTarget, earthquake: any, distance: number) {
  return {
    person: {
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      city: target.city,
      state: target.state,
      houseValue: target.houseValue,
      hasInsurance: target.hasInsurance
    },
    earthquake: {
      id: earthquake.id,
      time: earthquake.time,
      latitude: earthquake.latitude,
      longitude: earthquake.longitude,
      mag: earthquake.magnitude,
      place: earthquake.place,
      depth_km: earthquake.depth,
      url: earthquake.url
    },
    distance_km: Math.round(distance * 10) / 10, // Round to 1 decimal
    risk_level: calculateRiskLevel(distance, earthquake.magnitude || 0, target.houseValue)
  };
}

// Export utility functions and constants
export {
  HOME_VALUE_RANGES,
  INCOME_RANGES,
  WEALTH_RANGES,
  EDUCATION_LEVELS,
  convertScoutDataToRAGTarget
};

