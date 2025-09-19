/**
 * Loan calculation utilities
 */

/**
 * Calculate monthly loan payment using the standard formula
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} years - Loan term in years
 * @returns {object} Calculation results
 */
export const calculateLoanPayment = (principal, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12 // Convert to monthly decimal
  const numberOfPayments = years * 12 // Total number of payments

  let monthlyPayment = 0
  let totalPayment = 0
  let totalInterest = 0

  if (monthlyRate === 0) {
    // If no interest, just divide principal by number of payments
    monthlyPayment = principal / numberOfPayments
    totalPayment = principal
    totalInterest = 0
  } else {
    monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    totalPayment = monthlyPayment * numberOfPayments
    totalInterest = totalPayment - principal
  }

  return {
    principal,
    annualRate,
    years,
    monthlyRate,
    numberOfPayments,
    monthlyPayment,
    totalPayment,
    totalInterest,
  }
}

/**
 * Generate amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} years - Loan term in years
 * @returns {Array} Array of payment objects
 */
export const generateAmortizationSchedule = (principal, annualRate, years) => {
  const calculation = calculateLoanPayment(principal, annualRate, years)
  const { monthlyPayment, monthlyRate, numberOfPayments } = calculation

  if (monthlyRate === 0) {
    // Simple case with no interest
    return Array.from({ length: numberOfPayments }, (_, index) => ({
      payment: index + 1,
      monthlyPayment,
      interestPayment: 0,
      principalPayment: monthlyPayment,
      remainingBalance: principal - monthlyPayment * (index + 1),
    }))
  }

  const schedule = []
  let remainingBalance = principal

  for (let payment = 1; payment <= numberOfPayments; payment++) {
    const interestPayment = remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    remainingBalance -= principalPayment

    // Ensure final payment doesn't result in negative balance
    if (payment === numberOfPayments && remainingBalance < 0) {
      remainingBalance = 0
    }

    schedule.push({
      payment,
      monthlyPayment,
      interestPayment,
      principalPayment,
      remainingBalance: Math.max(0, remainingBalance),
    })
  }

  return schedule
}

/**
 * Validate loan input values
 * @param {string} amount - Loan amount as string
 * @param {string} rate - Interest rate as string
 * @param {string} term - Loan term as string
 * @returns {object} Validation result with errors
 */
export const validateLoanInputs = (amount, rate, term) => {
  const errors = { amount: '', rate: '', term: '' }
  let isValid = true

  // Validate amount
  if (!amount || amount.trim() === '') {
    errors.amount = 'Loan amount is required'
    isValid = false
  } else {
    const principal = parseFloat(amount)
    if (isNaN(principal) || principal <= 0) {
      errors.amount = 'Please enter a valid positive amount'
      isValid = false
    } else if (principal > 10000000) {
      errors.amount = 'Amount cannot exceed $10,000,000'
      isValid = false
    }
  }

  // Validate rate
  if (!rate || rate.trim() === '') {
    errors.rate = 'Interest rate is required'
    isValid = false
  } else {
    const interestRate = parseFloat(rate)
    if (isNaN(interestRate) || interestRate < 0) {
      errors.rate = 'Please enter a valid rate (0 or higher)'
      isValid = false
    } else if (interestRate > 50) {
      errors.rate = 'Interest rate seems unusually high (>50%)'
      isValid = false
    }
  }

  // Validate term
  if (!term || term.trim() === '') {
    errors.term = 'Loan term is required'
    isValid = false
  } else {
    const years = parseFloat(term)
    if (isNaN(years) || years <= 0) {
      errors.term = 'Please enter a valid positive number of years'
      isValid = false
    } else if (years > 50) {
      errors.term = 'Loan term cannot exceed 50 years'
      isValid = false
    }
  }

  return { isValid, errors }
}
