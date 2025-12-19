'use client'

import Link from 'next/link'

import { Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  IN_PRODUCTION: { label: 'En production', color: 'bg-purple-100 text-purple-800' },
  READY: { label: 'Prête', color: 'bg-green-100 text-green-800' },
}

export default function AdminDashboardPage() {
  const { data: orderStats, isLoading: loadingOrders } = trpc.order.stats.useQuery()
  const { data: clientStats, isLoading: loadingClients } = trpc.user.stats.useQuery()
  const { data: recentOrders } = trpc.order.listAll.useQuery({ limit: 5 })

  if (loadingOrders || loadingClients) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble de l&apos;activité
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Commandes en attente</div>
            <span className="text-2xl">⏳</span>
          </div>
          <div className="text-3xl font-bold mt-2 text-amber-600">{orderStats?.pendingOrders ?? 0}</div>
          <Link href="/admin/commandes?status=PENDING" className="text-sm text-primary hover:underline mt-2 inline-block">
            Voir les commandes →
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">En production</div>
            <span className="text-2xl">🔧</span>
          </div>
          <div className="text-3xl font-bold mt-2 text-purple-600">{orderStats?.inProductionOrders ?? 0}</div>
          <Link href="/admin/commandes?status=IN_PRODUCTION" className="text-sm text-primary hover:underline mt-2 inline-block">
            Voir les commandes →
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Ce mois</div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold mt-2">{orderStats?.ordersThisMonth ?? 0}</div>
          <div className="text-sm text-muted-foreground mt-1">nouvelles commandes</div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Chiffre d&apos;affaires</div>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold mt-2 text-primary">
            {((orderStats?.totalRevenue ?? 0) * 1.2).toFixed(0)} €
          </div>
          <div className="text-sm text-muted-foreground mt-1">TTC confirmé</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Dernières commandes */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-sm text-primary hover:underline">
              Voir tout →
            </Link>
          </div>
          {recentOrders?.orders.length ? (
            <div className="space-y-3">
              {recentOrders.orders.map(order => {
                const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100' }
                return (
                  <Link
                    key={order.id}
                    href={`/commande/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-mono font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer.name || order.customer.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <div className="text-right">
                        <div className="font-medium">{(Number(order.totalPrice) * 1.2).toFixed(2)} €</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune commande récente
            </div>
          )}
        </div>

        {/* Stats clients */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques clients</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total clients</span>
                <span className="text-2xl font-bold">{clientStats?.totalUsers ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nouveaux ce mois</span>
                <span className="text-2xl font-bold text-green-600">+{clientStats?.newThisMonth ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Clients actifs</span>
                <span className="text-2xl font-bold">{clientStats?.withOrders ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Taux de conversion</span>
                <span className="text-2xl font-bold text-primary">{clientStats?.conversionRate ?? 0}%</span>
              </div>
            </div>
            <Link href="/admin/clients" className="text-sm text-primary hover:underline mt-4 inline-block">
              Gérer les clients →
            </Link>
          </div>

          {/* Top clients */}
          {clientStats?.topClients && clientStats.topClients.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Top clients</h2>
              <div className="space-y-3">
                {clientStats.topClients.slice(0, 3).map((client, index) => (
                  <div key={client.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{client.name || client.email}</div>
                      <div className="text-xs text-muted-foreground">{client.orderCount} cmd</div>
                    </div>
                    <div className="font-bold text-primary">{client.totalSpent.toFixed(0)} €</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Actions rapides</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/commandes"
          className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="text-2xl mb-2">📦</div>
          <h3 className="font-semibold">Gérer les commandes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Confirmer et suivre les commandes
          </p>
        </Link>

        <Link
          href="/admin/panneaux"
          className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="text-2xl mb-2">🪵</div>
          <h3 className="font-semibold">Catalogue panneaux</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gérer les références disponibles
          </p>
        </Link>

        <Link
          href="/admin/tarifs"
          className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="text-2xl mb-2">💲</div>
          <h3 className="font-semibold">Configuration tarifs</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Paramétrer les prix
          </p>
        </Link>

        <Link
          href="/admin/clients"
          className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-semibold">Gestion clients</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Clients et remises
          </p>
        </Link>
      </div>
    </div>
  )
}
