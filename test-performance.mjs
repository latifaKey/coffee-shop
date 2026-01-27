// Test API performance after optimization
// Run: node test-performance.mjs

const API_BASE = 'http://localhost:3000/api';

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  const start = Date.now();
  
  try {
    const response = await fetch(url);
    const elapsed = Date.now() - start;
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`⏱️  Time: ${elapsed}ms`);
    console.log(`📦 Data count: ${data.data?.length || data.length || 0} items`);
    
    return { name, elapsed, success: true };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { name, elapsed: 0, success: false };
  }
}

async function runTests() {
  console.log('🚀 Performance Test Suite');
  console.log('=' .repeat(50));
  
  const results = [];
  
  // Test products
  results.push(await testEndpoint('Products', `${API_BASE}/products?limit=50`));
  
  // Test news
  results.push(await testEndpoint('News', `${API_BASE}/news?limit=50`));
  
  // Test classes
  results.push(await testEndpoint('Classes', `${API_BASE}/classes`));
  
  // Test categories
  results.push(await testEndpoint('Categories', `${API_BASE}/categories`));
  
  // Test team
  results.push(await testEndpoint('Team', `${API_BASE}/team`));
  
  // Test schedules
  results.push(await testEndpoint('Schedules', `${API_BASE}/schedules?limit=50`));
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Performance Summary:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const avgTime = successful.reduce((sum, r) => sum + r.elapsed, 0) / successful.length;
  
  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  console.log(`⏱️  Average response time: ${Math.round(avgTime)}ms`);
  
  if (avgTime < 500) {
    console.log('\n🎉 EXCELLENT! Response time < 500ms');
  } else if (avgTime < 1000) {
    console.log('\n👍 GOOD! Response time < 1s');
  } else {
    console.log('\n⚠️  Needs improvement. Response time > 1s');
  }
}

runTests().catch(console.error);
