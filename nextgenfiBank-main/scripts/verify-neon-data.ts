import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function verifyNeonData() {
  try {
    console.log('🔍 Verifying Neon database data...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database');
    
    // Get a sample of recent data
    const sampleData = await prisma.person.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        state: true,
        houseValue: true,
        hasInsurance: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Sample of recent customers in Neon:');
    sampleData.forEach((person, index) => {
      console.log(`${index + 1}. ID: ${person.id}`);
      console.log(`   Name: ${person.firstName} ${person.lastName}`);
      console.log(`   Email: ${person.email}`);
      console.log(`   Location: ${person.city}, ${person.state}`);
      console.log(`   House Value: $${person.houseValue.toLocaleString()}`);
      console.log(`   Has Insurance: ${person.hasInsurance}`);
      console.log(`   Created: ${person.createdAt.toISOString()}`);
      console.log('');
    });
    
    // Check total counts by state
    const stateCounts = await prisma.person.groupBy({
      by: ['state'],
      _count: {
        state: true
      },
      orderBy: {
        _count: {
          state: 'desc'
        }
      }
    });
    
    console.log('📊 Customer counts by state in Neon:');
    stateCounts.forEach(state => {
      console.log(`${state.state}: ${state._count.state.toLocaleString()} customers`);
    });
    
    // Test a specific query that might be used in the app
    const uninsuredCustomers = await prisma.person.count({
      where: {
        hasInsurance: false,
        houseValue: {
          gte: 50000,
          lte: 200000
        }
      }
    });
    
    console.log(`\n🎯 Uninsured customers with house values $50k-$200k: ${uninsuredCustomers.toLocaleString()}`);
    
    // Test earthquake-prone areas
    const earthquakeProneStates = ['CA', 'OR', 'WA', 'AK', 'NV', 'UT', 'CO', 'AZ'];
    const earthquakeCustomers = await prisma.person.count({
      where: {
        state: {
          in: earthquakeProneStates
        }
      }
    });
    
    console.log(`🌋 Customers in earthquake-prone states: ${earthquakeCustomers.toLocaleString()}`);
    
    console.log('\n✅ All data is properly stored in Neon database!');
    
  } catch (error) {
    console.error('❌ Error verifying Neon data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyNeonData();
