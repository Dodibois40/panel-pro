'use client'

import { useConfiguratorStore, type EdgePosition } from '@/stores/configurator.store'
import { trpc } from '@/lib/trpc'
import { Label, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

const EDGE_POSITIONS: { position: EdgePosition; label: string }[] = [
  { position: 'top', label: 'Haut' },
  { position: 'bottom', label: 'Bas' },
  { position: 'left', label: 'Gauche' },
  { position: 'right', label: 'Droite' },
]

export function StepEdges() {
  const { currentPart, updatePart } = useConfiguratorStore()

  // Récupérer les chants compatibles avec le panneau sélectionné
  const { data: edges, isLoading } = trpc.edge.list.useQuery({
    panelId: currentPart.panelId ?? undefined,
  })

  const handleEdgeSelect = (position: EdgePosition, edgeId: string | null, edgeName?: string) => {
    const newEdges = currentPart.edges.map(edge =>
      edge.position === position
        ? { ...edge, edgeId, edgeName }
        : edge
    )
    updatePart({ edges: newEdges })
  }

  const getEdgeConfig = (position: EdgePosition) => {
    return currentPart.edges.find(e => e.position === position)
  }

  const getEdgeLength = (position: EdgePosition): number => {
    if (position === 'top' || position === 'bottom') {
      return currentPart.length
    }
    return currentPart.width
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Sélectionnez les chants à appliquer sur chaque côté de la pièce.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visualisation de la pièce */}
          <div className="flex items-center justify-center py-4">
            <div className="relative" style={{ width: 200, height: 150 }}>
              {/* Pièce centrale */}
              <div className="absolute inset-8 border-2 border-muted-foreground/30 bg-muted/50 rounded" />

              {/* Chants */}
              {EDGE_POSITIONS.map(({ position }) => {
                const config = getEdgeConfig(position)
                const hasEdge = !!config?.edgeId

                const positionStyles: Record<EdgePosition, string> = {
                  top: 'top-0 left-8 right-8 h-8',
                  bottom: 'bottom-0 left-8 right-8 h-8',
                  left: 'left-0 top-8 bottom-8 w-8',
                  right: 'right-0 top-8 bottom-8 w-8',
                }

                return (
                  <div
                    key={position}
                    className={cn(
                      'absolute flex items-center justify-center text-xs font-medium transition-colors rounded',
                      positionStyles[position],
                      hasEdge ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {hasEdge ? '✓' : '-'}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sélection par côté */}
          <div className="grid gap-4 sm:grid-cols-2">
            {EDGE_POSITIONS.map(({ position, label }) => {
              const config = getEdgeConfig(position)
              const length = getEdgeLength(position)

              return (
                <div key={position} className="space-y-2">
                  <Label>
                    {label} ({length} mm)
                  </Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={config?.edgeId ?? ''}
                    onChange={e => {
                      const selectedEdge = edges?.find(edge => edge.id === e.target.value)
                      handleEdgeSelect(
                        position,
                        e.target.value || null,
                        selectedEdge?.name
                      )
                    }}
                  >
                    <option value="">Sans chant</option>
                    {edges?.map(edge => (
                      <option key={edge.id} value={edge.id}>
                        {edge.name} - {Number(edge.pricePerMeter).toFixed(2)} €/ml
                        {(edge as { isDefault?: boolean }).isDefault && ' (recommandé)'}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                if (edges && edges.length > 0) {
                  const defaultEdge = edges.find(e => (e as { isDefault?: boolean }).isDefault) ?? edges[0]
                  if (defaultEdge) {
                    const newEdges = EDGE_POSITIONS.map(({ position }) => ({
                      position,
                      edgeId: defaultEdge.id,
                      edgeName: defaultEdge.name,
                    }))
                    updatePart({ edges: newEdges })
                  }
                }
              }}
            >
              Appliquer sur tous les côtés
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newEdges = EDGE_POSITIONS.map(({ position }) => ({
                  position,
                  edgeId: null,
                  edgeName: undefined,
                }))
                updatePart({ edges: newEdges })
              }}
            >
              Tout retirer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
