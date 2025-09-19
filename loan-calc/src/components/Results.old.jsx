import { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import { formatCurrency, formatDuration } from '../utils/formatting'
import { saveCalculation, isAuthenticated, handleApiError } from '../utils/api'

/**
 * Save Calculation Modal Component
 */
const SaveCalculationModal = ({ isOpen, onClose, onSave, saving }) => {
  const [name, setName] = useState('')
  const [tags, setTags] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  
  if (!isOpen) return null
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSave({
        name: name.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_favorite: isFavorite,
      })
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">💾 Save Calculation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={saving}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Home Loan 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., home, mortgage, 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="favorite"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={saving}
              />
              <label htmlFor="favorite" className="ml-2 text-sm text-gray-700">
                ⭐ Mark as favorite
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || saving}
              className="flex-1"
            >
              {saving ? '💾 Saving...' : '💾 Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Modern Results Display Component with enhanced visual design
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

  // Close save modal and reset states
  const closeSaveModal = () => {
    setShowSaveModal(false)
    setSaveError(null)
  }
  if (!result) {
    return (
      <Card
        title="📊 Loan Details"
        subtitle="Results will appear here after calculation"
        className="h-fit"
      >
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🧮</div>
          <p className="text-lg font-medium mb-2">Ready to Calculate</p>
          <p className="text-sm">Enter your loan details and click calculate to see results</p>
        </div>
      </Card>
    )
  }

  const formatAmount = amount => formatCurrency(amount, currency)

  // Calculate monthly breakdown
  const monthlyBreakdown = [
    {
      label: 'Monthly Payment',
      value: result.monthlyPayment,
      highlight: true,
      icon: '💳',
      description: "Amount you'll pay each month",
    },
    {
      label: 'Principal Amount',
      value: result.principal,
      icon: '💰',
      description: 'Original loan amount',
    },
    {
      label: 'Total Payment',
      value: result.totalPayment,
      icon: '📈',
      description: 'Total amount paid over loan term',
    },
    {
      label: 'Total Interest',
      value: result.totalInterest,
      icon: '📊',
      color: result.totalInterest > result.principal * 0.2 ? 'amber' : 'green',
      description: 'Total interest paid over loan term',
    },
  ]

  return (
    <Card
      title="📊 Loan Details"
      subtitle={
        saveSuccess ? (
          <span className="text-green-600 font-medium">✅ Calculation saved successfully!</span>
        ) : (
          `${result.annualRate}% APR • ${formatDuration(result.numberOfPayments)}`
        )
      }
      headerAction={
        <div className="flex gap-2">
          {isAuthenticated() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              icon="💾"
              disabled={saving}
            >
              Save
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShowAmortization(!showAmortization)}
            icon={showAmortization ? '📈' : '📋'}
          >
            {showAmortization ? 'Hide Schedule' : 'View Schedule'}
          </Button>
        </div>
      }
      className="h-fit"
    >
      {/* Save Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span>⚠️</span>
            <p className="text-sm font-medium">Failed to save calculation</p>
          </div>
          <p className="text-sm text-red-700 mt-1">{saveError}</p>
          <button
            onClick={() => setSaveError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Main Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyBreakdown.map((item, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-xl border transition-all duration-200
                ${
                  item.highlight
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        item.highlight ? 'text-blue-900' : 'text-gray-700'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      item.highlight
                        ? 'text-xl text-blue-700'
                        : item.color === 'amber'
                          ? 'text-lg text-amber-700'
                          : item.color === 'green'
                            ? 'text-lg text-green-700'
                            : 'text-lg text-gray-900'
                    }`}
                  >
                    {formatAmount(item.value)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loan Summary Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            📋 Loan Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Interest Rate</p>
              <p className="text-lg font-bold text-gray-900">{result.annualRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Loan Term</p>
              <p className="text-lg font-bold text-gray-900">{result.years} years</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-gray-600">Total Payments</p>
              <p className="text-lg font-bold text-gray-900">{result.numberOfPayments}</p>
            </div>
          </div>
        </div>

        {/* Interest Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            🔍 Interest Analysis
          </h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Interest vs Principal</span>
              <span className="text-xs text-gray-500">
                {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}% interest
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(result.principal / result.totalPayment) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Principal: {formatAmount(result.principal)}</span>
              <span>Interest: {formatAmount(result.totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Calculation Timestamp */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Calculated on {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Save Calculation Modal */}
      <SaveCalculationModal
        isOpen={showSaveModal}
        onClose={closeSaveModal}
        onSave={handleSaveCalculation}
        saving={saving}
      />
    </Card>
  )
}

export default Results
