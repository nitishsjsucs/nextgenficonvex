import { calculateRiskLevel } from '../lib/scout-data-filters';

console.log('🧪 Testing Risk Level Calculation');
console.log('==================================');

// Test cases based on our actual data
const testCases = [
  { distance: 111, magnitude: 1.08, houseValue: 889154, expected: 'medium' },
  { distance: 111, magnitude: 1.08, houseValue: 1349725, expected: 'high' },
  { distance: 50, magnitude: 1.08, houseValue: 500000, expected: 'high' },
  { distance: 100, magnitude: 1.08, houseValue: 200000, expected: 'medium' },
  { distance: 200, magnitude: 1.08, houseValue: 100000, expected: 'low' },
  { distance: 25, magnitude: 3.5, houseValue: 300000, expected: 'high' },
  { distance: 75, magnitude: 2.5, houseValue: 150000, expected: 'medium' }
];

testCases.forEach((test, i) => {
  const result = calculateRiskLevel(test.distance, test.magnitude, test.houseValue);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} Test ${i+1}: ${test.distance}km, mag ${test.magnitude}, $${test.houseValue.toLocaleString()} -> ${result} (expected ${test.expected})`);
});

console.log('\n🎯 Now testing with actual targeting API...');
