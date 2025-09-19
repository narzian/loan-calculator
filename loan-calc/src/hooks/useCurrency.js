import { useState, useCallback } from 'react'
import { formatCurrency, formatPercentage } from '../utils/formatting'

/**
 * Custom hook for currency formatting and locale management
 */
export const useCurrency = (initialCurrency = 'USD', initialLocale = 'en-US') => {
  const [currency, setCurrency] = useState(initialCurrency)
  const [locale, setLocale] = useState(initialLocale)

  const format = useCallback(
    amount => {
      return formatCurrency(amount, currency, locale)
    },
    [currency, locale]
  )

  const formatPercent = useCallback((rate, decimals = 2, isDecimal = false) => {
    return formatPercentage(rate, decimals, isDecimal)
  }, [])

  return {
    currency,
    locale,
    setCurrency,
    setLocale,
    format,
    formatPercent,
  }
}
