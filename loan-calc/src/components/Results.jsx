import { useState } from 'react'
import { 
  Card, 
  Button, 
  Group, 
  Stack, 
  Title, 
  Text,
  SimpleGrid,
  Progress,
  Badge,
  Alert,
  ActionIcon,
  NumberFormatter,
  Divider,
  Box,
  ThemeIcon
} from '@mantine/core'
import { 
  IconDeviceFloppy, 
  IconTable, 
  IconEye, 
  IconEyeOff,
  IconX,
  IconCheck,
  IconCurrencyRupee,
  IconPercentage,
  IconCalendar,
  IconTrendingUp,
  IconCalculator
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { saveCalculation, isAuthenticated, handleApiError } from '../utils/api'

/**
 * Modern Results Display Component using Mantine UI
 */
const Results = ({ result, currency = 'USD', onShowAmortization, showAmortization = false }) => {
  const [saving, setSaving] = useState(false)

  // Handle saving calculation
  const handleSaveCalculation = async () => {
    setSaving(true)
    
    try {
      await saveCalculation({
        name: `Loan ${new Date().toLocaleDateString()}`,
        calculation: result,
        tags: ['calculator'],
        is_favorite: false,
      })
      
      notifications.show({
        title: 'Calculation Saved!',
        message: 'Your loan calculation has been saved successfully.',
        color: 'green',
        icon: <IconCheck size={18} />,
      })
    } catch (error) {
      const errorInfo = handleApiError(error)
      notifications.show({
        title: 'Save Failed',
        message: errorInfo.message,
        color: 'red',
        icon: <IconX size={18} />,
      })
    } finally {
      setSaving(false)
    }
  }

  if (!result) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={3} size="h4">Loan Details</Title>
        </Card.Section>

        <Stack align="center" py={60}>
          <ThemeIcon size={60} radius="xl" variant="light" color="blue">
            <IconCalculator size={30} />
          </ThemeIcon>
          <Title order={4} ta="center">Ready to Calculate</Title>
          <Text c="dimmed" ta="center" size="sm">
            Enter loan details and click calculate to see results
          </Text>
        </Stack>
      </Card>
    )
  }

  const principalPercentage = (result.principal / result.totalPayment) * 100
  const interestPercentage = (result.totalInterest / result.totalPayment) * 100

  return (
    <Stack gap="md">
      {/* Main Results Card */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Title order={3} size="h4">Loan Details</Title>
            <Group gap="xs">
              {isAuthenticated() && (
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSaveCalculation}
                  loading={saving}
                >
                  Save
                </Button>
              )}
              <Button
                variant="light"
                size="xs"
                leftSection={showAmortization ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                onClick={() => onShowAmortization(!showAmortization)}
              >
                {showAmortization ? 'Hide Schedule' : 'View Schedule'}
              </Button>
            </Group>
          </Group>
        </Card.Section>

        <Stack mt="md" gap="lg">
          {/* Key Metrics Grid */}
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing={{ base: 'xs', sm: 'md' }}>
            {/* Monthly EMI - Highlighted */}
            <Card withBorder radius="md" p="md" style={{ backgroundColor: '#e3f2fd' }}>
              <Group gap="xs" mb="xs">
                <ThemeIcon size="sm" variant="transparent" color="blue">
                  <IconCurrencyRupee size={16} />
                </ThemeIcon>
                <Text size="sm" c="blue.7" fw={500}>Monthly EMI</Text>
              </Group>
              <NumberFormatter
                value={result.monthlyPayment}
                thousandSeparator=","
                prefix="₹"
                decimalScale={2}
                style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1565c0' }}
              />
            </Card>

            {/* Principal Amount */}
            <Card withBorder radius="md" p="md">
              <Group gap="xs" mb="xs">
                <ThemeIcon size="sm" variant="transparent" color="gray">
                  <IconCurrencyRupee size={16} />
                </ThemeIcon>
                <Text size="sm" c="gray.7" fw={500}>Principal amount</Text>
              </Group>
              <NumberFormatter
                value={result.principal}
                thousandSeparator=","
                prefix="₹"
                decimalScale={2}
                style={{ fontSize: '1.25rem', fontWeight: 600 }}
              />
            </Card>

            {/* Total Interest */}
            <Card withBorder radius="md" p="md">
              <Group gap="xs" mb="xs">
                <ThemeIcon size="sm" variant="transparent" color="orange">
                  <IconTrendingUp size={16} />
                </ThemeIcon>
                <Text size="sm" c="orange.7" fw={500}>Total interest</Text>
              </Group>
              <NumberFormatter
                value={result.totalInterest}
                thousandSeparator=","
                prefix="₹"
                decimalScale={2}
                style={{ fontSize: '1.25rem', fontWeight: 600 }}
              />
            </Card>
          </SimpleGrid>

          {/* Total Amount */}
          <Card withBorder radius="md" p="md" style={{ backgroundColor: '#f5f5f5' }}>
            <Group justify="space-between" align="center">
              <Box>
                <Group gap="xs" mb="xs">
                  <ThemeIcon size="sm" variant="transparent" color="dark">
                    <IconCurrencyRupee size={16} />
                  </ThemeIcon>
                  <Text size="sm" c="dark.7" fw={500}>Total amount</Text>
                </Group>
                <NumberFormatter
                  value={result.totalPayment}
                  thousandSeparator=","
                  prefix="₹"
                  decimalScale={2}
                  style={{ fontSize: '1.75rem', fontWeight: 700 }}
                />
              </Box>
              <Badge variant="light" size="lg" color="blue">
                {result.years} Years
              </Badge>
            </Group>
          </Card>

          <Divider />

          {/* Interest vs Principal Analysis */}
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={4}>Interest vs Principal</Title>
              <Group gap="lg">
                <Group gap="xs">
                  <Box w={12} h={12} bg="blue.6" style={{ borderRadius: 2 }} />
                  <Text size="sm" c="dimmed">Principal ({principalPercentage.toFixed(1)}%)</Text>
                </Group>
                <Group gap="xs">
                  <Box w={12} h={12} bg="gray.4" style={{ borderRadius: 2 }} />
                  <Text size="sm" c="dimmed">Interest ({interestPercentage.toFixed(1)}%)</Text>
                </Group>
              </Group>
            </Group>

            <Progress.Root size={24} radius="xl">
              <Progress.Section value={principalPercentage} color="blue">
                <Progress.Label>{principalPercentage.toFixed(1)}%</Progress.Label>
              </Progress.Section>
              <Progress.Section value={interestPercentage} color="gray">
                <Progress.Label>{interestPercentage.toFixed(1)}%</Progress.Label>
              </Progress.Section>
            </Progress.Root>

            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
              <Group gap="xs">
                <Text size="sm" c="dimmed">Principal:</Text>
                <NumberFormatter
                  value={result.principal}
                  thousandSeparator=","
                  prefix="₹"
                  size="sm"
                  fw={500}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </Group>
              <Group gap="xs">
                <Text size="sm" c="dimmed">Interest:</Text>
                <NumberFormatter
                  value={result.totalInterest}
                  thousandSeparator=","
                  prefix="₹"
                  size="sm"
                  fw={500}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </Group>
            </SimpleGrid>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}

export default Results