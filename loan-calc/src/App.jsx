import { useState } from 'react'
import './App.css'
 
function App() {
  const [loanAmount, setLoanAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
 
  const calculateLoan = () => {
    if (!loanAmount || !interestRate || !loanTerm) {
      alert('Please enter all required values')
      return
    }
 
    const principal = parseFloat(loanAmount)
    const rate = parseFloat(interestRate) / 100 / 12 // Monthly interest rate
    const time = parseFloat(loanTerm) * 12 // Total number of payments
    
    if (isNaN(principal) || isNaN(rate) || isNaN(time) || principal <= 0 || rate < 0 || time <= 0) {
      alert('Please enter valid positive numbers')
      return
    }
 
    // Monthly payment calculation using the formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthlyPayment = 0
    let totalPayment = 0
    let totalInterest = 0
 
    if (rate === 0) {
      // If no interest, just divide principal by number of payments
      monthlyPayment = principal / time
      totalPayment = principal
      totalInterest = 0
    } else {
      monthlyPayment = principal * (rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
      totalPayment = monthlyPayment * time
      totalInterest = totalPayment - principal
    }
    
    const calculation = {
      principal,
      interestRate: parseFloat(interestRate),
      loanTerm: parseFloat(loanTerm),
      monthlyPayment,
      totalPayment,
      totalInterest,
      timestamp: new Date().toLocaleString()
    }
 
    setResult(calculation)
    setHistory(prev => [calculation, ...prev.slice(0, 9)]) // Keep last 10 calculations
  }
 
  const clearAll = () => {
    setLoanAmount('')
    setInterestRate('')
    setLoanTerm('')
    setResult(null)
  }
 
  const clearHistory = () => {
    setHistory([])
  }
 
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Loan Calculator</h1>
          <p className="text-gray-600">Calculate monthly payments, total interest, and loan details</p>
        </div>
 
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Calculate Your Loan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter loan amount"
                  min="0"
                  step="0.01"
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (% per year)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter annual interest rate"
                  min="0"
                  step="0.01"
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term (years)
                </label>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter loan term in years"
                  min="1"
                  step="1"
                />
              </div>
 
              <div className="flex gap-3">
                <button
                  onClick={calculateLoan}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Calculate Loan
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
 
            {/* Result Display */}
            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Principal Amount</p>
                    <p className="font-semibold text-green-700">{formatCurrency(result.principal)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interest Rate</p>
                    <p className="font-semibold text-green-700">{result.interestRate}% per year</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loan Term</p>
                    <p className="font-semibold text-green-700">{result.loanTerm} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Payment</p>
                    <p className="font-semibold text-green-700 text-lg">{formatCurrency(result.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Payment</p>
                    <p className="font-semibold text-green-700">{formatCurrency(result.totalPayment)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Interest</p>
                    <p className="font-semibold text-green-700">{formatCurrency(result.totalInterest)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
 
          {/* History Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Calculation History</h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear History
                </button>
              )}
            </div>
 
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No calculations yet</p>
              ) : (
                history.map((calc, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-800">
                        {formatCurrency(calc.principal)} loan
                      </div>
                      <div className="text-xs text-gray-500">
                        {calc.timestamp}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Rate:</span> {calc.interestRate}%
                      </div>
                      <div>
                        <span className="text-gray-600">Term:</span> {calc.loanTerm} years
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly:</span> {formatCurrency(calc.monthlyPayment)}
                      </div>
                      <div>
                        <span className="text-gray-600">Total Interest:</span> {formatCurrency(calc.totalInterest)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
 
        {/* Loan Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">How Loan Calculations Work</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Monthly Payment Formula</h3>
              <p>M = P × [r(1+r)^n] / [(1+r)^n - 1]</p>
              <ul className="mt-2 space-y-1">
                <li>• M = Monthly payment</li>
                <li>• P = Principal loan amount</li>
                <li>• r = Monthly interest rate (annual rate ÷ 12)</li>
                <li>• n = Total number of payments (years × 12)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Key Terms</h3>
              <ul className="space-y-1">
                <li>• <strong>Principal:</strong> The original loan amount</li>
                <li>• <strong>Interest Rate:</strong> Annual percentage rate (APR)</li>
                <li>• <strong>Term:</strong> Length of the loan in years</li>
                <li>• <strong>Total Interest:</strong> Total amount paid in interest over the life of the loan</li>
              </ul>
            </div>
          </div>
        </div>
 
        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>Simple Loan Calculator - Built with React & Tailwind CSS</p>
          <p className="text-sm mt-1">For educational purposes only. Consult a financial advisor for actual loan decisions.</p>
        </div>
      </div>
    </div>
  )
}
 
export default App
 
