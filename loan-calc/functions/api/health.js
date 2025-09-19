/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Simple health check endpoint for monitoring and CI pipeline verification
 */

const startTime = Date.now()

export async function onRequest(context) {
  const { request, env, cf } = context

  try {
    // Only allow GET requests
    if (request.method !== 'GET') {
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
            Allow: 'GET',
          },
        }
      )
    }

    // Calculate uptime
    const uptime = Date.now() - startTime

    // Get environment info
    const environment = env.ENVIRONMENT || 'development'
    const version = env.APP_VERSION || '1.0.0'

    // Health check response
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version,
      uptime,
      environment,
      region: cf?.colo || 'unknown',
      requestId: crypto.randomUUID(),
    }

    return new Response(JSON.stringify(healthData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
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
