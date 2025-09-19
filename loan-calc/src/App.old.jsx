import './App.css'
import { useLoanCalculation } from './hooks/useLoanCalculation'
import { useHistory } from './hooks/useHistory'
import { useCurrency } from './hooks/useCurrency'
import LoanCalculator from './components/LoanCalculator'
import Results from './components/Results'
import History from './components/History'
import AmortizationTable from './components/AmortizationTable'

function App() {
  const loanCalc = useLoanCalculation()
  const historyManager = useHistory()
  const { currency } = useCurrency()

  // Handle calculation and add to history
  const handleCalculate = async (useServer = false) => {
    const result = await loanCalc.calculate(useServer)
    if (result) {
      historyManager.addToHistory(result)
    }
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Main Header */}
        <div className="main-header">
          <h1>🏦 Smart Loan Calculator</h1>
          <p>
            Calculate monthly payments, explore amortization schedules, and make informed financial
            decisions with our advanced loan calculator.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Left Column - Calculator */}
          <div className="space-y-6">
            <div className="animate-fade-in">
              <LoanCalculator
                formData={loanCalc.formData}
                errors={loanCalc.errors}
                isCalculating={loanCalc.isCalculating}
                canCalculate={loanCalc.canCalculate}
                onFieldChange={loanCalc.updateField}
                onCalculate={() => handleCalculate(true)}
                onClear={loanCalc.clearAll}
              />
            </div>

            {/* History - Mobile: below calculator, Desktop: in sidebar */}
            <div className="animate-slide-in lg:hidden">
              <History
                history={historyManager.history}
                onClear={historyManager.clearHistory}
                currency={currency}
              />
            </div>
          </div>

          {/* Right Column - Results & Features */}
          <div className="space-y-6">
            {/* Results */}
            <div className="animate-fade-in">
              <Results
                result={loanCalc.result}
                currency={currency}
                onShowAmortization={loanCalc.setShowAmortization}
                showAmortization={loanCalc.showAmortization}
              />
            </div>

            {/* Amortization Table */}
            {loanCalc.showAmortization && loanCalc.result && (
              <div className="animate-fade-in">
                <AmortizationTable
                  schedule={loanCalc.amortizationSchedule}
                  currency={currency}
                  onClose={() => loanCalc.setShowAmortization(false)}
                />
              </div>
            )}

            {/* History - Desktop only */}
            <div className="hidden lg:block animate-slide-in">
              <History
                history={historyManager.history}
                onClear={historyManager.clearHistory}
                currency={currency}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="text-center mt-16 pb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-white/90 mb-2 font-medium">🎓 Educational Loan Calculator</p>
            <p className="text-white/70 text-sm max-w-2xl mx-auto leading-relaxed">
              This calculator provides estimates for educational purposes only. For actual loan
              decisions, please consult with qualified financial advisors. Built with React,
              Tailwind CSS, and modern web technologies.
            </p>
            <div className="flex justify-center items-center gap-4 mt-4 text-xs text-white/60">
              <span>💰 Loan Calculations</span>
              <span>•</span>
              <span>📊 Payment Schedules</span>
              <span>•</span>
              <span>📱 Responsive Design</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
