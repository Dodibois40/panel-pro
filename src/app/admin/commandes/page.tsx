'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button, Input, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'
import { objectsToCSV, downloadCSV, ORDER_EXPORT_COLUMNS } from '@/lib/export'

type OrderStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  IN_PRODUCTION: { label: 'En production', color: 'bg-purple-100 text-purple-800' },
  READY: { label: 'Prête', color: 'bg-green-100 text-green-800' },
  SHIPPED: { label: 'Expédiée', color: 'bg-cyan-100 text-cyan-800' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
}

const STATUS_ACTIONS: Record<string, { next: OrderStatus; label: string }[]> = {
  PENDING: [
    { next: 'CONFIRMED', label: 'Confirmer' },
    { next: 'CANCELLED', label: 'Annuler' },
  ],
  CONFIRMED: [
    { next: 'IN_PRODUCTION', label: 'Lancer en production' },
  ],
  IN_PRODUCTION: [
    { next: 'READY', label: 'Marquer prête' },
  ],
  READY: [
    { next: 'SHIPPED', label: 'Marquer expédiée' },
    { next: 'COMPLETED', label: 'Terminer (retrait)' },
  ],
  SHIPPED: [
    { next: 'DELIVERED', label: 'Marquer livrée' },
  ],
  DELIVERED: [
    { next: 'COMPLETED', label: 'Terminer' },
  ],
}

export default function AdminCommandesPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') as OrderStatus | null

  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(initialStatus || undefined)
  const [search, setSearch] = useState('')

  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.order.listAll.useQuery({
    status: statusFilter,
    search: search || undefined,
    limit: 100,
  })

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.listAll.invalidate()
    },
  })

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateStatus.mutateAsync({ orderId, status: newStatus })
  }

  const handleExportCSV = () => {
    if (!data?.orders) return

    const exportData = data.orders.map(order => ({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customer.name || order.customer.email,
      customerEmail: order.customer.email,
      projectName: order.projectName || '',
      status: STATUS_LABELS[order.status]?.label || order.status,
      partsCount: order.parts.reduce((sum, p) => sum + p.quantity, 0),
      totalHT: Number(order.totalPrice),
      totalTTC: Number(order.totalPrice) * 1.2,
      deliveryOption: order.deliveryOption,
    }))

    const csv = objectsToCSV(exportData, ORDER_EXPORT_COLUMNS)
    const date = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `commandes-${date}.csv`)
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion des commandes</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} commande(s) au total
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={!data?.orders.length}
        >
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />

        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={statusFilter || ''}
          onChange={e => setStatusFilter(e.target.value as OrderStatus || undefined)}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data?.orders.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <div className="text-muted-foreground">
            Aucune commande trouvée
          </div>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Commande</th>
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium">Pièces</th>
                <th className="text-left p-4 font-medium">Total TTC</th>
                <th className="text-left p-4 font-medium">Statut</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.orders.map(order => {
                const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100' }
                const actions = STATUS_ACTIONS[order.status] || []
                const totalParts = order.parts.reduce((sum, p) => sum + p.quantity, 0)

                return (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <Link href={`/commande/${order.id}`} className="font-mono font-medium hover:text-primary">
                        {order.orderNumber}
                      </Link>
                      {order.projectName && (
                        <div className="text-sm text-muted-foreground">{order.projectName}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{order.customer.name || order.customer.email}</div>
                      {order.customer.company && (
                        <div className="text-sm text-muted-foreground">{order.customer.company}</div>
                      )}
                    </td>
                    <td className="p-4">
                      {totalParts}
                    </td>
                    <td className="p-4 font-medium">
                      {(Number(order.totalPrice) * 1.2).toFixed(2)} €
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {actions.map(action => (
                          <Button
                            key={action.next}
                            size="sm"
                            variant={action.next === 'CANCELLED' ? 'outline' : 'default'}
                            className={action.next === 'CANCELLED' ? 'text-destructive' : ''}
                            onClick={() => handleStatusChange(order.id, action.next)}
                            disabled={updateStatus.isPending}
                          >
                            {action.label}
                          </Button>
                        ))}
                        <Link href={`/commande/${order.id}`}>
                          <Button size="sm" variant="ghost">
                            Détails
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
