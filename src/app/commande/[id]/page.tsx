'use client'

import { use } from 'react'
import Link from 'next/link'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'
import { DownloadPDFButton } from '@/components/pdf/DownloadPDFButton'
import { OrderPDF } from '@/components/pdf'

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

const DELIVERY_LABELS: Record<string, string> = {
  PICKUP: 'Retrait sur place',
  DELIVERY: 'Livraison standard',
  EXPRESS: 'Livraison express',
  TRANSPORT: 'Transport spécial',
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: order, isLoading, error } = trpc.order.getById.useQuery(id)
  const cancelOrder = trpc.order.cancel.useMutation()

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return
    await cancelOrder.mutateAsync(id)
    window.location.reload()
  }

  if (isLoading) {
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

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Commande introuvable</h1>
            <p className="text-muted-foreground">
              Cette commande n&apos;existe pas ou vous n&apos;y avez pas accès.
            </p>
            <Link href="/mes-commandes">
              <Button>Retour aux commandes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }
  const canCancel = ['DRAFT', 'PENDING'].includes(order.status)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Link href="/mes-commandes" className="text-sm text-muted-foreground hover:text-foreground">
            ← Retour aux commandes
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Commande {order.orderNumber}</h1>
            {order.projectName && (
              <p className="text-muted-foreground mt-1">{order.projectName}</p>
            )}
          </div>
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>

        {/* Barre de progression pour commandes en cours */}
        {['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY'].includes(order.status) && (
          <div className="rounded-xl border bg-card p-6 mb-8">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className={order.status === 'PENDING' ? 'font-medium text-primary' : 'text-muted-foreground'}>
                En attente
              </span>
              <span className={order.status === 'CONFIRMED' ? 'font-medium text-primary' : 'text-muted-foreground'}>
                Confirmée
              </span>
              <span className={order.status === 'IN_PRODUCTION' ? 'font-medium text-primary' : 'text-muted-foreground'}>
                En production
              </span>
              <span className={order.status === 'READY' ? 'font-medium text-green-600' : 'text-muted-foreground'}>
                Prête
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: order.status === 'PENDING' ? '25%'
                    : order.status === 'CONFIRMED' ? '50%'
                    : order.status === 'IN_PRODUCTION' ? '75%'
                    : '100%'
                }}
              />
            </div>
            {order.status === 'READY' && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                <span className="text-green-700 dark:text-green-400 font-medium">
                  Votre commande est prête à être récupérée !
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Contenu principal */}
          <div className="space-y-8">
            {/* Timeline */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Suivi</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <div className="font-medium">Commande créée</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                {order.confirmedAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Confirmée</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.confirmedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {order.producedAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Production terminée</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.producedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {order.completedAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Terminée</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.completedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pièces */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                Pièces ({order.parts.length})
              </h2>
              <div className="space-y-4">
                {order.parts.map((part) => (
                  <div key={part.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{part.reference}</div>
                        <div className="text-sm text-muted-foreground">
                          {part.panel.name} • {part.length} x {part.width} mm
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantité: {part.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {Number(part.calculatedPrice).toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Récapitulatif prix */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Récapitulatif</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{Number(order.totalPrice).toFixed(2)} €</span>
                </div>
                {Number(order.discountApplied) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise</span>
                    <span>-{Number(order.discountApplied).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA ({Number(order.taxRate)}%)</span>
                  <span>{(Number(order.totalPrice) * Number(order.taxRate) / 100).toFixed(2)} €</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total TTC</span>
                    <span className="text-primary">
                      {(Number(order.totalPrice) * (1 + Number(order.taxRate) / 100)).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Livraison */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Livraison</h2>
              <div className="text-sm">
                <div className="font-medium">{DELIVERY_LABELS[order.deliveryOption]}</div>
                {order.deliveryAddress && (
                  <div className="text-muted-foreground mt-2 whitespace-pre-line">
                    {order.deliveryAddress}
                  </div>
                )}
                {order.deliveryDate && (
                  <div className="text-muted-foreground mt-2">
                    Date prévue: {new Date(order.deliveryDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <DownloadPDFButton
                document={
                  <OrderPDF
                    orderNumber={order.orderNumber}
                    projectName={order.projectName}
                    createdAt={order.createdAt}
                    customer={{
                      name: order.customer.name,
                      email: order.customer.email,
                      company: order.customer.company,
                      phone: order.customer.phone,
                    }}
                    parts={order.parts.map(p => ({
                      reference: p.reference,
                      panelName: p.panel.name,
                      length: p.length,
                      width: p.width,
                      quantity: p.quantity,
                      calculatedPrice: Number(p.calculatedPrice),
                    }))}
                    deliveryOption={order.deliveryOption}
                    deliveryAddress={order.deliveryAddress}
                    totalPrice={Number(order.totalPrice)}
                    taxRate={Number(order.taxRate)}
                    notes={order.notes}
                  />
                }
                fileName={`devis-${order.orderNumber}.pdf`}
              >
                Télécharger le devis PDF
              </DownloadPDFButton>

              {canCancel && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleCancel}
                  disabled={cancelOrder.isPending}
                >
                  {cancelOrder.isPending ? 'Annulation...' : 'Annuler la commande'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
