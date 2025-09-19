import './App.css'
import { Container, Title, Text, Stack, Group, SimpleGrid, Space } from '@mantine/core'
import { useEffect } from 'react'
import { useLoanCalculation } from './hooks/useLoanCalculation'
import { useHistory } from './hooks/useHistory'
import { useCurrency } from './hooks/useCurrency'
import { trackCalculation, trackPageView } from './utils/analytics'
import LoanCalculator from './components/LoanCalculator'
import Results from './components/Results'
import AmortizationTable from './components/AmortizationTable'
import LoanVisualization from './components/LoanVisualization'

function App() {
  const loanCalc = useLoanCalculation()
  const historyManager = useHistory()
  const { currency } = useCurrency()

  // Track page view on app load
  useEffect(() => {
    trackPageView()
  }, [])

  // Handle calculation and add to history
  const handleCalculate = async (useServer = false) => {
    const result = await loanCalc.calculate(useServer)
    if (result) {
      historyManager.addToHistory(result)
      // Track calculation anonymously for insights
      trackCalculation(result, loanCalc.formData)
    }
  }

  return (
    <div className="app-container">
      <Container size="xl" py={{ base: 'md', md: 'lg', lg: 'xl' }} px={{ base: 'sm', sm: 'md' }}>
        {/* Main Header */}
        <Stack align="center" gap="md" mb="xl">
          <Title order={1} ta="center" c="dark.8">
            Loan Calculator
          </Title>
          <Text ta="center" c="dimmed" size="lg" maw={600}>
            Calculate monthly payments, explore amortization schedules, and make informed financial decisions.
          </Text>
        </Stack>

        {/* Main Content - Two Row Layout */}
        <Stack gap={{ base: 'md', lg: 'xl' }}>
          {/* Top Row - Calculator and Results */}
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={{ base: 'md', lg: 'xl' }}>
            {/* Calculator */}
            <LoanCalculator
              formData={loanCalc.formData}
              errors={loanCalc.errors}
              isCalculating={loanCalc.isCalculating}
              canCalculate={loanCalc.canCalculate}
              onFieldChange={loanCalc.updateField}
              onCalculate={() => handleCalculate(true)}
              onClear={loanCalc.clearAll}
            />

            {/* Results */}
            <Results
              result={loanCalc.result}
              currency={currency}
              onShowAmortization={loanCalc.setShowAmortization}
              showAmortization={loanCalc.showAmortization}
            />
          </SimpleGrid>

          {/* Bottom Row - Visualization and Amortization Table (when results available) */}
          {loanCalc.result && (
            <>
              {/* Show visualization when no table, or table when requested */}
              {!loanCalc.showAmortization ? (
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 'md', lg: 'xl' }}>
                  <div>
                    <LoanVisualization
                      result={loanCalc.result}
                      currency={currency}
                    />
                  </div>
                </SimpleGrid>
              ) : (
                <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={{ base: 'md', lg: 'xl' }}>
                  {/* Visualization - 1 column */}
                  <div>
                    <LoanVisualization
                      result={loanCalc.result}
                      currency={currency}
                    />
                  </div>
                  
                  {/* Amortization Table - 3 columns (spans most of the width) */}
                  <div style={{ gridColumn: 'span 3' }}>
                    <AmortizationTable
                      schedule={loanCalc.amortizationSchedule}
                      currency={currency}
                      onClose={() => loanCalc.setShowAmortization(false)}
                    />
                  </div>
                </SimpleGrid>
              )}
            </>
          )}
        </Stack>

        <Space h="xl" />
        <Space h="xl" />
      </Container>
    </div>
  )
}

export default App