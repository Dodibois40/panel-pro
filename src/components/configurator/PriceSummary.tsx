'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export function PriceSummary() {
  const { priceBreakdown, currentPart } = useConfiguratorStore()

  const priceLines = [
    { label: 'Panneau', value: priceBreakdown.panel },
    { label: 'Découpe', value: priceBreakdown.cutting },
    { label: 'Chants', value: priceBreakdown.edges },
    { label: 'Perçages', value: priceBreakdown.drilling },
    { label: 'Quincaillerie', value: priceBreakdown.hardware },
    { label: 'Usinages', value: priceBreakdown.machining },
    { label: 'Finition', value: priceBreakdown.finish },
  ].filter(line => line.value > 0)

  const unitPrice = priceBreakdown.total
  const totalPrice = unitPrice * (currentPart.quantity || 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Récapitulatif prix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Détail pièce courante */}
        {currentPart.panelId && (
          <div className="space-y-2 text-sm">
            <div className="font-medium text-muted-foreground">Pièce en cours</div>
            {currentPart.reference && (
              <div className="text-foreground">{currentPart.reference}</div>
            )}
            {currentPart.length > 0 && currentPart.width > 0 && (
              <div className="text-muted-foreground">
                {currentPart.length} x {currentPart.width} mm
              </div>
            )}
          </div>
        )}

        {/* Détail des prix */}
        {priceLines.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            {priceLines.map(line => (
              <div key={line.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{line.label}</span>
                <span>{formatCurrency(line.value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prix unitaire</span>
            <span className="font-medium">{formatCurrency(unitPrice)}</span>
          </div>
          {currentPart.quantity > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Quantité: {currentPart.quantity}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Message si pas de configuration */}
        {!currentPart.panelId && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Sélectionnez un panneau pour voir le prix
          </div>
        )}
      </CardContent>
    </Card>
  )
}
