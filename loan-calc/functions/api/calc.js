/**
 * Loan Calculation API Endpoint
 * POST /api/calc
 *
 * Validates input, performs server-side loan calculation, and returns results.
 */

import {
  CalculateLoanRequestSchema,
  CalculateLoanResponseSchema,
  parseLoanInput,
  createApiResponse,
} from '../../src/shared/schemas'

import {
  calculateLoanPayment,
  generateAmortizationSchedule,
} from '../../src/utils/loanCalculations'

// Basic in-memory rate limiter (edge-safe approximation)
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // max 60 requests per minute per IP
const requestLog = new Map()

const isRateLimited = ip => {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const entries = requestLog.get(ip) || []
  const recent = entries.filter(ts => ts > windowStart)
  recent.push(now)
  requestLog.set(ip, recent)
  return recent.length > RATE_LIMIT_MAX_REQUESTS
}

export async function onRequest(context) {
  const { request } = context

  // CORS preflight
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

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify(
        createApiResponse(false, null, {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
        })
      ),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          Allow: 'POST, OPTIONS',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify(
        createApiResponse(false, null, {
          message: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
        })
      ),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }

  try {
    const body = await request.json()

    // Validate request body using Zod
    const parseReq = CalculateLoanRequestSchema.safeParse(body)
    if (!parseReq.success) {
      return new Response(
        JSON.stringify(
          createApiResponse(false, null, {
            message: 'Invalid request body',
            code: 'BAD_REQUEST',
            details: parseReq.error.flatten().fieldErrors,
          })
        ),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Parse and validate input values
    const parsedInput = parseLoanInput(parseReq.data.input)
    if (!parsedInput.success) {
      return new Response(JSON.stringify(createApiResponse(false, null, parsedInput.error)), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const { amount, rate, term } = parsedInput.data
    const { includeAmortization = false, currency = 'USD' } = parseReq.data.options || {}

    // Perform calculation
    const calculation = calculateLoanPayment(amount, rate, term)
    const responseData = {
      calculation: { ...calculation, timestamp: new Date().toISOString(), currency },
    }

    if (includeAmortization) {
      responseData.amortization = generateAmortizationSchedule(amount, rate, term)
    }

    // Validate response shape (defensive)
    const validateRes = CalculateLoanResponseSchema.safeParse({ success: true, data: responseData })
    if (!validateRes.success) {
      console.error('Response validation failed', validateRes.error)
    }

    return new Response(JSON.stringify(createApiResponse(true, responseData)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Calculation error:', error)
    return new Response(
      JSON.stringify(
        createApiResponse(false, null, {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        })
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
}
