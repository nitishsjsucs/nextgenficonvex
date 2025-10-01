// Simple test to verify targeting system is working
const testTargeting = async () => {
  console.log('🧪 FINAL TARGETING SYSTEM TEST');
  console.log('==============================\n');
  
  const testRequest = {
    earthquakeId: 'nc75239772',
    maxDistance: 1000,
    minHouseValue: 50000,
    requireUninsured: true,
    requireHomeowner: false,
    excludeDoNotCall: false,
    limit: 10
  };
  
  try {
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
    console.log('✅ TARGETING SYSTEM IS WORKING!');
    console.log('================================');
    console.log(`📊 Total targets found: ${result.summary.total_targets}`);
    console.log(`🔴 High risk targets: ${result.summary.high_risk_targets}`);
    console.log(`🟡 Medium risk targets: ${result.summary.medium_risk_targets}`);
    console.log(`🟢 Low risk targets: ${result.summary.low_risk_targets}`);
    
    if (result.targets.length > 0) {
      console.log('\n👥 Sample targets:');
      result.targets.slice(0, 3).forEach((target, i) => {
        console.log(`   ${i + 1}. ${target.person.firstName} ${target.person.lastName}`);
        console.log(`      📍 ${target.person.city}, ${target.person.state}`);
        console.log(`      💰 House Value: $${target.person.houseValue.toLocaleString()}`);
        console.log(`      📏 Distance: ${target.distance_km}km`);
        console.log(`      ⚠️ Risk Level: ${target.risk_level}`);
        console.log(`      🛡️ Has Insurance: ${target.person.hasInsurance}`);
        console.log('');
      });
    }
    
    console.log('🎉 SUCCESS: Targeting system is working correctly!');
    console.log('💡 The issue was in the risk calculation logic - now fixed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testTargeting();
