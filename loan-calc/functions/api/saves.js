/**
 * Saved Calculations API Endpoint
 * GET /api/saves - List user's saved calculations
 * POST /api/saves - Save a new calculation
 */

import { createSupabaseClient, createApiResponse, validateCalculation } from '../../src/utils/supabase'

export async function onRequest(context) {
  const { request } = context

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Initialize Supabase client with authentication
  const { supabase, user, error: authError } = await createSupabaseClient(context)

  if (authError) {
    const statusCode = authError.code === 'AUTH_REQUIRED' ? 401 : 
                      authError.code === 'AUTH_INVALID' ? 401 :
                      authError.code === 'SUPABASE_CONFIG_ERROR' ? 500 : 400
    return createApiResponse(false, null, authError, statusCode)
  }

  try {
    // Handle GET request - List saved calculations
    if (request.method === 'GET') {
      const { data: calculations, error } = await supabase
        .from('user_calculations')
        .select(`
          id,
          name,
          calculation,
          tags,
          is_favorite,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return createApiResponse(false, null, {
          message: 'Failed to fetch calculations',
          code: 'DATABASE_ERROR',
          details: error.message,
        }, 500)
      }

      return createApiResponse(true, {
        calculations,
        count: calculations?.length || 0,
        user_id: user.id,
      })
    }

    // Handle POST request - Save new calculation
    if (request.method === 'POST') {
      const body = await request.json()

      // Validate required fields
      if (!body.name || !body.calculation) {
        return createApiResponse(false, null, {
          message: 'Missing required fields',
          code: 'VALIDATION_ERROR',
          details: {
            name: !body.name ? 'Name is required' : null,
            calculation: !body.calculation ? 'Calculation data is required' : null,
          },
        }, 400)
      }

      // Validate calculation structure
      if (!validateCalculation(body.calculation)) {
        return createApiResponse(false, null, {
          message: 'Invalid calculation data',
          code: 'VALIDATION_ERROR',
          details: 'Calculation must contain valid principal, rate, term, and payment fields',
        }, 400)
      }

      // Prepare data for insertion
      const calculationData = {
        user_id: user.id,
        name: body.name.trim(),
        calculation: body.calculation,
        tags: Array.isArray(body.tags) ? body.tags : [],
        is_favorite: Boolean(body.is_favorite),
      }

      // Insert into database
      const { data: savedCalculation, error } = await supabase
        .from('user_calculations')
        .insert([calculationData])
        .select(`
          id,
          name,
          calculation,
          tags,
          is_favorite,
          created_at,
          updated_at
        `)
        .single()

      if (error) {
        return createApiResponse(false, null, {
          message: 'Failed to save calculation',
          code: 'DATABASE_ERROR',
          details: error.message,
        }, 500)
      }

      return createApiResponse(true, savedCalculation, null, 201)
    }

    // Method not allowed
    return createApiResponse(false, null, {
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
    }, 405)

  } catch (err) {
    console.error('Saves API error:', err)
    return createApiResponse(false, null, {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, 500)
  }
}
