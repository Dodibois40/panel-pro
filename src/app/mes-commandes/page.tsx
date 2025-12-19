'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'

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

const STATUS_FILTERS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'IN_PRODUCTION', label: 'En production' },
  { value: 'READY', label: 'Prêtes' },
  { value: 'COMPLETED', label: 'Terminées' },
  { value: 'CANCELLED', label: 'Annulées' },
]

export default function MesCommandesPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')

  const { data, isLoading } = trpc.order.myOrders.useQuery(
    statusFilter === 'ALL' ? undefined : { status: statusFilter },
    { enabled: !!session }
  )

  // Calcul des statistiques
  const stats = data?.orders ? {
    total: data.total,
    inProgress: data.orders.filter(o => ['PENDING', 'CONFIRMED', 'IN_PRODUCTION'].includes(o.status)).length,
    ready: data.orders.filter(o => o.status === 'READY').length,
    totalSpent: data.orders
      .filter(o => !['CANCELLED', 'DRAFT'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.totalPrice), 0),
  } : null

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Connexion requise</h1>
            <p className="text-muted-foreground">
              Vous devez être connecté pour voir vos commandes.
            </p>
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* En-tête avec salutation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Bonjour{session.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''} !
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici le récapitulatif de vos commandes
            </p>
          </div>
          <Link href="/configurateur">
            <Button size="lg">+ Nouvelle commande</Button>
          </Link>
        </div>

        {/* Cartes de statistiques */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total commandes</div>
              <div className="mt-2 text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">En cours</div>
              <div className="mt-2 text-3xl font-bold text-amber-600">{stats.inProgress}</div>
              {stats.inProgress > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  en attente ou en production
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Prêtes à retirer</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.ready}</div>
              {stats.ready > 0 && (
                <div className="mt-1 text-xs text-green-600 font-medium">
                  Disponibles maintenant
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total dépensé</div>
              <div className="mt-2 text-3xl font-bold text-primary">
                {stats.totalSpent.toFixed(0)} €
              </div>
              <div className="mt-1 text-xs text-muted-foreground">HT</div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Link
            href="/configurateur"
            className="rounded-xl border bg-card p-4 hover:border-primary transition-colors flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              +
            </div>
            <div>
              <div className="font-medium">Nouveau devis</div>
              <div className="text-sm text-muted-foreground">Configurer des pièces</div>
            </div>
          </Link>
          <Link
            href="/catalogue"
            className="rounded-xl border bg-card p-4 hover:border-primary transition-colors flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <div className="font-medium">Catalogue</div>
              <div className="text-sm text-muted-foreground">Voir les panneaux</div>
            </div>
          </Link>
          <button
            onClick={() => setStatusFilter('READY')}
            className="rounded-xl border bg-card p-4 hover:border-primary transition-colors flex items-center gap-4 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
              ✓
            </div>
            <div>
              <div className="font-medium">Commandes prêtes</div>
              <div className="text-sm text-muted-foreground">À récupérer</div>
            </div>
          </button>
        </div>

        {/* Filtres */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Historique des commandes</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUS_FILTERS.map(filter => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-lg font-medium mb-2">
              {statusFilter === 'ALL'
                ? 'Aucune commande pour le moment'
                : 'Aucune commande avec ce statut'
              }
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Commencez par configurer vos panneaux sur-mesure avec notre configurateur intuitif.
            </p>
            <Link href="/configurateur">
              <Button size="lg">Créer ma première commande</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.orders.map(order => {
              const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100' }
              const totalParts = order.parts.reduce((sum, p) => sum + p.quantity, 0)

              return (
                <Link
                  key={order.id}
                  href={`/commande/${order.id}`}
                  className="block rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-lg">{order.orderNumber}</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {order.projectName && (
                        <div className="font-medium text-foreground">{order.projectName}</div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {totalParts} pièce(s) • Créée le{' '}
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {(Number(order.totalPrice) * 1.2).toFixed(2)} €
                      </div>
                      <div className="text-sm text-muted-foreground">TTC</div>
                    </div>
                  </div>

                  {/* Barre de progression pour les commandes en cours */}
                  {['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY'].includes(order.status) && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className={order.status === 'PENDING' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                          En attente
                        </span>
                        <div className="flex-1 h-1 bg-muted rounded">
                          <div
                            className="h-full bg-primary rounded transition-all"
                            style={{
                              width: order.status === 'PENDING' ? '25%'
                                : order.status === 'CONFIRMED' ? '50%'
                                : order.status === 'IN_PRODUCTION' ? '75%'
                                : '100%'
                            }}
                          />
                        </div>
                        <span className={order.status === 'READY' ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                          Prête
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Aperçu des pièces */}
                  {order.parts.length > 0 && !['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY'].includes(order.status) && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {order.parts.slice(0, 3).map(part => (
                          <div
                            key={part.id}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {part.reference} ({part.quantity})
                          </div>
                        ))}
                        {order.parts.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2 py-1">
                            +{order.parts.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}

            {data && data.total > data.orders.length && (
              <div className="text-center text-muted-foreground text-sm pt-4">
                Affichage de {data.orders.length} sur {data.total} commandes
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
