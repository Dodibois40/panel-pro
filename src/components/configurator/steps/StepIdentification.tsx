'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Input, Label } from '@/components/ui'

export function StepIdentification() {
  const { currentPart, updatePart } = useConfiguratorStore()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Identifiez votre pièce avec une référence unique et indiquez la quantité souhaitée.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reference">Référence de la pièce *</Label>
          <Input
            id="reference"
            placeholder="Ex: ETAGERE-01, FACADE-CUISINE..."
            value={currentPart.reference}
            onChange={e => updatePart({ reference: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Une référence unique pour identifier cette pièce
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité *</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={999}
            value={currentPart.quantity}
            onChange={e => updatePart({ quantity: parseInt(e.target.value) || 1 })}
          />
          <p className="text-xs text-muted-foreground">
            Nombre de pièces identiques à produire
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <textarea
          id="notes"
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Instructions particulières, remarques..."
          value={currentPart.notes || ''}
          onChange={e => updatePart({ notes: e.target.value })}
        />
      </div>
    </div>
  )
}
