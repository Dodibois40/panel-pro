/**
 * Utilitaires d'export de données
 */

/**
 * Convertit un tableau d'objets en CSV
 */
export function objectsToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string; transform?: (value: unknown) => string }[]
): string {
  // En-têtes
  const headers = columns.map(col => `"${col.label}"`).join(';')

  // Lignes de données
  const rows = data.map(item =>
    columns
      .map(col => {
        const value = item[col.key]
        const transformed = col.transform ? col.transform(value) : String(value ?? '')
        // Échapper les guillemets et envelopper dans des guillemets
        return `"${transformed.replace(/"/g, '""')}"`
      })
      .join(';')
  )

  return [headers, ...rows].join('\n')
}

/**
 * Déclenche le téléchargement d'un fichier CSV
 */
export function downloadCSV(csv: string, filename: string): void {
  // Ajouter BOM pour Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Formate une date pour l'export
 */
export function formatDateForExport(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formate un prix pour l'export
 */
export function formatPriceForExport(price: number | string): string {
  return Number(price).toFixed(2).replace('.', ',')
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATIONS D'EXPORT PRÉDÉFINIES
// ═══════════════════════════════════════════════════════════════════════════

export const ORDER_EXPORT_COLUMNS = [
  { key: 'orderNumber' as const, label: 'N° Commande' },
  { key: 'createdAt' as const, label: 'Date', transform: (v: unknown) => formatDateForExport(v as string) },
  { key: 'customerName' as const, label: 'Client' },
  { key: 'customerEmail' as const, label: 'Email' },
  { key: 'projectName' as const, label: 'Projet' },
  { key: 'status' as const, label: 'Statut' },
  { key: 'partsCount' as const, label: 'Nb Pièces' },
  { key: 'totalHT' as const, label: 'Total HT', transform: (v: unknown) => formatPriceForExport(v as number) },
  { key: 'totalTTC' as const, label: 'Total TTC', transform: (v: unknown) => formatPriceForExport(v as number) },
  { key: 'deliveryOption' as const, label: 'Livraison' },
]

export const CLIENT_EXPORT_COLUMNS = [
  { key: 'name' as const, label: 'Nom' },
  { key: 'email' as const, label: 'Email' },
  { key: 'company' as const, label: 'Société' },
  { key: 'phone' as const, label: 'Téléphone' },
  { key: 'createdAt' as const, label: 'Inscrit le', transform: (v: unknown) => formatDateForExport(v as string) },
  { key: 'orderCount' as const, label: 'Nb Commandes' },
  { key: 'totalSpent' as const, label: 'Total dépensé', transform: (v: unknown) => formatPriceForExport(v as number) },
  { key: 'discountPercent' as const, label: 'Remise %' },
]
