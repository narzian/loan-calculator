/**
 * Supabase client utility for Cloudflare Functions
 * Handles authentication and RLS by forwarding user tokens
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client configured for server-side use
 * @param {object} context - Cloudflare Function context
 * @returns {object} - { supabase, user, error }
 */
export const createSupabaseClient = async (context) => {
  const { request, env } = context

  // Check for required environment variables
  const supabaseUrl = env.SUPABASE_URL
  const supabaseAnonKey = env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      supabase: null,
      user: null,
      error: {
        message: 'Supabase configuration missing',
        code: 'SUPABASE_CONFIG_ERROR',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
        },
      },
    }
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Extract bearer token from Authorization header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      supabase,
      user: null,
      error: {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      },
    }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Set the session with the provided token
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        supabase,
        user: null,
        error: {
          message: 'Invalid or expired token',
          code: 'AUTH_INVALID',
          details: error?.message,
        },
      }
    }

    // Set the auth context for subsequent requests
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // Not needed for server-side
    })

    return {
      supabase,
      user,
      error: null,
    }
  } catch (err) {
    return {
      supabase,
      user: null,
      error: {
        message: 'Authentication error',
        code: 'AUTH_ERROR',
        details: err.message,
      },
    }
  }
}

/**
 * Create API response with consistent error handling
 * @param {boolean} success
 * @param {any} data
 * @param {object} error
 * @param {number} status
 * @returns {Response}
 */
export const createApiResponse = (success, data = null, error = null, status = 200) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
  }

  if (success && data !== null) {
    response.data = data
  } else if (!success && error) {
    response.error = error
  }

  const statusCode = success ? status : (status === 200 ? 400 : status)

  return new Response(JSON.stringify(response, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

/**
 * Validate calculation data structure
 * @param {object} calculation - Calculation object to validate
 * @returns {boolean}
 */
export const validateCalculation = (calculation) => {
  const required = ['principal', 'annualRate', 'years', 'monthlyPayment', 'totalPayment', 'totalInterest']
  
  if (!calculation || typeof calculation !== 'object') {
    return false
  }

  return required.every(field => {
    const value = calculation[field]
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  })
}
