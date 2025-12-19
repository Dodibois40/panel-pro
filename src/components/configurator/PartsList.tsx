'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export function PartsList() {
  const { parts, removePart, editPart, duplicatePart } = useConfiguratorStore()

  if (parts.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Pièces configurées ({parts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {parts.map((part, index) => (
          <div
            key={index}
            className="rounded-lg border p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-sm">{part.reference || `Pièce ${index + 1}`}</div>
                <div className="text-xs text-muted-foreground">
                  {part.length} x {part.width} mm • Qté: {part.quantity}
                </div>
                {part.panelName && (
                  <div className="text-xs text-muted-foreground">{part.panelName}</div>
                )}
              </div>
              {part.calculatedPrice !== undefined && (
                <div className="text-sm font-medium text-primary">
                  {formatCurrency(part.calculatedPrice)}
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => editPart(index)}
              >
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => duplicatePart(index)}
              >
                Dupliquer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => removePart(index)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
