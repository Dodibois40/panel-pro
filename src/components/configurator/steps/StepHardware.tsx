'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Button, Label } from '@/components/ui'

export function StepHardware() {
  const { currentPart, updatePart } = useConfiguratorStore()

  const removeHardware = (id: string) => {
    updatePart({
      hardwareDrillings: currentPart.hardwareDrillings.filter(h => h.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Ajoutez des perçages pour quincaillerie (charnières, coulisses, etc.).
      </p>

      {/* Liste quincaillerie existante */}
      {currentPart.hardwareDrillings.length > 0 && (
        <div className="space-y-3">
          <Label>Quincaillerie configurée</Label>
          {currentPart.hardwareDrillings.map(hw => (
            <div
              key={hw.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium text-sm">{hw.hardwareName}</div>
                <div className="text-xs text-muted-foreground">
                  Position: X={hw.position.x}mm, Y={hw.position.y}mm • Face: {hw.face}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeHardware(hw.id)}
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Types de quincaillerie disponibles */}
      <div className="space-y-3">
        <Label>Ajouter une quincaillerie</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-lg border p-4 text-left hover:bg-accent transition-colors"
            onClick={() => {
              updatePart({
                hardwareDrillings: [
                  ...currentPart.hardwareDrillings,
                  {
                    id: crypto.randomUUID(),
                    hardwareId: 'charniere-blum-clip',
                    hardwareName: 'Charnière Blum Clip Top',
                    position: { x: 100, y: 22 },
                    face: 'back',
                  },
                ],
              })
            }}
          >
            <div className="font-medium">Charnière Blum Clip Top</div>
            <div className="text-sm text-muted-foreground mt-1">
              Perçage standard Ø35mm + fixations
            </div>
          </button>

          <button
            type="button"
            className="rounded-lg border p-4 text-left hover:bg-accent transition-colors"
            onClick={() => {
              updatePart({
                hardwareDrillings: [
                  ...currentPart.hardwareDrillings,
                  {
                    id: crypto.randomUUID(),
                    hardwareId: 'coulisse-blum-tandem',
                    hardwareName: 'Coulisse Blum Tandem',
                    position: { x: 37, y: currentPart.width / 2 },
                    face: 'back',
                  },
                ],
              })
            }}
          >
            <div className="font-medium">Coulisse Blum Tandem</div>
            <div className="text-sm text-muted-foreground mt-1">
              Perçages latéraux pour coulisses
            </div>
          </button>

          <button
            type="button"
            className="rounded-lg border p-4 text-left hover:bg-accent transition-colors"
            onClick={() => {
              updatePart({
                hardwareDrillings: [
                  ...currentPart.hardwareDrillings,
                  {
                    id: crypto.randomUUID(),
                    hardwareId: 'pied-reglable',
                    hardwareName: 'Pied réglable',
                    position: { x: 50, y: 50 },
                    face: 'back',
                  },
                ],
              })
            }}
          >
            <div className="font-medium">Pied réglable</div>
            <div className="text-sm text-muted-foreground mt-1">
              Perçage pour insert de pied
            </div>
          </button>

          <button
            type="button"
            className="rounded-lg border p-4 text-left hover:bg-accent transition-colors"
            onClick={() => {
              updatePart({
                hardwareDrillings: [
                  ...currentPart.hardwareDrillings,
                  {
                    id: crypto.randomUUID(),
                    hardwareId: 'excentriques',
                    hardwareName: 'Excentriques',
                    position: { x: 37, y: 9.5 },
                    face: 'front',
                  },
                ],
              })
            }}
          >
            <div className="font-medium">Excentriques</div>
            <div className="text-sm text-muted-foreground mt-1">
              Perçage Ø15mm pour assemblage
            </div>
          </button>
        </div>
      </div>

      {currentPart.hardwareDrillings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune quincaillerie configurée. Vous pouvez passer cette étape si non nécessaire.
        </div>
      )}
    </div>
  )
}
