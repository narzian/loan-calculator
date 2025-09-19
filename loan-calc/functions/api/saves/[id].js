/**
 * Individual Saved Calculation API Endpoint
 * GET /api/saves/:id - Get specific saved calculation
 * PUT /api/saves/:id - Update specific saved calculation
 * DELETE /api/saves/:id - Delete specific saved calculation
 */

import { createSupabaseClient, createApiResponse, validateCalculation } from '../../../src/utils/supabase'

export async function onRequest(context) {
  const { request, params } = context
  const calculationId = params.id

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Validate calculation ID
  if (!calculationId || typeof calculationId !== 'string') {
    return createApiResponse(false, null, {
      message: 'Invalid calculation ID',
      code: 'VALIDATION_ERROR',
    }, 400)
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
    // Handle GET request - Get specific calculation
    if (request.method === 'GET') {
      const { data: calculation, error } = await supabase
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
        .eq('id', calculationId)
        .single()

      if (error || !calculation) {
        return createApiResponse(false, null, {
          message: 'Calculation not found',
          code: 'NOT_FOUND',
        }, 404)
      }

      return createApiResponse(true, calculation)
    }

    // Handle PUT request - Update calculation
    if (request.method === 'PUT') {
      const body = await request.json()

      // Build update object with only provided fields
      const updateData = {}
      
      if (body.name !== undefined) {
        if (!body.name || typeof body.name !== 'string') {
          return createApiResponse(false, null, {
            message: 'Invalid name field',
            code: 'VALIDATION_ERROR',
          }, 400)
        }
        updateData.name = body.name.trim()
      }

      if (body.calculation !== undefined) {
        if (!validateCalculation(body.calculation)) {
          return createApiResponse(false, null, {
            message: 'Invalid calculation data',
            code: 'VALIDATION_ERROR',
            details: 'Calculation must contain valid principal, rate, term, and payment fields',
          }, 400)
        }
        updateData.calculation = body.calculation
      }

      if (body.tags !== undefined) {
        updateData.tags = Array.isArray(body.tags) ? body.tags : []
      }

      if (body.is_favorite !== undefined) {
        updateData.is_favorite = Boolean(body.is_favorite)
      }

      // If no valid fields to update
      if (Object.keys(updateData).length === 0) {
        return createApiResponse(false, null, {
          message: 'No valid fields to update',
          code: 'VALIDATION_ERROR',
        }, 400)
      }

      // Add updated timestamp
      updateData.updated_at = new Date().toISOString()

      // Update the calculation
      const { data: updatedCalculation, error } = await supabase
        .from('user_calculations')
        .update(updateData)
        .eq('id', calculationId)
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

      if (error || !updatedCalculation) {
        return createApiResponse(false, null, {
          message: 'Failed to update calculation or calculation not found',
          code: error?.message?.includes('No rows') ? 'NOT_FOUND' : 'DATABASE_ERROR',
          details: error?.message,
        }, error?.message?.includes('No rows') ? 404 : 500)
      }

      return createApiResponse(true, updatedCalculation)
    }

    // Handle DELETE request - Delete calculation
    if (request.method === 'DELETE') {
      const { error } = await supabase
        .from('user_calculations')
        .delete()
        .eq('id', calculationId)

      if (error) {
        return createApiResponse(false, null, {
          message: 'Failed to delete calculation',
          code: 'DATABASE_ERROR',
          details: error.message,
        }, 500)
      }

      return createApiResponse(true, {
        message: 'Calculation deleted successfully',
        deleted_id: calculationId,
      })
    }

    // Method not allowed
    return createApiResponse(false, null, {
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
    }, 405)

  } catch (err) {
    console.error('Saves ID API error:', err)
    return createApiResponse(false, null, {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, 500)
  }
}
