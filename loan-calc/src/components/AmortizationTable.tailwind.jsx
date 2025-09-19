import { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import { formatCurrency } from '../utils/formatting'

const AmortizationTable = ({ schedule = [], currency = 'USD', onClose }) => {
  const [showAll, setShowAll] = useState(false)
  const displaySchedule = showAll ? schedule : schedule.slice(0, 12)

  if (schedule.length === 0) return null

  return (
    <Card
      title="📋 Amortization Schedule"
      subtitle={`Payment breakdown for ${schedule.length} payments`}
      headerAction={
        <Button variant="ghost" size="sm" onClick={onClose} icon="✕">
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-lg font-bold text-gray-900">{schedule.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Monthly Payment</p>
            <p className="text-lg font-bold text-blue-700">
              {formatCurrency(schedule[0]?.monthlyPayment || 0, currency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Final Balance</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(0, currency)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Payment #</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Monthly Payment</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Principal</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Interest</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {displaySchedule.map((payment, index) => (
                <tr
                  key={payment.payment}
                  className={`
                    border-b border-gray-100 hover:bg-gray-50 transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{payment.payment}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(payment.monthlyPayment, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {formatCurrency(payment.principalPayment, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600">
                    {formatCurrency(payment.interestPayment, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700 font-medium">
                    {formatCurrency(payment.remainingBalance, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show More/Less Button */}
        {schedule.length > 12 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              icon={showAll ? '📈' : '📋'}
            >
              {showAll
                ? `Show Less (${displaySchedule.length} of ${schedule.length})`
                : `Show All ${schedule.length} Payments`}
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">📖 Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Principal Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Interest Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Remaining Balance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Total Payment</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AmortizationTable
