import './App.css'
import { useLoanCalculation } from './hooks/useLoanCalculation'
import { useHistory } from './hooks/useHistory'
import { useCurrency } from './hooks/useCurrency'
import LoanCalculator from './components/LoanCalculator'
import Results from './components/Results'
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
          <h1>Loan Calculator</h1>
          <p>
            Calculate monthly payments, explore amortization schedules, and make informed financial decisions.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Left Column - Calculator */}
          <div>
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
          </div>

          {/* Right Column - Results */}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default App