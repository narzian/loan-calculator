import { z } from 'zod'
import { LOAN_LIMITS } from '../constants'

/**
 * Shared validation schemas for client and server
 * Using Zod for type-safe validation that works in both environments
 */

// Base loan input validation schema
export const LoanInputSchema = z.object({
  amount: z
    .string()
    .min(1, 'Loan amount is required')
    .refine(val => !isNaN(parseFloat(val)), 'Amount must be a valid number')
    .refine(
      val => parseFloat(val) >= LOAN_LIMITS.MIN_AMOUNT,
      `Amount must be at least $${LOAN_LIMITS.MIN_AMOUNT}`
    )
    .refine(
      val => parseFloat(val) <= LOAN_LIMITS.MAX_AMOUNT,
      `Amount cannot exceed $${LOAN_LIMITS.MAX_AMOUNT.toLocaleString()}`
    ),

  rate: z
    .string()
    .min(1, 'Interest rate is required')
    .refine(val => !isNaN(parseFloat(val)), 'Rate must be a valid number')
    .refine(
      val => parseFloat(val) >= LOAN_LIMITS.MIN_RATE,
      `Rate must be ${LOAN_LIMITS.MIN_RATE} or higher`
    )
    .refine(
      val => parseFloat(val) <= LOAN_LIMITS.MAX_RATE,
      `Rate seems unusually high (>${LOAN_LIMITS.MAX_RATE}%)`
    ),

  term: z
    .string()
    .min(1, 'Loan term is required')
    .refine(val => !isNaN(parseFloat(val)), 'Term must be a valid number')
    .refine(
      val => parseFloat(val) >= LOAN_LIMITS.MIN_TERM,
      `Term must be at least ${LOAN_LIMITS.MIN_TERM} years`
    )
    .refine(
      val => parseFloat(val) <= LOAN_LIMITS.MAX_TERM,
      `Term cannot exceed ${LOAN_LIMITS.MAX_TERM} years`
    ),
})

// Numeric version for calculation (after parsing strings)
export const LoanCalculationSchema = z.object({
  amount: z.number().min(LOAN_LIMITS.MIN_AMOUNT).max(LOAN_LIMITS.MAX_AMOUNT),
  rate: z.number().min(LOAN_LIMITS.MIN_RATE).max(LOAN_LIMITS.MAX_RATE),
  term: z.number().min(LOAN_LIMITS.MIN_TERM).max(LOAN_LIMITS.MAX_TERM),
})

// API request schema
export const CalculateLoanRequestSchema = z.object({
  input: LoanInputSchema,
  options: z
    .object({
      currency: z.string().default('USD'),
      includeAmortization: z.boolean().default(false),
    })
    .optional(),
})

// API response schemas
export const LoanResultSchema = z.object({
  principal: z.number(),
  annualRate: z.number(),
  years: z.number(),
  monthlyRate: z.number(),
  numberOfPayments: z.number(),
  monthlyPayment: z.number(),
  totalPayment: z.number(),
  totalInterest: z.number(),
  timestamp: z.string(),
  currency: z.string().default('USD'),
})

export const AmortizationPaymentSchema = z.object({
  payment: z.number(),
  monthlyPayment: z.number(),
  interestPayment: z.number(),
  principalPayment: z.number(),
  remainingBalance: z.number(),
})

export const CalculateLoanResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      calculation: LoanResultSchema,
      amortization: z.array(AmortizationPaymentSchema).optional(),
    })
    .optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
      details: z.record(z.string()).optional(),
    })
    .optional(),
})

// Health check schema
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number(),
  environment: z.string(),
})

// Error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.record(z.string()).optional(),
  }),
  timestamp: z.string(),
})

/**
 * Helper function to parse and validate loan input
 */
export const parseLoanInput = input => {
  try {
    const parsed = LoanInputSchema.parse(input)
    return {
      success: true,
      data: {
        amount: parseFloat(parsed.amount),
        rate: parseFloat(parsed.rate),
        term: parseFloat(parsed.term),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details:
          error.errors?.reduce((acc, err) => {
            acc[err.path[0]] = err.message
            return acc
          }, {}) || {},
      },
    }
  }
}

/**
 * Helper function to create standardized API responses
 */
export const createApiResponse = (success, data = null, error = null) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
  }

  if (success && data) {
    response.data = data
  } else if (!success && error) {
    response.error = error
  }

  return response
}
