import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Get total count
    const totalCount = await prisma.person.count();
    console.log(`📊 Total customers in database: ${totalCount.toLocaleString()}`);
    
    // Get recent customers (last 100)
    const recentCustomers = await prisma.person.findMany({
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
    
    console.log('\n👥 Most recent customers:');
    recentCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.firstName} ${customer.lastName} (${customer.email})`);
      console.log(`   Location: ${customer.city}, ${customer.state}`);
      console.log(`   House Value: $${customer.houseValue.toLocaleString()}`);
      console.log(`   Created: ${customer.createdAt.toISOString()}`);
      console.log('');
    });
    
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
    
    console.log('🗺️ Top 10 States by Customer Count:');
    stateStats.forEach(stat => {
      console.log(`${stat.state}: ${stat._count.state.toLocaleString()} customers`);
    });
    
    // Check if we have both US and Bangladesh customers
    const usCustomers = await prisma.person.count({
      where: {
        state: {
          not: 'Bangladesh'
        }
      }
    });
    
    const bdCustomers = await prisma.person.count({
      where: {
        state: 'Bangladesh'
      }
    });
    
    console.log(`\n🌎 Geographic Distribution:`);
    console.log(`US Customers: ${usCustomers.toLocaleString()}`);
    console.log(`Bangladesh Customers: ${bdCustomers.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
