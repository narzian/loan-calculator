import { useCallback } from 'react'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import { FORM_FIELDS, COMMON_LOAN_TERMS } from '../constants'
import { formatCurrencyInput, formatPercentageInput } from '../utils/formatting'

/**
 * Modern Loan Calculator Form Component
 */
const LoanCalculator = ({
  formData,
  errors,
  isCalculating,
  canCalculate,
  onFieldChange,
  onCalculate,
  onClear,
}) => {
  // Handle input formatting for different field types
  const handleInputChange = useCallback(
    (field, value) => {
      let formattedValue = value

      if (field === 'amount') {
        formattedValue = formatCurrencyInput(value)
      } else if (field === 'rate') {
        formattedValue = formatPercentageInput(value)
      }

      onFieldChange(field, formattedValue)
    },
    [onFieldChange]
  )

  // Quick term selection
  const handleTermSelect = useCallback(
    years => {
      onFieldChange('term', years.toString())
    },
    [onFieldChange]
  )

  return (
    <Card
      title="💰 Loan Calculator"
      subtitle="Calculate your monthly payment and total interest"
      className="h-fit"
    >
      <form
        onSubmit={e => {
          e.preventDefault()
          onCalculate()
        }}
        className="space-y-6"
      >
        {/* Loan Amount Input */}
        <Input
          id="loan-amount"
          label={FORM_FIELDS.AMOUNT.label}
          icon={FORM_FIELDS.AMOUNT.icon}
          value={formData.amount}
          onChange={e => handleInputChange('amount', e.target.value)}
          placeholder={FORM_FIELDS.AMOUNT.placeholder}
          error={errors.amount}
          required
          disabled={isCalculating}
        />

        {/* Interest Rate Input */}
        <Input
          id="interest-rate"
          label={FORM_FIELDS.RATE.label}
          icon={FORM_FIELDS.RATE.icon}
          value={formData.rate}
          onChange={e => handleInputChange('rate', e.target.value)}
          placeholder={FORM_FIELDS.RATE.placeholder}
          error={errors.rate}
          required
          disabled={isCalculating}
        />

        {/* Loan Term Input with Quick Select */}
        <div className="space-y-3">
          <Input
            id="loan-term"
            label={FORM_FIELDS.TERM.label}
            icon={FORM_FIELDS.TERM.icon}
            value={formData.term}
            onChange={e => handleInputChange('term', e.target.value)}
            placeholder={FORM_FIELDS.TERM.placeholder}
            error={errors.term}
            required
            disabled={isCalculating}
            type="number"
            min="0.1"
            step="0.1"
          />

          {/* Quick Term Selection */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Quick Select:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_LOAN_TERMS.slice(0, 6).map(term => (
                <button
                  key={term.value}
                  type="button"
                  onClick={() => handleTermSelect(term.value)}
                  disabled={isCalculating}
                  className={`
                    px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-150
                    ${
                      formData.term === term.value.toString()
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            loading={isCalculating}
            disabled={!canCalculate}
            icon="🧮"
            className="flex-1"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Loan'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onClear}
            disabled={isCalculating}
            icon="🗑️"
            className="px-4"
            title="Clear all fields"
          >
            Clear
          </Button>
        </div>

        {/* Helpful Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2">
            💡 Tips for Better Results
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Enter your actual loan amount including fees</li>
            <li>• Use the Annual Percentage Rate (APR) if available</li>
            <li>• Consider different loan terms to see payment variations</li>
            <li>• Remember that longer terms mean more total interest</li>
          </ul>
        </div>
      </form>
    </Card>
  )
}

export default LoanCalculator
