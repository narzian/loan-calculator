/**
 * Application constants
 */

// Loan calculation limits
export const LOAN_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000000,
  MIN_RATE: 0,
  MAX_RATE: 50,
  MIN_TERM: 0.1,
  MAX_TERM: 50,
}

// UI constants
export const UI_CONSTANTS = {
  MAX_HISTORY_ITEMS: 10,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
}

// Common loan terms for quick selection
export const COMMON_LOAN_TERMS = [
  { label: '1 year', value: 1 },
  { label: '2 years', value: 2 },
  { label: '3 years', value: 3 },
  { label: '5 years', value: 5 },
  { label: '7 years', value: 7 },
  { label: '10 years', value: 10 },
  { label: '15 years', value: 15 },
  { label: '20 years', value: 20 },
  { label: '25 years', value: 25 },
  { label: '30 years', value: 30 },
]

// Loan types for educational content
export const LOAN_TYPES = {
  PERSONAL: {
    name: 'Personal Loan',
    description: 'Unsecured loans for personal expenses',
    typicalRate: '6-36%',
    typicalTerm: '2-7 years',
  },
  AUTO: {
    name: 'Auto Loan',
    description: 'Secured loans for vehicle purchases',
    typicalRate: '3-7%',
    typicalTerm: '3-7 years',
  },
  MORTGAGE: {
    name: 'Mortgage',
    description: 'Secured loans for home purchases',
    typicalRate: '3-8%',
    typicalTerm: '15-30 years',
  },
  HOME_EQUITY: {
    name: 'Home Equity Loan',
    description: 'Secured loans against home equity',
    typicalRate: '4-10%',
    typicalTerm: '5-20 years',
  },
  STUDENT: {
    name: 'Student Loan',
    description: 'Loans for educational expenses',
    typicalRate: '3-12%',
    typicalTerm: '10-25 years',
  },
}

// Form field configurations
export const FORM_FIELDS = {
  AMOUNT: {
    name: 'amount',
    label: 'Loan Amount',
    placeholder: 'Enter loan amount',
    type: 'currency',
    icon: '💰',
  },
  RATE: {
    name: 'rate',
    label: 'Interest Rate',
    placeholder: 'Enter annual rate',
    type: 'percentage',
    icon: '📈',
  },
  TERM: {
    name: 'term',
    label: 'Loan Term',
    placeholder: 'Enter years',
    type: 'number',
    icon: '📅',
  },
}

// Color themes
export const THEME_COLORS = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  WARNING: {
    50: '#fefdf8',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
}
