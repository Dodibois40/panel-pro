'use client'

import { useState } from 'react'
import { useConfiguratorStore, type EdgePosition, type DrillingLine } from '@/stores/configurator.store'
import { Button, Input, Label } from '@/components/ui'

const SIDES: { value: EdgePosition; label: string }[] = [
  { value: 'top', label: 'Haut' },
  { value: 'bottom', label: 'Bas' },
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' },
]

export function StepDrilling() {
  const { currentPart, updatePart } = useConfiguratorStore()
  const [showAddLine, setShowAddLine] = useState(false)
  const [newLine, setNewLine] = useState<Partial<DrillingLine>>({
    side: 'left',
    startOffset: 37,
    spacing: 32,
    count: 5,
    diameter: 5,
    depth: 13,
  })

  const addDrillingLine = () => {
    if (!newLine.side || !newLine.count) return

    const line: DrillingLine = {
      id: crypto.randomUUID(),
      side: newLine.side,
      startOffset: newLine.startOffset ?? 37,
      spacing: newLine.spacing ?? 32,
      count: newLine.count,
      diameter: newLine.diameter ?? 5,
      depth: newLine.depth ?? 13,
    }

    updatePart({
      drillingLines: [...currentPart.drillingLines, line],
    })
    setShowAddLine(false)
  }

  const removeDrillingLine = (id: string) => {
    updatePart({
      drillingLines: currentPart.drillingLines.filter(l => l.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configurez les perçages d&apos;assemblage (système 32mm, tourillons, etc.).
      </p>

      {/* Lignes de perçage existantes */}
      {currentPart.drillingLines.length > 0 && (
        <div className="space-y-3">
          <Label>Lignes de perçage configurées</Label>
          {currentPart.drillingLines.map(line => (
            <div
              key={line.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium text-sm">
                  {SIDES.find(s => s.value === line.side)?.label} - {line.count} trous
                </div>
                <div className="text-xs text-muted-foreground">
                  Ø{line.diameter}mm • Prof. {line.depth}mm • Espacement {line.spacing}mm
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeDrillingLine(line.id)}
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout */}
      {showAddLine ? (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Nouvelle ligne de perçage</div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Côté</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={newLine.side}
                onChange={e => setNewLine({ ...newLine, side: e.target.value as EdgePosition })}
              >
                {SIDES.map(side => (
                  <option key={side.value} value={side.value}>
                    {side.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Nombre de trous</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={newLine.count}
                onChange={e => setNewLine({ ...newLine, count: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Décalage départ (mm)</Label>
              <Input
                type="number"
                min={0}
                value={newLine.startOffset}
                onChange={e => setNewLine({ ...newLine, startOffset: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Espacement (mm)</Label>
              <Input
                type="number"
                min={16}
                step={16}
                value={newLine.spacing}
                onChange={e => setNewLine({ ...newLine, spacing: parseInt(e.target.value) || 32 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Diamètre (mm)</Label>
              <Input
                type="number"
                min={3}
                max={15}
                value={newLine.diameter}
                onChange={e => setNewLine({ ...newLine, diameter: parseInt(e.target.value) || 5 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Profondeur (mm)</Label>
              <Input
                type="number"
                min={5}
                max={30}
                value={newLine.depth}
                onChange={e => setNewLine({ ...newLine, depth: parseInt(e.target.value) || 13 })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={addDrillingLine}>Ajouter</Button>
            <Button variant="outline" onClick={() => setShowAddLine(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAddLine(true)}>
          + Ajouter une ligne de perçage
        </Button>
      )}

      {/* Préréglages rapides */}
      <div className="space-y-2">
        <Label>Préréglages rapides</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const line: DrillingLine = {
                id: crypto.randomUUID(),
                side: 'left',
                startOffset: 37,
                spacing: 32,
                count: Math.floor((currentPart.width - 74) / 32) + 1,
                diameter: 5,
                depth: 13,
              }
              updatePart({ drillingLines: [...currentPart.drillingLines, line] })
            }}
          >
            Système 32 - Gauche
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const line: DrillingLine = {
                id: crypto.randomUUID(),
                side: 'right',
                startOffset: 37,
                spacing: 32,
                count: Math.floor((currentPart.width - 74) / 32) + 1,
                diameter: 5,
                depth: 13,
              }
              updatePart({ drillingLines: [...currentPart.drillingLines, line] })
            }}
          >
            Système 32 - Droite
          </Button>
        </div>
      </div>

      {currentPart.drillingLines.length === 0 && !showAddLine && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun perçage configuré. Vous pouvez passer cette étape si non nécessaire.
        </div>
      )}
    </div>
  )
}
