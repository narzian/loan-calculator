import Card from './ui/Card'
import Button from './ui/Button'
import { formatCurrency } from '../utils/formatting'

const History = ({ history = [], onClear, currency = 'USD' }) => {
  return (
    <Card
      title="🕘 Calculation History"
      subtitle="Your recent loan calculations"
      headerAction={
        history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} icon="🧹">
            Clear History
          </Button>
        )
      }
    >
      {history.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium">No calculations yet</p>
          <p className="text-sm">Your recent calculations will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {history.map((calc, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-800">
                  {formatCurrency(calc.principal, currency)} loan
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(calc.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Rate:</span> {calc.annualRate}%
                </div>
                <div>
                  <span className="text-gray-600">Term:</span> {calc.years} years
                </div>
                <div>
                  <span className="text-gray-600">Monthly:</span>{' '}
                  {formatCurrency(calc.monthlyPayment, currency)}
                </div>
                <div>
                  <span className="text-gray-600">Total Interest:</span>{' '}
                  {formatCurrency(calc.totalInterest, currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default History
