import { useCallback } from 'react'
import { 
  Card, 
  NumberInput, 
  Button, 
  Group, 
  Stack, 
  Title, 
  Text,
  Pill,
  SimpleGrid,
  Space
} from '@mantine/core'
import { IconCalculator, IconClearAll, IconCurrencyRupee, IconPercentage, IconCalendar } from '@tabler/icons-react'

/**
 * Modern Loan Calculator Form Component using Mantine UI
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
      // Convert number back to string for consistency with existing hooks
      onFieldChange(field, value?.toString() || '')
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
    { label: '1Y', value: 1 },
    { label: '2Y', value: 2 },
    { label: '5Y', value: 5 },
    { label: '7Y', value: 7 },
    { label: '10Y', value: 10 },
    { label: '15Y', value: 15 },
  ]

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={3} size="h4">EMI Calculator</Title>
        </Group>
      </Card.Section>

      <Stack mt="md" gap="md">
        <form
          onSubmit={e => {
            e.preventDefault()
            onCalculate()
          }}
        >
          <Stack gap="lg">
            {/* Loan Amount Input */}
            <NumberInput
              label="Loan amount"
              placeholder="Enter loan amount"
              value={parseFloat(formData.amount?.replace(/,/g, '')) || ''}
              onChange={(value) => handleInputChange('amount', value)}
              leftSection={<IconCurrencyRupee size={18} />}
              thousandSeparator=","
              min={0}
              max={10000000}
              error={errors.amount}
              required
              disabled={isCalculating}
              size="md"
              styles={{
                input: {
                  fontWeight: 500,
                }
              }}
            />

            {/* Interest Rate Input */}
            <NumberInput
              label="Rate of interest (p.a)"
              placeholder="Enter interest rate"
              value={parseFloat(formData.rate) || ''}
              onChange={(value) => handleInputChange('rate', value)}
              rightSection={<IconPercentage size={18} />}
              decimalScale={2}
              min={0.1}
              max={50}
              step={0.1}
              error={errors.rate}
              required
              disabled={isCalculating}
              size="md"
              styles={{
                input: {
                  fontWeight: 500,
                }
              }}
            />

            {/* Loan Term Input with Quick Select */}
            <Stack gap="xs">
              <NumberInput
                label="Loan tenure"
                placeholder="Enter loan tenure"
                value={parseFloat(formData.term) || ''}
                onChange={(value) => handleInputChange('term', value)}
                rightSection={
                  <Group gap={4} wrap="nowrap">
                    <Text size="sm" c="dimmed">Yr</Text>
                  </Group>
                }
                min={0.1}
                max={50}
                step={0.1}
                decimalScale={1}
                error={errors.term}
                required
                disabled={isCalculating}
                size="md"
                styles={{
                  input: {
                    fontWeight: 500,
                  }
                }}
              />

              {/* Quick Term Selection */}
              <Group gap="xs" mt="xs">
                {quickTerms.map(term => (
                  <Pill
                    key={term.value}
                    size="md"
                    withRemoveButton={false}
                    onClick={() => handleTermSelect(term.value)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: formData.term === term.value.toString() ? '#2196f3' : '#f1f3f4',
                      color: formData.term === term.value.toString() ? 'white' : '#5f6368'
                    }}
                  >
                    {term.label}
                  </Pill>
                ))}
              </Group>
            </Stack>

            <Space h="md" />

            {/* Action Buttons */}
            <SimpleGrid cols={2} spacing="sm">
              <Button
                type="submit"
                loading={isCalculating}
                disabled={!canCalculate}
                leftSection={<IconCalculator size={18} />}
                size="md"
                variant="filled"
                fullWidth
              >
                {isCalculating ? 'Calculating...' : 'Calculate EMI'}
              </Button>

              <Button
                type="button"
                variant="light"
                color="gray"
                onClick={onClear}
                disabled={isCalculating}
                leftSection={<IconClearAll size={18} />}
                size="md"
                fullWidth
              >
                Clear
              </Button>
            </SimpleGrid>
          </Stack>
        </form>
      </Stack>
    </Card>
  )
}

export default LoanCalculator