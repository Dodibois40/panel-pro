'use client'

import { useState } from 'react'

import { Button, Input, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'

const CATEGORY_LABELS: Record<string, string> = {
  DECOUPE: 'Découpe',
  CHANT: 'Pose de chants',
  PERCAGE: 'Perçages',
  USINAGE: 'Usinages',
  LIVRAISON: 'Livraison',
}

export default function AdminTarifsPage() {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const utils = trpc.useUtils()
  const { data: pricingGroups, isLoading } = trpc.pricing.getAll.useQuery()
  const { data: history } = trpc.pricing.getHistory.useQuery({ limit: 20 })

  const updatePricing = trpc.pricing.update.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate()
      utils.pricing.getHistory.invalidate()
      setEditingKey(null)
    },
  })

  const handleEdit = (key: string, value: number) => {
    setEditingKey(key)
    setEditValue(value)
  }

  const handleSave = () => {
    if (!editingKey) return
    updatePricing.mutate({ key: editingKey, value: editValue })
  }

  const handleCancel = () => {
    setEditingKey(null)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuration des tarifs</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les prix de base pour la découpe, pose, etc.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Tarifs par catégorie */}
        <div className="space-y-6">
          {pricingGroups && Object.entries(pricingGroups).map(([category, configs]) => (
            <div key={category} className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="space-y-3">
                {configs.map(config => (
                  <div
                    key={config.key}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="font-medium text-sm">{config.key}</div>
                      {config.description && (
                        <div className="text-sm text-muted-foreground">{config.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {editingKey === config.key ? (
                        <>
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={e => setEditValue(Number(e.target.value))}
                            className="w-24 text-right"
                          />
                          <span className="text-sm text-muted-foreground w-16">
                            {config.unit}
                          </span>
                          <Button size="sm" onClick={handleSave} disabled={updatePricing.isPending}>
                            OK
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancel}>
                            ✕
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="font-mono font-medium">
                            {Number(config.value).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground w-16">
                            {config.unit}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(config.key, Number(config.value))}
                          >
                            Modifier
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Historique des modifications */}
        <div>
          <div className="rounded-xl border bg-card p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Historique récent</h2>
            {history && history.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map(entry => (
                  <div key={entry.id} className="text-sm border-b pb-3 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-mono">{entry.configKey}</span>
                      <span className="text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {Number(entry.oldValue).toFixed(2)} → {Number(entry.newValue).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Par {entry.changedBy.name || entry.changedBy.email}
                    </div>
                    {entry.reason && (
                      <div className="text-xs italic">{entry.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Aucune modification récente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
