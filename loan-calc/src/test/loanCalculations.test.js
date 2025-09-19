import { describe, it, expect } from 'vitest'
import {
  calculateLoanPayment,
  validateLoanInputs,
  generateAmortizationSchedule,
} from '../utils/loanCalculations'

describe('Loan Calculations', () => {
  describe('calculateLoanPayment', () => {
    it('should calculate correct monthly payment for standard loan', () => {
      const result = calculateLoanPayment(100000, 5, 30)

      expect(result.principal).toBe(100000)
      expect(result.annualRate).toBe(5)
      expect(result.years).toBe(30)
      expect(result.numberOfPayments).toBe(360)
      expect(result.monthlyPayment).toBeCloseTo(536.82, 2)
      expect(result.totalInterest).toBeCloseTo(93255.78, 2)
    })

    it('should handle zero interest rate correctly', () => {
      const result = calculateLoanPayment(100000, 0, 10)

      expect(result.monthlyPayment).toBeCloseTo(833.33, 2)
      expect(result.totalInterest).toBe(0)
      expect(result.totalPayment).toBe(100000)
    })

    it('should calculate short-term high-rate loan', () => {
      const result = calculateLoanPayment(50000, 12, 5)

      expect(result.monthlyPayment).toBeCloseTo(1112.22, 2)
      expect(result.totalInterest).toBeCloseTo(16733.34, 2)
    })
  })

  describe('validateLoanInputs', () => {
    it('should pass validation for valid inputs', () => {
      const result = validateLoanInputs('100000', '5.5', '30')

      expect(result.isValid).toBe(true)
      expect(result.errors.amount).toBe('')
      expect(result.errors.rate).toBe('')
      expect(result.errors.term).toBe('')
    })

    it('should fail validation for empty inputs', () => {
      const result = validateLoanInputs('', '', '')

      expect(result.isValid).toBe(false)
      expect(result.errors.amount).toContain('required')
      expect(result.errors.rate).toContain('required')
      expect(result.errors.term).toContain('required')
    })

    it('should fail validation for negative values', () => {
      const result = validateLoanInputs('-1000', '-5', '-1')

      expect(result.isValid).toBe(false)
      expect(result.errors.amount).toContain('positive')
      expect(result.errors.rate).toContain('0 or higher')
      expect(result.errors.term).toContain('positive')
    })

    it('should fail validation for excessively large values', () => {
      const result = validateLoanInputs('20000000', '60', '100')

      expect(result.isValid).toBe(false)
      expect(result.errors.amount).toContain('exceed')
      expect(result.errors.rate).toContain('high')
      expect(result.errors.term).toContain('exceed')
    })
  })

  describe('generateAmortizationSchedule', () => {
    it('should generate correct schedule for short loan', () => {
      const schedule = generateAmortizationSchedule(12000, 6, 1)

      expect(schedule).toHaveLength(12)
      expect(schedule[0].payment).toBe(1)
      expect(schedule[11].payment).toBe(12)
      expect(schedule[11].remainingBalance).toBeCloseTo(0, 2)
    })

    it('should have decreasing balance over time', () => {
      const schedule = generateAmortizationSchedule(100000, 5, 5)

      expect(schedule[0].remainingBalance).toBeGreaterThan(schedule[30].remainingBalance)
      expect(schedule[30].remainingBalance).toBeGreaterThan(schedule[59].remainingBalance)
    })

    it('should handle zero interest correctly', () => {
      const schedule = generateAmortizationSchedule(12000, 0, 1)

      expect(schedule).toHaveLength(12)
      expect(schedule[0].interestPayment).toBe(0)
      expect(schedule[0].principalPayment).toBeCloseTo(1000, 2)
      expect(schedule[0].monthlyPayment).toBeCloseTo(1000, 2)
    })
  })
})
