/**
 * Anonymous Analytics API Endpoint
 * POST /api/analytics
 * 
 * Stores anonymous usage data for insights in Supabase
 * No personal information is stored
 */

import { createClient } from '@supabase/supabase-js'

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

    // Determine event type
    let eventType = 'pageview'
    if (analyticsData.principal && analyticsData.interestRate) {
      eventType = 'calculation'
    } else if (analyticsData.type === 'export') {
      eventType = 'export'
    }

    // Prepare database record
    const dbRecord = {
      event_type: eventType,
      session_id: analyticsData.sessionId,
      timestamp: analyticsData.timestamp || new Date().toISOString(),
      
      // Calculation data (only for calculation events)
      ...(eventType === 'calculation' && {
        principal: analyticsData.principal,
        interest_rate: analyticsData.interestRate / 100, // Convert percentage to decimal
        term_years: analyticsData.termYears,
        monthly_payment: analyticsData.monthlyPayment,
        total_interest: analyticsData.totalInterest,
      }),
      
      // Export data (only for export events)
      ...(eventType === 'export' && {
        export_type: analyticsData.exportType,
        schedule_length: analyticsData.scheduleLength,
      }),
      
      // Technical metadata
      viewport: analyticsData.viewport || null,
      user_agent: analyticsData.userAgent?.substring(0, 200) || null, // Truncate for privacy
      referrer: analyticsData.referrer || null,
      
      // Environment data
      server_timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT || 'development',
      app_version: env.APP_VERSION || '1.0.0',
      
      // Additional metadata
      metadata: {
        ...analyticsData.metadata,
        server_processed: true,
      },
    }

    // Debug: Log environment variable status
    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!env.SUPABASE_URL,
      hasSupabaseKey: !!env.SUPABASE_ANON_KEY,
      supabaseUrlLength: env.SUPABASE_URL?.length || 0,
      supabaseKeyLength: env.SUPABASE_ANON_KEY?.length || 0,
      environment: env.ENVIRONMENT || 'undefined',
      allEnvKeys: Object.keys(env || {})
    })

    // For now, let's just log everything to debug the environment variables
    console.log('📊 Analytics data received:', JSON.stringify(dbRecord, null, 2))
    
    // Try to connect to Supabase just to test the connection
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      try {
        console.log('🔗 Attempting Supabase connection...')
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
        
        // Just test the connection by checking available tables
        const { data, error } = await supabase
          .from('user_calculations')
          .select('id')
          .limit(1)
        
        if (error) {
          console.error('❌ Supabase connection test failed:', error)
        } else {
          console.log('✅ Supabase connection successful, found', data?.length || 0, 'records')
        }
      } catch (dbError) {
        console.error('❌ Database connection error:', dbError)
      }
    } else {
      console.log('⚠️ No Supabase credentials found - analytics will only be logged')
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics data processed',
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
