'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button, Spinner, Input } from '@/components/ui'
import { trpc } from '@/lib/trpc'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  CLIENT: { label: 'Client', color: 'bg-blue-100 text-blue-800' },
  ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  PRODUCTION: { label: 'Production', color: 'bg-amber-100 text-amber-800' },
}

export default function AdminClientsPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENT' | 'ADMIN' | 'PRODUCTION'>('ALL')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [editingDiscount, setEditingDiscount] = useState<{ id: string; value: number } | null>(null)

  const { data, isLoading, refetch } = trpc.user.list.useQuery({
    search: search || undefined,
    role: roleFilter,
  })

  const { data: stats } = trpc.user.stats.useQuery()
  const { data: selectedUser, isLoading: loadingUser } = trpc.user.getById.useQuery(
    selectedUserId!,
    { enabled: !!selectedUserId }
  )

  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingDiscount(null)
    },
  })

  const handleSaveDiscount = async () => {
    if (!editingDiscount) return
    await updateUser.mutateAsync({
      id: editingDiscount.id,
      discountRate: editingDiscount.value,
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestion des clients</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les clients et leurs remises
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Total clients</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalUsers}</div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Nouveaux ce mois</div>
            <div className="mt-2 text-3xl font-bold text-green-600">+{stats.newThisMonth}</div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Clients actifs</div>
            <div className="mt-2 text-3xl font-bold">{stats.withOrders}</div>
            <div className="text-xs text-muted-foreground mt-1">avec commandes</div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Taux conversion</div>
            <div className="mt-2 text-3xl font-bold text-primary">{stats.conversionRate}%</div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Liste des clients */}
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              {(['ALL', 'CLIENT', 'ADMIN', 'PRODUCTION'] as const).map(role => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role === 'ALL' ? 'Tous' : ROLE_LABELS[role]?.label || role}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Rôle</th>
                    <th className="text-center p-4 font-medium">Commandes</th>
                    <th className="text-right p-4 font-medium">Remise</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map(user => {
                    const roleInfo = ROLE_LABELS[user.role] || { label: user.role, color: 'bg-gray-100' }
                    const isEditing = editingDiscount?.id === user.id

                    return (
                      <tr
                        key={user.id}
                        className={`border-t hover:bg-muted/30 cursor-pointer ${selectedUserId === user.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <td className="p-4">
                          <div className="font-medium">{user.name || 'Sans nom'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.company && (
                            <div className="text-xs text-muted-foreground">{user.company}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {user.orderCount}
                        </td>
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editingDiscount.value}
                                onChange={e => setEditingDiscount({ ...editingDiscount, value: Number(e.target.value) })}
                                className="w-20 text-right"
                              />
                              <span>%</span>
                              <Button size="sm" onClick={handleSaveDiscount} disabled={updateUser.isPending}>
                                OK
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingDiscount(null)}>
                                X
                              </Button>
                            </div>
                          ) : (
                            <button
                              className="text-primary hover:underline"
                              onClick={e => {
                                e.stopPropagation()
                                setEditingDiscount({ id: user.id, value: Number(user.discountRate) || 0 })
                              }}
                            >
                              {Number(user.discountRate) ? `${user.discountRate}%` : '-'}
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation()
                              setSelectedUserId(user.id)
                            }}
                          >
                            Voir
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {data?.users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun client trouvé
                </div>
              )}

              {data && data.total > data.users.length && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Affichage de {data.users.length} sur {data.total} clients
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel détails client */}
        <div className="rounded-xl border bg-card p-6">
          {!selectedUserId ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">👤</div>
              Sélectionnez un client pour voir ses détails
            </div>
          ) : loadingUser ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">{selectedUser.name || 'Sans nom'}</h2>
                <p className="text-muted-foreground">{selectedUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground">Commandes</div>
                  <div className="text-2xl font-bold">{selectedUser.orderCount}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground">Total dépensé</div>
                  <div className="text-2xl font-bold text-primary">
                    {Number(selectedUser.totalSpent).toFixed(0)} €
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Informations</h3>
                <div className="text-sm space-y-1">
                  {selectedUser.company && (
                    <div><span className="text-muted-foreground">Société:</span> {selectedUser.company}</div>
                  )}
                  {selectedUser.phone && (
                    <div><span className="text-muted-foreground">Téléphone:</span> {selectedUser.phone}</div>
                  )}
                  {selectedUser.address && (
                    <div><span className="text-muted-foreground">Adresse:</span> {selectedUser.address}</div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Inscrit le:</span>{' '}
                    {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remise:</span>{' '}
                    <span className="font-medium text-primary">
                      {Number(selectedUser.discountRate) || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.orders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Dernières commandes</h3>
                  <div className="space-y-2">
                    {selectedUser.orders.slice(0, 5).map(order => (
                      <Link
                        key={order.id}
                        href={`/commande/${order.id}`}
                        className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm">{order.orderNumber}</span>
                          <span className="font-medium">{Number(order.totalPrice).toFixed(2)} €</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Top clients */}
      {stats?.topClients && stats.topClients.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Top 5 clients</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.topClients.map((client, index) => (
              <div
                key={client.id}
                className="rounded-xl border bg-card p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedUserId(client.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="truncate">
                    <div className="font-medium truncate">{client.name || client.email}</div>
                    {client.company && (
                      <div className="text-xs text-muted-foreground truncate">{client.company}</div>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">{client.totalSpent.toFixed(0)} €</div>
                <div className="text-xs text-muted-foreground">{client.orderCount} commandes</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
