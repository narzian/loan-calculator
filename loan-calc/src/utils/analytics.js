/**
 * Anonymous Analytics Tracking
 * Tracks calculation usage patterns without storing personal data
 */

// Analytics API endpoint (will be created)
const ANALYTICS_ENDPOINT = '/api/analytics'

/**
 * Track a loan calculation anonymously
 * @param {object} calculation - Calculation result
 * @param {object} input - Original input values
 */
export const trackCalculation = async (calculation, input) => {
  try {
    const analyticsData = {
      // Calculation insights
      principal: Math.round(calculation.principal),
      interestRate: Number(calculation.annualRate),
      termYears: Number(calculation.years),
      monthlyPayment: Math.round(calculation.monthlyPayment),
      totalInterest: Math.round(calculation.totalInterest),
      
      // Usage insights
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      
      // Browser/device insights (anonymous)
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      
      // No personal data - just usage patterns
    }

    // Send to analytics endpoint (fire and forget)
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData)
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics tracking failed (non-critical)')
    })
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.debug('Analytics error (non-critical):', error)
  }
}

/**
 * Get or create a session ID (not user specific, just for session tracking)
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('calc_session_id')
  
  if (!sessionId) {
    // Generate a random session ID (not linked to user)
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('calc_session_id', sessionId)
  }
  
  return sessionId
}

/**
 * Track export usage (CSV/PDF downloads)
 * @param {string} exportType - 'csv' or 'pdf'
 * @param {number} scheduleLength - Number of payments in schedule
 */
export const trackExport = async (exportType, scheduleLength) => {
  try {
    const exportData = {
      type: 'export',
      exportType,
      scheduleLength,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    }

    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData)
    }).catch(() => {
      console.debug('Export tracking failed (non-critical)')
    })
  } catch (error) {
    console.debug('Export tracking error (non-critical):', error)
  }
}

/**
 * Track page views and engagement
 */
export const trackPageView = async () => {
  try {
    const pageData = {
      type: 'pageview',
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      referrer: document.referrer || 'direct',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageData)
    }).catch(() => {
      console.debug('Page tracking failed (non-critical)')
    })
  } catch (error) {
    console.debug('Page tracking error (non-critical):', error)
  }
}