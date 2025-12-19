'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { useConfiguratorStore } from '@/stores/configurator.store'
import { trpc } from '@/lib/trpc'

type DeliveryOption = 'PICKUP' | 'DELIVERY' | 'EXPRESS' | 'TRANSPORT'

const DELIVERY_OPTIONS: { value: DeliveryOption; label: string; description: string; price: number }[] = [
  { value: 'PICKUP', label: 'Retrait sur place', description: 'Venez récupérer votre commande', price: 0 },
  { value: 'DELIVERY', label: 'Livraison standard', description: 'Livraison sous 5-7 jours', price: 35 },
  { value: 'EXPRESS', label: 'Livraison express', description: 'Livraison sous 2-3 jours', price: 65 },
  { value: 'TRANSPORT', label: 'Transport spécial', description: 'Pour les grosses commandes', price: 0 },
]

export default function CommandePage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { parts, resetAll } = useConfiguratorStore()

  const [projectName, setProjectName] = useState('')
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('PICKUP')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (order) => {
      resetAll()
      router.push(`/commande/${order.id}/confirmation`)
    },
  })

  // Calculer le total
  const partsTotal = parts.reduce((sum, part) => {
    const partTotal = (part.length / 1000) * (part.width / 1000) * 25 * part.quantity // Prix simplifié
    return sum + partTotal
  }, 0)

  const deliveryPrice = DELIVERY_OPTIONS.find(o => o.value === deliveryOption)?.price ?? 0
  const subtotal = partsTotal + deliveryPrice
  const tax = subtotal * 0.2
  const total = subtotal + tax

  const handleSubmit = async () => {
    if (!session?.user) return

    const orderParts = parts.map(part => ({
      reference: part.reference,
      quantity: part.quantity,
      panelId: part.panelId!,
      panelName: part.panelName,
      length: part.length,
      width: part.width,
      grainDirection: part.grainDirection,
      edges: part.edges,
      drillingLines: part.drillingLines,
      drillingPoints: part.drillingPoints,
      hardwareDrillings: part.hardwareDrillings,
      machiningOperations: part.machiningOperations,
      finish: part.finish,
      notes: part.notes,
      calculatedPrice: (part.length / 1000) * (part.width / 1000) * 25 * part.quantity,
      priceBreakdown: {
        panel: (part.length / 1000) * (part.width / 1000) * 25,
        cutting: 3,
        edges: part.edges.filter(e => e.edgeId).length * 5,
        drilling: part.drillingLines.length * 2,
        hardware: part.hardwareDrillings.length * 1,
        machining: part.machiningOperations.length * 5,
        finish: part.finish ? 10 : 0,
        total: (part.length / 1000) * (part.width / 1000) * 25,
      },
    }))

    createOrder.mutate({
      projectName: projectName || undefined,
      parts: orderParts,
      deliveryOption,
      deliveryAddress: deliveryOption !== 'PICKUP' ? deliveryAddress : undefined,
      notes: notes || undefined,
    })
  }

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
              Vous devez être connecté pour passer une commande.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button>Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Créer un compte</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (parts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Panier vide</h1>
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore configuré de pièces.
            </p>
            <Link href="/configurateur">
              <Button>Configurer des pièces</Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Récapitulatif de commande</h1>
          <p className="text-muted-foreground mt-2">
            Vérifiez votre commande avant validation
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Contenu principal */}
          <div className="space-y-8">
            {/* Liste des pièces */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">
                Pièces configurées ({parts.length})
              </h2>
              <div className="space-y-4">
                {parts.map((part, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-4 last:border-0">
                    <div>
                      <div className="font-medium">{part.reference}</div>
                      <div className="text-sm text-muted-foreground">
                        {part.panelName || 'Panneau'} • {part.length} x {part.width} mm
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantité: {part.quantity}
                        {part.edges.filter(e => e.edgeId).length > 0 && ` • ${part.edges.filter(e => e.edgeId).length} chant(s)`}
                        {part.drillingLines.length > 0 && ` • ${part.drillingLines.length} ligne(s) perçage`}
                        {part.machiningOperations.length > 0 && ` • ${part.machiningOperations.length} usinage(s)`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {((part.length / 1000) * (part.width / 1000) * 25 * part.quantity).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations projet */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="text-xl font-semibold">Informations projet</h2>

              <div className="space-y-2">
                <Label htmlFor="projectName">Nom du projet (optionnel)</Label>
                <Input
                  id="projectName"
                  placeholder="Ex: Cuisine Dupont, Meuble TV..."
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Instructions spéciales, remarques..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Options de livraison */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="text-xl font-semibold">Livraison</h2>

              <div className="grid gap-3">
                {DELIVERY_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    onClick={() => setDeliveryOption(option.value)}
                    className={`
                      cursor-pointer rounded-lg border p-4 transition-all
                      ${deliveryOption === option.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:border-muted-foreground/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      <div className="font-medium">
                        {option.price > 0 ? `${option.price.toFixed(2)} €` : 'Gratuit'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {deliveryOption !== 'PICKUP' && (
                <div className="space-y-2 pt-4">
                  <Label htmlFor="deliveryAddress">Adresse de livraison</Label>
                  <textarea
                    id="deliveryAddress"
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Adresse complète..."
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar récapitulatif */}
          <div>
            <div className="rounded-xl border bg-card p-6 space-y-6 sticky top-24">
              <h2 className="text-xl font-semibold">Total</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pièces ({parts.length})</span>
                  <span>{partsTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} €` : 'Gratuit'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA (20%)</span>
                  <span>{tax.toFixed(2)} €</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total TTC</span>
                    <span className="text-primary">{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={createOrder.isPending || (deliveryOption !== 'PICKUP' && !deliveryAddress)}
              >
                {createOrder.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Validation en cours...
                  </>
                ) : (
                  'Valider la commande'
                )}
              </Button>

              {createOrder.isError && (
                <div className="text-sm text-destructive text-center">
                  Une erreur est survenue. Veuillez réessayer.
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                En validant, vous acceptez nos conditions générales de vente.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
