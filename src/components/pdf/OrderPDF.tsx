'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// Styles PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: '#6b7280',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
    backgroundColor: '#f9fafb',
  },
  col1: { width: '25%' },
  col2: { width: '30%' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#1f2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    width: 150,
    textAlign: 'right',
    paddingRight: 20,
    color: '#6b7280',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  grandTotalLabel: {
    width: 150,
    textAlign: 'right',
    paddingRight: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
})

interface OrderPart {
  reference: string
  panelName?: string
  length: number
  width: number
  quantity: number
  calculatedPrice: number
}

interface OrderPDFProps {
  orderNumber: string
  projectName?: string | null
  createdAt: Date | string
  customer: {
    name?: string | null
    email: string
    company?: string | null
    phone?: string | null
    address?: string | null
  }
  parts: OrderPart[]
  deliveryOption: string
  deliveryAddress?: string | null
  totalPrice: number
  taxRate: number
  notes?: string | null
}

const DELIVERY_LABELS: Record<string, string> = {
  PICKUP: 'Retrait sur place',
  DELIVERY: 'Livraison standard',
  EXPRESS: 'Livraison express',
  TRANSPORT: 'Transport spécial',
}

export function OrderPDF({
  orderNumber,
  projectName,
  createdAt,
  customer,
  parts,
  deliveryOption,
  deliveryAddress,
  totalPrice,
  taxRate,
  notes,
}: OrderPDFProps) {
  const date = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const subtotal = totalPrice
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Panel Pro</Text>
            <Text>Découpe de panneaux sur mesure</Text>
          </View>
          <View style={styles.headerRight}>
            <Text>Date: {date}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
              N° {orderNumber}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {projectName ? `Devis - ${projectName}` : 'Devis'}
        </Text>

        {/* Client info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{customer.name || '-'}</Text>
          </View>
          {customer.company && (
            <View style={styles.row}>
              <Text style={styles.label}>Société:</Text>
              <Text style={styles.value}>{customer.company}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{customer.email}</Text>
          </View>
          {customer.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Téléphone:</Text>
              <Text style={styles.value}>{customer.phone}</Text>
            </View>
          )}
        </View>

        {/* Delivery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Livraison</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mode:</Text>
            <Text style={styles.value}>{DELIVERY_LABELS[deliveryOption] || deliveryOption}</Text>
          </View>
          {deliveryAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>{deliveryAddress}</Text>
            </View>
          )}
        </View>

        {/* Parts table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail des pièces</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Référence</Text>
              <Text style={styles.col2}>Panneau</Text>
              <Text style={styles.col3}>Dimensions</Text>
              <Text style={styles.col4}>Qté</Text>
              <Text style={styles.col5}>Prix HT</Text>
            </View>
            {/* Rows */}
            {parts.map((part, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.col1}>{part.reference}</Text>
                <Text style={styles.col2}>{part.panelName || '-'}</Text>
                <Text style={styles.col3}>{part.length} x {part.width}</Text>
                <Text style={styles.col4}>{part.quantity}</Text>
                <Text style={styles.col5}>{part.calculatedPrice.toFixed(2)} €</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT:</Text>
            <Text style={styles.totalValue}>{subtotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({taxRate}%):</Text>
            <Text style={styles.totalValue}>{tax.toFixed(2)} €</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total TTC:</Text>
            <Text style={styles.grandTotalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Remarques:</Text>
            <Text>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Panel Pro - Découpe de panneaux sur mesure</Text>
          <Text>Devis valable 30 jours - TVA non applicable, art. 293 B du CGI (si applicable)</Text>
        </View>
      </Page>
    </Document>
  )
}
