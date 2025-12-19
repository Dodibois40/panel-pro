'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Input, Label } from '@/components/ui'
import { cn } from '@/lib/utils'

export function StepDimensions() {
  const { currentPart, updatePart } = useConfiguratorStore()

  const hasGrainDirection = currentPart.panelMaterial?.includes('MELAMINE') ||
    currentPart.panelMaterial?.includes('PLAQUE_BOIS')

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Définissez les dimensions de votre pièce en millimètres.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="length">Longueur (mm) *</Label>
          <Input
            id="length"
            type="number"
            min={10}
            max={5000}
            placeholder="Ex: 800"
            value={currentPart.length || ''}
            onChange={e => updatePart({ length: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Dimension la plus grande de la pièce
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="width">Largeur (mm) *</Label>
          <Input
            id="width"
            type="number"
            min={10}
            max={3000}
            placeholder="Ex: 400"
            value={currentPart.width || ''}
            onChange={e => updatePart({ width: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Dimension la plus petite de la pièce
          </p>
        </div>
      </div>

      {/* Sens du fil */}
      {hasGrainDirection && (
        <div className="space-y-3">
          <Label>Sens du fil</Label>
          <p className="text-sm text-muted-foreground">
            Ce panneau a un sens de fil. Indiquez l&apos;orientation souhaitée.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updatePart({ grainDirection: 'length' })}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors hover:bg-accent',
                currentPart.grainDirection === 'length' && 'border-primary bg-primary/5'
              )}
            >
              <div className="font-medium">Dans la longueur</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Le fil suit la dimension la plus grande
              </div>
              <div className="mt-3 flex items-center justify-center">
                <div className="h-12 w-24 rounded border-2 border-dashed border-muted-foreground/50 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-primary" />
                    <span className="absolute text-xs text-primary">→</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updatePart({ grainDirection: 'width' })}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors hover:bg-accent',
                currentPart.grainDirection === 'width' && 'border-primary bg-primary/5'
              )}
            >
              <div className="font-medium">Dans la largeur</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Le fil suit la dimension la plus petite
              </div>
              <div className="mt-3 flex items-center justify-center">
                <div className="h-12 w-24 rounded border-2 border-dashed border-muted-foreground/50 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0.5 h-8 bg-primary" />
                    <span className="absolute text-xs text-primary rotate-90">→</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Aperçu visuel */}
      {currentPart.length > 0 && currentPart.width > 0 && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="text-sm font-medium mb-3">Aperçu</div>
          <div className="flex items-center justify-center">
            <div
              className="border-2 border-primary bg-primary/10 rounded relative"
              style={{
                width: Math.min(200, currentPart.length / 10),
                height: Math.min(150, currentPart.width / 10),
                minWidth: 50,
                minHeight: 30,
              }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                {currentPart.length} mm
              </span>
              <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground rotate-90">
                {currentPart.width} mm
              </span>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Surface: {((currentPart.length * currentPart.width) / 1000000).toFixed(3)} m²
          </div>
        </div>
      )}
    </div>
  )
}
