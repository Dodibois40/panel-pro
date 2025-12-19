'use client'

import Link from 'next/link'
import { useConfiguratorStore } from '@/stores/configurator.store'
import { Button, Card, CardContent } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export function CartSummary() {
  const { parts, getCartTotal } = useConfiguratorStore()

  if (parts.length === 0) return null

  const cartTotal = getCartTotal()
  const totalParts = parts.reduce((sum, p) => sum + p.quantity, 0)
  const totalTTC = cartTotal * 1.2 // TVA 20%

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        {/* Résumé du panier */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Votre panier</div>
            <div className="text-sm text-muted-foreground">
              {parts.length} référence(s) • {totalParts} pièce(s)
            </div>
          </div>
          <div className="text-2xl">🛒</div>
        </div>

        {/* Prix total */}
        <div className="space-y-1 border-t pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total HT</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA (20%)</span>
            <span>{formatCurrency(cartTotal * 0.2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total TTC</span>
            <span className="text-primary">{formatCurrency(totalTTC)}</span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-2 pt-2">
          <Link href="/commande" className="block">
            <Button className="w-full" size="lg">
              Passer commande
            </Button>
          </Link>
          <div className="text-xs text-center text-muted-foreground">
            Vous pourrez vérifier les détails avant de confirmer
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
