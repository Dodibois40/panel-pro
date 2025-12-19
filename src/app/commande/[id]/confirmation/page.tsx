'use client'

import { use } from 'react'
import Link from 'next/link'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: order, isLoading, error } = trpc.order.getById.useQuery(id)

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
            <Link href="/dashboard">
              <Button>Retour au tableau de bord</Button>
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

      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-600">
              Commande confirmée !
            </h1>
            <p className="text-xl text-muted-foreground">
              Merci pour votre commande
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 text-left space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">N° de commande</div>
                <div className="font-mono font-semibold">{order.orderNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Statut</div>
                <div className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-1 text-sm font-medium">
                  En attente de confirmation
                </div>
              </div>
              {order.projectName && (
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Projet</div>
                  <div className="font-medium">{order.projectName}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Nombre de pièces</div>
                <div className="font-medium">{order.parts.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total TTC</div>
                <div className="font-semibold text-primary">
                  {(Number(order.totalPrice) * 1.2).toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-muted-foreground">
            <p>
              Vous recevrez un email de confirmation sous peu.
            </p>
            <p>
              Notre équipe va examiner votre commande et vous contacter
              pour confirmer les détails.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href={`/commande/${order.id}`}>
              <Button variant="outline">Voir les détails</Button>
            </Link>
            <Link href="/mes-commandes">
              <Button>Mes commandes</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
