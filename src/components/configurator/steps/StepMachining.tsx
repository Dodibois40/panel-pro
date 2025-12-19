'use client'

import { useState } from 'react'
import { useConfiguratorStore, type MachiningOperation } from '@/stores/configurator.store'
import { Button, Label } from '@/components/ui'

type MachiningType = 'groove' | 'rebate' | 'notch' | 'cutout'

const MACHINING_TYPES: { value: MachiningType; label: string; description: string }[] = [
  { value: 'groove', label: 'Rainure', description: 'Rainure pour dos ou séparateur' },
  { value: 'rebate', label: 'Feuillure', description: 'Feuillure périphérique' },
  { value: 'notch', label: 'Encoche', description: 'Encoche d\'angle ou de passage' },
  { value: 'cutout', label: 'Découpe', description: 'Découpe intérieure (prise, etc.)' },
]

export function StepMachining() {
  const { currentPart, updatePart } = useConfiguratorStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState<MachiningType>('groove')

  const addMachining = (type: MachiningType) => {
    let operation: MachiningOperation

    switch (type) {
      case 'groove':
        operation = {
          id: crypto.randomUUID(),
          type: 'groove',
          dimensions: { width: 4, depth: 10 },
          position: { offset: 10 },
        }
        break
      case 'rebate':
        operation = {
          id: crypto.randomUUID(),
          type: 'rebate',
          dimensions: { width: 10, depth: 5 },
          position: { sides: 4 },
        }
        break
      case 'notch':
        operation = {
          id: crypto.randomUUID(),
          type: 'notch',
          dimensions: { length: 50, width: 50 },
          position: { corner: 1 },
        }
        break
      case 'cutout':
        operation = {
          id: crypto.randomUUID(),
          type: 'cutout',
          dimensions: { length: 80, width: 80 },
          position: { x: 100, y: 100 },
        }
        break
    }

    updatePart({
      machiningOperations: [...currentPart.machiningOperations, operation],
    })
    setShowAddForm(false)
  }

  const removeMachining = (id: string) => {
    updatePart({
      machiningOperations: currentPart.machiningOperations.filter(m => m.id !== id),
    })
  }

  const getMachiningLabel = (type: MachiningType): string => {
    return MACHINING_TYPES.find(t => t.value === type)?.label ?? type
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Ajoutez des usinages spéciaux (rainures, feuillures, encoches, découpes).
      </p>

      {/* Liste des usinages existants */}
      {currentPart.machiningOperations.length > 0 && (
        <div className="space-y-3">
          <Label>Usinages configurés</Label>
          {currentPart.machiningOperations.map(op => (
            <div
              key={op.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium text-sm">{getMachiningLabel(op.type)}</div>
                <div className="text-xs text-muted-foreground">
                  {op.type === 'groove' && `Largeur: ${op.dimensions.width}mm, Prof: ${op.dimensions.depth}mm`}
                  {op.type === 'rebate' && `Largeur: ${op.dimensions.width}mm, Prof: ${op.dimensions.depth}mm`}
                  {op.type === 'notch' && `${op.dimensions.length} x ${op.dimensions.width}mm`}
                  {op.type === 'cutout' && `${op.dimensions.length} x ${op.dimensions.width}mm`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeMachining(op.id)}
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm ? (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Ajouter un usinage</div>

          <div className="space-y-2">
            <Label>Type d&apos;usinage</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as MachiningType)}
            >
              {MACHINING_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => addMachining(selectedType)}>
              Ajouter
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)}>
          + Ajouter un usinage
        </Button>
      )}

      {/* Préréglages rapides */}
      <div className="space-y-2">
        <Label>Préréglages rapides</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addMachining('groove')}
          >
            Rainure dos 4mm
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addMachining('rebate')}
          >
            Feuillure périphérique
          </Button>
        </div>
      </div>

      {currentPart.machiningOperations.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun usinage configuré. Vous pouvez passer cette étape si non nécessaire.
        </div>
      )}
    </div>
  )
}
