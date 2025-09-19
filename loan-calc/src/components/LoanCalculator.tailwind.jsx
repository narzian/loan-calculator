import { useCallback } from 'react'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import { formatCurrencyInput, formatPercentageInput } from '../utils/formatting'

/**
 * Clean, modern Loan Calculator Form Component inspired by Groww
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

  const quickTerms = [
    { label: '1 Yr', value: 1 },
    { label: '2 Yr', value: 2 },
    { label: '5 Yr', value: 5 },
    { label: '7 Yr', value: 7 },
    { label: '10 Yr', value: 10 },
    { label: '15 Yr', value: 15 },
  ]

  return (
    <Card title="EMI Calculator" className="h-fit">
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
          label="Loan amount"
          value={formData.amount}
          onChange={e => handleInputChange('amount', e.target.value)}
          placeholder="10000"
          prefix="₹"
          error={errors.amount}
          required
          disabled={isCalculating}
        />

        {/* Interest Rate Input */}
        <Input
          id="interest-rate"
          label="Rate of interest (p.a)"
          value={formData.rate}
          onChange={e => handleInputChange('rate', e.target.value)}
          placeholder="6.5"
          suffix="%"
          error={errors.rate}
          required
          disabled={isCalculating}
        />

        {/* Loan Term Input with Quick Select */}
        <div>
          <Input
            id="loan-term"
            label="Loan tenure"
            value={formData.term}
            onChange={e => handleInputChange('term', e.target.value)}
            placeholder="5"
            suffix="Yr"
            error={errors.term}
            required
            disabled={isCalculating}
            type="number"
            min="0.1"
            step="0.1"
          />

          {/* Quick Term Selection */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {quickTerms.map(term => (
                <button
                  key={term.value}
                  type="button"
                  onClick={() => handleTermSelect(term.value)}
                  disabled={isCalculating}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150
                    ${
                      formData.term === term.value.toString()
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
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
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            loading={isCalculating}
            disabled={!canCalculate}
            className="flex-1"
          >
            {isCalculating ? 'Calculating...' : 'Calculate EMI'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onClear}
            disabled={isCalculating}
            className="px-4"
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default LoanCalculator