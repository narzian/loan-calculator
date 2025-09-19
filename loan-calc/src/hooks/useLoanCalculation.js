import { useState, useCallback, useMemo } from 'react'
import {
  calculateLoanPayment,
  validateLoanInputs,
  generateAmortizationSchedule,
} from '../utils/loanCalculations'
import { parseCurrency } from '../utils/formatting'

/**
 * Custom hook for loan calculation logic
 * @returns {object} Loan calculation state and methods
 */
export const useLoanCalculation = () => {
  const [formData, setFormData] = useState({
    amount: '',
    rate: '',
    term: '',
  })

  const [errors, setErrors] = useState({
    amount: '',
    rate: '',
    term: '',
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState(null)
  const [showAmortization, setShowAmortization] = useState(false)

  // Validate inputs and calculate result
  const calculate = useCallback(
    async (useServer = false) => {
      setIsCalculating(true)

      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))

      const validation = validateLoanInputs(formData.amount, formData.rate, formData.term)
      setErrors(validation.errors)

      if (!validation.isValid) {
        setIsCalculating(false)
        return null
      }

      // Parse formatted values correctly
      const principal = parseCurrency(formData.amount) || parseFloat(formData.amount)
      const annualRate = parseFloat(formData.rate)
      const years = parseFloat(formData.term)

      let calculation

      if (useServer) {
        try {
          const res = await fetch('/api/calc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: formData,
              options: { includeAmortization: true, currency: 'USD' },
            }),
          })

          const json = await res.json()
          if (!res.ok || !json.success) {
            throw new Error(json.error?.message || 'Server validation failed')
          }

          calculation = json.data.calculation
        } catch (err) {
          console.error('Server calculation failed, falling back to client:', err)
          calculation = calculateLoanPayment(principal, annualRate, years)
        }
      } else {
        calculation = calculateLoanPayment(principal, annualRate, years)
      }

      const resultData = {
        ...calculation,
        timestamp: new Date().toISOString(),
        formData: { ...formData },
      }

      setResult(resultData)
      setIsCalculating(false)

      return resultData
    },
    [formData]
  )

  // Update form field
  const updateField = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }))

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    },
    [errors]
  )

  // Clear all data
  const clearAll = useCallback(() => {
    setFormData({ amount: '', rate: '', term: '' })
    setErrors({ amount: '', rate: '', term: '' })
    setResult(null)
    setShowAmortization(false)
  }, [])

  // Generate amortization schedule
  const amortizationSchedule = useMemo(() => {
    if (!result) return []

    return generateAmortizationSchedule(result.principal, result.annualRate, result.years)
  }, [result])

  // Check if form is valid for calculation
  const canCalculate = useMemo(() => {
    return (
      formData.amount &&
      formData.rate &&
      formData.term &&
      !errors.amount &&
      !errors.rate &&
      !errors.term
    )
  }, [formData, errors])

  return {
    formData,
    errors,
    result,
    isCalculating,
    showAmortization,
    amortizationSchedule,
    canCalculate,
    updateField,
    calculate,
    clearAll,
    setShowAmortization,
  }
}
