import { Card, Title, Text, Group, Stack, ThemeIcon, Box } from '@mantine/core'
import { IconChartPie, IconCurrencyRupee, IconTrendingUp } from '@tabler/icons-react'

/**
 * Loan Visualization Component
 * Shows pie chart and breakdown of loan components
 */
const LoanVisualization = ({ result, currency = 'USD' }) => {
  if (!result) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group gap="xs">
            <IconChartPie size={20} />
            <Title order={3} size="h4">Loan Breakdown</Title>
          </Group>
        </Card.Section>

        <Stack align="center" py={60}>
          <ThemeIcon size={60} radius="xl" variant="light" color="blue">
            <IconChartPie size={30} />
          </ThemeIcon>
          <Title order={4} ta="center">Visualization Ready</Title>
          <Text c="dimmed" ta="center" size="sm">
            Calculate a loan to see the breakdown visualization
          </Text>
        </Stack>
      </Card>
    )
  }

  const principalPercentage = (result.principal / result.totalPayment) * 100
  const interestPercentage = (result.totalInterest / result.totalPayment) * 100

  // Calculate angles for pie chart (in degrees)
  const principalAngle = (principalPercentage / 100) * 360
  const interestAngle = (interestPercentage / 100) * 360

  // Generate SVG path for pie chart
  const generatePieSlice = (startAngle, endAngle, radius = 80, centerX = 100, centerY = 100) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle)
    const end = polarToCartesian(centerX, centerY, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ")
  }

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group gap="xs">
          <IconChartPie size={20} />
          <Title order={3} size="h4">Loan Breakdown</Title>
        </Group>
      </Card.Section>

      <Stack mt="md" gap="lg">
        {/* Pie Chart */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Principal slice */}
            <path
              d={generatePieSlice(0, principalAngle)}
              fill="#2196f3"
              stroke="white"
              strokeWidth="2"
            />
            {/* Interest slice */}
            <path
              d={generatePieSlice(principalAngle, 360)}
              fill="#ff9800"
              stroke="white"
              strokeWidth="2"
            />
            {/* Center circle for donut effect */}
            <circle
              cx="100"
              cy="100"
              r="30"
              fill="white"
              stroke="#e0e0e0"
              strokeWidth="1"
            />
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#333"
            >
              Total
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              fontSize="10"
              fill="#666"
            >
              ₹{Math.round(result.totalPayment / 100000)}L
            </text>
          </svg>
        </div>

        {/* Legend and Details */}
        <Stack gap="sm">
          {/* Principal */}
          <Card withBorder radius="sm" p="sm" style={{ backgroundColor: '#e3f2fd' }}>
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Box w={12} h={12} bg="#2196f3" style={{ borderRadius: 2 }} />
                <div>
                  <Text size="sm" fw={500} c="blue.7">Principal Amount</Text>
                  <Text size="xs" c="blue.6">{principalPercentage.toFixed(1)}% of total</Text>
                </div>
              </Group>
              <div style={{ textAlign: 'right' }}>
                <Text size="sm" fw={600} c="blue.7">
                  ₹{(result.principal / 100000).toFixed(1)}L
                </Text>
              </div>
            </Group>
          </Card>

          {/* Interest */}
          <Card withBorder radius="sm" p="sm" style={{ backgroundColor: '#fff3e0' }}>
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Box w={12} h={12} bg="#ff9800" style={{ borderRadius: 2 }} />
                <div>
                  <Text size="sm" fw={500} c="orange.7">Total Interest</Text>
                  <Text size="xs" c="orange.6">{interestPercentage.toFixed(1)}% of total</Text>
                </div>
              </Group>
              <div style={{ textAlign: 'right' }}>
                <Text size="sm" fw={600} c="orange.7">
                  ₹{(result.totalInterest / 100000).toFixed(1)}L
                </Text>
              </div>
            </Group>
          </Card>
        </Stack>

        {/* Key Insights */}
        <Card withBorder radius="sm" p="sm" style={{ backgroundColor: '#f8f9fa' }}>
          <Stack gap="xs">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="transparent" color="gray">
                <IconTrendingUp size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Key Insights</Text>
            </Group>
            
            <Text size="xs" c="dimmed">
              • You'll pay <Text component="span" fw={600} c="orange.7">
                ₹{Math.round(result.totalInterest / 1000)}K
              </Text> in interest over {result.years} years
            </Text>
            
            <Text size="xs" c="dimmed">
              • Interest represents <Text component="span" fw={600}>
                {interestPercentage.toFixed(1)}%
              </Text> of your total payments
            </Text>

            {interestPercentage > 20 && (
              <Text size="xs" c="orange.7" fw={500}>
                💡 Consider a shorter term to reduce total interest
              </Text>
            )}
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}

export default LoanVisualization