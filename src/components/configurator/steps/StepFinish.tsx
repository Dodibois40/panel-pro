'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Button, Label } from '@/components/ui'

type FinishTypeValue = 'none' | 'varnish' | 'oil' | 'wax' | 'paint'

const FINISH_OPTIONS: { value: FinishTypeValue; label: string; description: string; priceMultiplier: number }[] = [
  { value: 'none', label: 'Aucune', description: 'Panneau brut sans finition', priceMultiplier: 1 },
  { value: 'varnish', label: 'Vernis', description: 'Finition vernis transparent', priceMultiplier: 1.4 },
  { value: 'oil', label: 'Huile', description: 'Finition huilée naturelle', priceMultiplier: 1.3 },
  { value: 'wax', label: 'Cire', description: 'Finition cirée satinée', priceMultiplier: 1.2 },
  { value: 'paint', label: 'Peinture', description: 'Peinture couleur au choix', priceMultiplier: 1.8 },
]

export function StepFinish() {
  const { currentPart, updatePart, addPart, parts } = useConfiguratorStore()

  const handleFinishChange = (finishType: FinishTypeValue) => {
    if (finishType === 'none') {
      updatePart({ finish: undefined })
    } else {
      updatePart({
        finish: {
          type: finishType,
          faces: ['both'],
        },
      })
    }
  }

  const handleAddPart = () => {
    addPart()
  }

  const isPartValid = () => {
    return (
      currentPart.reference.trim() !== '' &&
      currentPart.panelId !== null &&
      currentPart.length > 0 &&
      currentPart.width > 0 &&
      currentPart.quantity > 0
    )
  }

  const currentFinishType = currentPart.finish?.type || 'none'

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Choisissez une finition optionnelle et finalisez la pièce.
      </p>

      {/* Options de finition */}
      <div className="space-y-3">
        <Label>Finition de surface</Label>
        <div className="grid gap-3">
          {FINISH_OPTIONS.map(option => (
            <div
              key={option.value}
              onClick={() => handleFinishChange(option.value)}
              className={`
                cursor-pointer rounded-lg border p-4 transition-all
                ${currentFinishType === option.value
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
                {option.priceMultiplier > 1 && (
                  <div className="text-sm font-medium text-amber-600">
                    +{Math.round((option.priceMultiplier - 1) * 100)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé de la pièce */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
        <div className="font-medium">Résumé de la pièce</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Référence:</span>
            <span className="ml-2 font-medium">{currentPart.reference || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Quantité:</span>
            <span className="ml-2 font-medium">{currentPart.quantity}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Dimensions:</span>
            <span className="ml-2 font-medium">
              {currentPart.length} x {currentPart.width} mm
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Chants:</span>
            <span className="ml-2 font-medium">
              {currentPart.edges.filter(e => e.edgeId !== null).length} côté(s)
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Perçages:</span>
            <span className="ml-2 font-medium">
              {currentPart.drillingLines.length} ligne(s)
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Usinages:</span>
            <span className="ml-2 font-medium">
              {currentPart.machiningOperations.length} opération(s)
            </span>
          </div>
          {currentPart.finish && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Finition:</span>
              <span className="ml-2 font-medium">
                {FINISH_OPTIONS.find(o => o.value === currentPart.finish?.type)?.label}
              </span>
            </div>
          )}
          {currentPart.notes && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Notes:</span>
              <span className="ml-2">{currentPart.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={handleAddPart}
          disabled={!isPartValid()}
          className="w-full"
          size="lg"
        >
          Ajouter cette pièce à la commande
        </Button>

        {parts.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {parts.length} pièce(s) déjà ajoutée(s) à la commande
          </div>
        )}

        {!isPartValid() && (
          <div className="text-center text-sm text-destructive">
            Veuillez compléter les informations obligatoires (référence, panneau, dimensions)
          </div>
        )}
      </div>
    </div>
  )
}
