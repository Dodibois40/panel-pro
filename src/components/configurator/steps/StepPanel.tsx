'use client'

import { useState } from 'react'
import { useConfiguratorStore } from '@/stores/configurator.store'
import { trpc } from '@/lib/trpc'
import { Input, Label, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export function StepPanel() {
  const { currentPart, updatePart } = useConfiguratorStore()
  const [search, setSearch] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')

  // Récupérer les panneaux
  const { data: panelsData, isLoading } = trpc.panel.list.useQuery({
    search: search || undefined,
    material: selectedMaterial || undefined,
    limit: 50,
  })

  // Récupérer les matériaux pour le filtre
  const { data: materials } = trpc.panel.getSuppliers.useQuery()

  const panels = panelsData?.panels ?? []

  const handleSelectPanel = (panel: (typeof panels)[0]) => {
    updatePart({
      panelId: panel.id,
      panelName: panel.name,
      panelMaterial: panel.material,
      panelThickness: Number(panel.thickness),
      // Reset grain direction si le panneau n'a pas de sens de fil
      grainDirection: panel.grainDirection ? currentPart.grainDirection : null,
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Sélectionnez le panneau à utiliser pour cette pièce.
      </p>

      {/* Filtres */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">Rechercher</Label>
          <Input
            id="search"
            placeholder="Nom ou référence..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Matériau</Label>
          <select
            id="material"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedMaterial}
            onChange={e => setSelectedMaterial(e.target.value)}
          >
            <option value="">Tous les matériaux</option>
            {materials?.map(mat => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des panneaux */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : panels.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun panneau trouvé
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {panels.map(panel => (
            <button
              key={panel.id}
              onClick={() => handleSelectPanel(panel)}
              className={cn(
                'flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-accent',
                currentPart.panelId === panel.id && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <div className="font-medium">{panel.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {panel.reference}
                  </div>
                </div>
                {panel.colorCode && (
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: panel.colorCode }}
                  />
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <span>{panel.material}</span>
                <span className="mx-2">•</span>
                <span>{Number(panel.thickness)} mm</span>
                <span className="mx-2">•</span>
                <span>{panel.supplier}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-primary">
                {Number(panel.pricePerM2).toFixed(2)} €/m²
              </div>
              {panel.grainDirection && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Sens de fil
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Panneau sélectionné */}
      {currentPart.panelId && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
          <div className="text-sm font-medium text-primary">Panneau sélectionné</div>
          <div className="mt-1 font-medium">{currentPart.panelName}</div>
          <div className="text-sm text-muted-foreground">
            {currentPart.panelMaterial} • {currentPart.panelThickness} mm
          </div>
        </div>
      )}
    </div>
  )
}
