import { useState } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Group, 
  Stack, 
  Title, 
  Text,
  Pagination,
  Badge,
  NumberFormatter,
  ActionIcon,
  Divider,
  Menu
} from '@mantine/core'
import { 
  IconX, 
  IconTable,
  IconDownload,
  IconFileTypeCsv,
  IconFileTypePdf
} from '@tabler/icons-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'
import { trackExport } from '../utils/analytics'

/**
 * Modern Amortization Table Component using Mantine UI
 */
const AmortizationTable = ({ schedule, currency = 'USD', onClose }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  if (!schedule || schedule.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Title order={3} size="h4">Amortization Schedule</Title>
            <ActionIcon variant="subtle" onClick={onClose}>
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Card.Section>
        <Text ta="center" py={40} c="dimmed">
          No amortization data available
        </Text>
      </Card>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(schedule.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = schedule.slice(startIndex, endIndex)

  const formatCurrency = (amount) => (
    <NumberFormatter
      value={amount}
      thousandSeparator=","
      prefix="₹"
      decimalScale={2}
    />
  )

  // Export to CSV
  const exportToCSV = () => {
    const csvData = schedule.map(payment => ({
      'Payment #': payment.payment,
      'Monthly Payment': payment.monthlyPayment.toFixed(2),
      'Principal': payment.principalPayment.toFixed(2),
      'Interest': payment.interestPayment.toFixed(2),
      'Balance': payment.remainingBalance.toFixed(2)
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `amortization_schedule_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Track export usage
    trackExport('csv', schedule.length)
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Amortization Schedule', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare table data
    const tableData = schedule.map(payment => [
      payment.payment,
      `₹${payment.monthlyPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `₹${payment.principalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `₹${payment.interestPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `₹${payment.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ])

    // Add table
    doc.autoTable({
      head: [['Payment #', 'Monthly Payment', 'Principal', 'Interest', 'Balance']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })
    
    doc.save(`amortization_schedule_${new Date().toISOString().split('T')[0]}.pdf`)
    
    // Track export usage
    trackExport('pdf', schedule.length)
  }

  // Calculate totals for current page
  const pageTotals = currentData.reduce(
    (acc, payment) => ({
      monthlyPayment: acc.monthlyPayment + payment.monthlyPayment,
      principalPayment: acc.principalPayment + payment.principalPayment,
      interestPayment: acc.interestPayment + payment.interestPayment,
    }),
    { monthlyPayment: 0, principalPayment: 0, interestPayment: 0 }
  )

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <IconTable size={20} />
            <Title order={3} size="h4">Amortization Schedule</Title>
          </Group>
          <Group gap="xs">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                >
                  Export
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Export Format</Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={14} />}
                  onClick={exportToCSV}
                >
                  Download as CSV
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypePdf size={14} />}
                  onClick={exportToPDF}
                >
                  Download as PDF
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon variant="subtle" onClick={onClose}>
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Card.Section>

      <Stack mt="md" gap="md">
        {/* Summary Info */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Payment breakdown for {schedule.length} payments
          </Text>
          <Badge variant="light" color="blue">
            Page {currentPage} of {totalPages}
          </Badge>
        </Group>

        {/* Table */}
        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={100}>Payment #</Table.Th>
              <Table.Th ta="right" w={140}>Monthly Payment</Table.Th>
              <Table.Th ta="right" w={130}>Principal</Table.Th>
              <Table.Th ta="right" w={130}>Interest</Table.Th>
              <Table.Th ta="right" w={130}>Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentData.map((payment, index) => (
              <Table.Tr key={payment.payment}>
                <Table.Td>
                  <Badge variant="outline" size="sm">
                    {payment.payment}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right" fw={500}>
                  {formatCurrency(payment.monthlyPayment)}
                </Table.Td>
                <Table.Td ta="right">
                  {formatCurrency(payment.principalPayment)}
                </Table.Td>
                <Table.Td ta="right">
                  {formatCurrency(payment.interestPayment)}
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" c={payment.remainingBalance <= 0 ? 'green' : 'dark'}>
                    {formatCurrency(payment.remainingBalance)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          
          {/* Page Totals */}
          <Table.Tbody>
            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
              <Table.Td fw={600}>Page Totals</Table.Td>
              <Table.Td ta="right" fw={600}>
                {formatCurrency(pageTotals.monthlyPayment)}
              </Table.Td>
              <Table.Td ta="right" fw={600}>
                {formatCurrency(pageTotals.principalPayment)}
              </Table.Td>
              <Table.Td ta="right" fw={600}>
                {formatCurrency(pageTotals.interestPayment)}
              </Table.Td>
              <Table.Td ta="right">-</Table.Td>
            </Table.Tr>
          </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Divider />
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Showing {startIndex + 1}-{Math.min(endIndex, schedule.length)} of {schedule.length} payments
              </Text>
              
              <Pagination 
                value={currentPage} 
                onChange={setCurrentPage} 
                total={totalPages}
                size="sm"
                siblings={1}
                boundaries={1}
                withEdges
              />
            </Group>
          </>
        )}

      </Stack>
    </Card>
  )
}

export default AmortizationTable