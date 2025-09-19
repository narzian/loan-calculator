import { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import { formatCurrency } from '../utils/formatting'
import { saveCalculation, isAuthenticated, handleApiError } from '../utils/api'

/**
 * Clean, modern Results Display Component inspired by Groww
 */
const Results = ({ result, currency = 'USD', onShowAmortization, showAmortization = false }) => {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Handle saving calculation
  const handleSaveCalculation = async (saveData) => {
    setSaving(true)
    setSaveError(null)
    
    try {
      await saveCalculation({
        ...saveData,
        calculation: result,
      })
      setSaveSuccess(true)
      setShowSaveModal(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      const errorInfo = handleApiError(error)
      setSaveError(errorInfo.message)
    } finally {
      setSaving(false)
    }
  }

  if (!result) {
    return (
      <Card title="Loan Details" className="h-fit">
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-lg font-medium mb-2">Ready to Calculate</p>
          <p className="text-sm">Enter loan details and click calculate to see results</p>
        </div>
      </Card>
    )
  }

  const formatAmount = amount => formatCurrency(amount, currency)

  return (
    <div className="space-y-4">
      {/* Main Results Card */}
      <Card 
        title="Loan Details"
        headerAction={
          <div className="flex gap-2">
            {isAuthenticated() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                disabled={saving}
              >
                Save
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowAmortization(!showAmortization)}
            >
              {showAmortization ? 'Hide Schedule' : 'View Schedule'}
            </Button>
          </div>
        }
        className="h-fit"
      >
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">✅ Calculation saved successfully!</p>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">❌ {saveError}</p>
            <button
              onClick={() => setSaveError(null)}
              className="text-red-600 hover:text-red-800 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Key Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Monthly EMI</p>
              <p className="text-xl font-bold text-blue-700">{formatAmount(result.monthlyPayment)}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Principal amount</p>
              <p className="text-xl font-bold text-gray-900">{formatAmount(result.principal)}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total interest</p>
              <p className="text-xl font-bold text-gray-900">{formatAmount(result.totalInterest)}</p>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatAmount(result.totalPayment)}</p>
          </div>

          {/* Interest vs Principal Visualization */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Interest vs Principal</h4>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <div className="flex items-center mr-4">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span>Principal amount</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                <span>Interest amount</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(result.principal / result.totalPayment) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{((result.principal / result.totalPayment) * 100).toFixed(1)}% Principal</span>
              <span>{((result.totalInterest / result.totalPayment) * 100).toFixed(1)}% Interest</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Results