import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatCurrencyInput,
  formatPercentageInput,
  formatDuration,
} from '../utils/formatting'

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(5.5)).toBe('5.50%')
      expect(formatPercentage(0)).toBe('0.00%')
      expect(formatPercentage(12.345, 3)).toBe('12.345%')
    })

    it('should handle decimal input', () => {
      expect(formatPercentage(0.055, 2, true)).toBe('5.50%')
      expect(formatPercentage(0.12345, 3, true)).toBe('12.345%')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1234.567, 2)).toBe('1,234.57')
    })
  })

  describe('formatCurrencyInput', () => {
    it('should format input while typing', () => {
      expect(formatCurrencyInput('1234')).toBe('1,234')
      expect(formatCurrencyInput('1234.5')).toBe('1,234.5')
      expect(formatCurrencyInput('1234.567')).toBe('1,234.56')
    })

    it('should handle edge cases', () => {
      expect(formatCurrencyInput('')).toBe('')
      expect(formatCurrencyInput('.')).toBe('.')
      expect(formatCurrencyInput('abc')).toBe('')
    })
  })

  describe('formatPercentageInput', () => {
    it('should format percentage input', () => {
      expect(formatPercentageInput('5.5')).toBe('5.5')
      expect(formatPercentageInput('5.555')).toBe('5.555')
      expect(formatPercentageInput('5.5555')).toBe('5.555')
    })
  })

  describe('formatDuration', () => {
    it('should format months correctly', () => {
      expect(formatDuration(1)).toBe('1 month')
      expect(formatDuration(6)).toBe('6 months')
      expect(formatDuration(11)).toBe('11 months')
    })

    it('should format years correctly', () => {
      expect(formatDuration(12)).toBe('1 year')
      expect(formatDuration(24)).toBe('2 years')
      expect(formatDuration(360)).toBe('30 years')
    })

    it('should format years and months', () => {
      expect(formatDuration(13)).toBe('1 year, 1 month')
      expect(formatDuration(25)).toBe('2 years, 1 month')
      expect(formatDuration(38)).toBe('3 years, 2 months')
    })
  })
})
