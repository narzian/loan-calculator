/**
 * Formatting utilities for currency, numbers, and percentages
 */

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number as percentage
 * @param {number} rate - Rate to format (as decimal or percentage)
 * @param {number} decimals - Number of decimal places
 * @param {boolean} isDecimal - Whether the input is already a decimal (0.05) or percentage (5)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (rate, decimals = 2, isDecimal = false) => {
  const value = isDecimal ? rate * 100 : rate
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Format a number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Parse currency string to number
 * @param {string} currencyStr - Currency string to parse
 * @returns {number} Parsed number or NaN if invalid
 */
export const parseCurrency = currencyStr => {
  if (typeof currencyStr !== 'string') return NaN

  // Remove currency symbols, spaces, and commas
  const cleanStr = currencyStr.replace(/[$,\s]/g, '')
  return parseFloat(cleanStr)
}

/**
 * Format input value as currency while typing
 * @param {string} value - Input value
 * @returns {string} Formatted value for display
 */
export const formatCurrencyInput = value => {
  if (!value) return ''

  // Remove non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '')

  // Handle multiple decimal points
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }

  // Limit decimal places to 2
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }

  const cleanValue = parts.join('.')

  if (cleanValue === '' || cleanValue === '.') return cleanValue

  const num = parseFloat(cleanValue)
  if (isNaN(num)) return ''

  // Format with commas for display
  const [integer, decimal] = cleanValue.split('.')
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger
}

/**
 * Format percentage input while typing
 * @param {string} value - Input value
 * @returns {string} Formatted percentage value
 */
export const formatPercentageInput = value => {
  if (!value) return ''

  // Remove non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '')

  // Handle multiple decimal points
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }

  // Limit decimal places to 3 for percentages
  if (parts[1] && parts[1].length > 3) {
    parts[1] = parts[1].substring(0, 3)
  }

  return parts.join('.')
}

/**
 * Format time duration (months/years)
 * @param {number} months - Duration in months
 * @returns {string} Formatted duration string
 */
export const formatDuration = months => {
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
}
