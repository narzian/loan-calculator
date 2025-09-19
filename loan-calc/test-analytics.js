/**
 * Analytics Testing Script
 * Run this in browser console to test analytics collection
 */

// Test calculation event
async function testCalculationAnalytics() {
  const testData = {
    principal: 5000000,
    interestRate: 8.5,
    termYears: 20,
    monthlyPayment: 43391,
    totalInterest: 5413840,
    sessionId: 'test_session_' + Date.now(),
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    userAgent: navigator.userAgent.substring(0, 100)
  }

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('✅ Calculation analytics test:', result)
    return result.success
  } catch (error) {
    console.error('❌ Calculation analytics test failed:', error)
    return false
  }
}

// Test page view event
async function testPageViewAnalytics() {
  const testData = {
    type: 'pageview',
    sessionId: 'test_session_' + Date.now(),
    timestamp: new Date().toISOString(),
    referrer: document.referrer || 'direct',
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('✅ Page view analytics test:', result)
    return result.success
  } catch (error) {
    console.error('❌ Page view analytics test failed:', error)
    return false
  }
}

// Test export event
async function testExportAnalytics() {
  const testData = {
    type: 'export',
    exportType: 'pdf',
    scheduleLength: 240,
    sessionId: 'test_session_' + Date.now(),
    timestamp: new Date().toISOString()
  }

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('✅ Export analytics test:', result)
    return result.success
  } catch (error) {
    console.error('❌ Export analytics test failed:', error)
    return false
  }
}

// Run all tests
async function runAnalyticsTests() {
  console.log('🧪 Running analytics tests...')
  
  const tests = [
    { name: 'Calculation Analytics', test: testCalculationAnalytics },
    { name: 'Page View Analytics', test: testPageViewAnalytics },
    { name: 'Export Analytics', test: testExportAnalytics }
  ]

  const results = []
  
  for (const { name, test } of tests) {
    console.log(`\n🔄 Testing ${name}...`)
    const success = await test()
    results.push({ name, success })
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between tests
  }

  console.log('\n📊 Analytics Test Results:')
  console.table(results)

  const allPassed = results.every(r => r.success)
  if (allPassed) {
    console.log('🎉 All analytics tests passed!')
    console.log('📈 Check your Supabase analytics_events table to see the data.')
  } else {
    console.log('⚠️ Some tests failed. Check console errors above.')
  }

  return results
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🚀 Analytics Test Suite Loaded!')
  console.log('Run: runAnalyticsTests() to test all analytics')
  console.log('Or run individual tests:')
  console.log('- testCalculationAnalytics()')
  console.log('- testPageViewAnalytics()')
  console.log('- testExportAnalytics()')
}

// Export for Node.js if needed
if (typeof module !== 'undefined') {
  module.exports = {
    testCalculationAnalytics,
    testPageViewAnalytics,
    testExportAnalytics,
    runAnalyticsTests
  }
}