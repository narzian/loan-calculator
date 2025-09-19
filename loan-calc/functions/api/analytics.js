/**
 * Anonymous Analytics API Endpoint
 * POST /api/analytics
 * 
 * Stores anonymous usage data for insights
 * No personal information is stored
 */

export async function onRequest(context) {
  const { request, env } = context

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Allow': 'POST, OPTIONS',
        },
      }
    )
  }

  try {
    const analyticsData = await request.json()
    
    // Basic validation
    if (!analyticsData || typeof analyticsData !== 'object') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Invalid analytics data',
            code: 'INVALID_DATA',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Add server-side timestamp and environment info
    const enrichedData = {
      ...analyticsData,
      serverTimestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT || 'development',
      version: env.APP_VERSION || '1.0.0',
    }

    // TODO: Store in database or analytics service
    // For now, just log to console (visible in Cloudflare dashboard)
    console.log('📊 Analytics:', JSON.stringify(enrichedData, null, 2))

    // In production, you might want to:
    // 1. Store in Supabase analytics table
    // 2. Send to Google Analytics
    // 3. Store in CloudFlare Analytics
    // 4. Send to specialized analytics service

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics data received',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Analytics API error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}