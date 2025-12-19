'use client'

import { useState } from 'react'

import { Button, Input, Label, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'

const MATERIALS = [
  { value: 'MELAMINE', label: 'Mélaminé' },
  { value: 'MDF', label: 'MDF' },
  { value: 'MDF_LAQUE', label: 'MDF Laqué' },
  { value: 'STRATIFIE', label: 'Stratifié' },
  { value: 'PLAQUE_BOIS', label: 'Placage bois' },
  { value: 'CONTREPLAQUE', label: 'Contreplaqué' },
  { value: 'AGGLO', label: 'Aggloméré' },
  { value: 'COMPACT', label: 'Compact' },
]

type PanelMaterial = 'MELAMINE' | 'MDF' | 'MDF_LAQUE' | 'STRATIFIE' | 'PLAQUE_BOIS' | 'CONTREPLAQUE' | 'AGGLO' | 'COMPACT'

export default function AdminPanneauxPage() {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPanel, setNewPanel] = useState({
    reference: '',
    name: '',
    supplier: '',
    material: 'MELAMINE' as PanelMaterial,
    thickness: 18,
    length: 2800,
    width: 2070,
    pricePerM2: 25,
    grainDirection: false,
    colorCode: '',
  })

  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.panel.list.useQuery({
    search: search || undefined,
    isActive: undefined, // Show all including inactive
    limit: 100,
  })

  const createPanel = trpc.panel.create.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate()
      setShowAddForm(false)
      setNewPanel({
        reference: '',
        name: '',
        supplier: '',
        material: 'MELAMINE',
        thickness: 18,
        length: 2800,
        width: 2070,
        pricePerM2: 25,
        grainDirection: false,
        colorCode: '',
      })
    },
  })

  const deletePanel = trpc.panel.delete.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate()
    },
  })

  const handleCreate = () => {
    createPanel.mutate({
      ...newPanel,
      colorCode: newPanel.colorCode || undefined,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce panneau ?')) return
    await deletePanel.mutateAsync(id)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Catalogue panneaux</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} panneau(x) au total
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Annuler' : '+ Ajouter un panneau'}
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="rounded-xl border bg-card p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold">Nouveau panneau</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Référence *</Label>
              <Input
                value={newPanel.reference}
                onChange={e => setNewPanel({ ...newPanel, reference: e.target.value })}
                placeholder="MEL-BLANC-18"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={newPanel.name}
                onChange={e => setNewPanel({ ...newPanel, name: e.target.value })}
                placeholder="Mélaminé Blanc 18mm"
              />
            </div>
            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Input
                value={newPanel.supplier}
                onChange={e => setNewPanel({ ...newPanel, supplier: e.target.value })}
                placeholder="Egger"
              />
            </div>
            <div className="space-y-2">
              <Label>Matériau *</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={newPanel.material}
                onChange={e => setNewPanel({ ...newPanel, material: e.target.value as PanelMaterial })}
              >
                {MATERIALS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Épaisseur (mm) *</Label>
              <Input
                type="number"
                value={newPanel.thickness}
                onChange={e => setNewPanel({ ...newPanel, thickness: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix/m² (€) *</Label>
              <Input
                type="number"
                step="0.01"
                value={newPanel.pricePerM2}
                onChange={e => setNewPanel({ ...newPanel, pricePerM2: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Longueur (mm)</Label>
              <Input
                type="number"
                value={newPanel.length}
                onChange={e => setNewPanel({ ...newPanel, length: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Largeur (mm)</Label>
              <Input
                type="number"
                value={newPanel.width}
                onChange={e => setNewPanel({ ...newPanel, width: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code couleur</Label>
              <div className="flex gap-2">
                <Input
                  value={newPanel.colorCode}
                  onChange={e => setNewPanel({ ...newPanel, colorCode: e.target.value })}
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  value={newPanel.colorCode || '#ffffff'}
                  onChange={e => setNewPanel({ ...newPanel, colorCode: e.target.value })}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2 flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="grainDirection"
                checked={newPanel.grainDirection}
                onChange={e => setNewPanel({ ...newPanel, grainDirection: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="grainDirection">Sens du fil</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreate} disabled={createPanel.isPending}>
              {createPanel.isPending ? 'Création...' : 'Créer le panneau'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Annuler
            </Button>
          </div>

          {createPanel.isError && (
            <div className="text-sm text-destructive">
              Erreur: {createPanel.error.message}
            </div>
          )}
        </div>
      )}

      {/* Recherche */}
      <div className="mb-6">
        <Input
          placeholder="Rechercher un panneau..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data?.panels.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <div className="text-muted-foreground">
            Aucun panneau trouvé
          </div>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Aperçu</th>
                <th className="text-left p-4 font-medium">Référence</th>
                <th className="text-left p-4 font-medium">Nom</th>
                <th className="text-left p-4 font-medium">Matériau</th>
                <th className="text-left p-4 font-medium">Épaisseur</th>
                <th className="text-left p-4 font-medium">Dimensions</th>
                <th className="text-left p-4 font-medium">Prix/m²</th>
                <th className="text-left p-4 font-medium">Statut</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.panels.map(panel => (
                <tr key={panel.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: panel.colorCode || '#e5e5e5' }}
                    />
                  </td>
                  <td className="p-4 font-mono text-sm">{panel.reference}</td>
                  <td className="p-4 font-medium">{panel.name}</td>
                  <td className="p-4 text-sm">
                    {MATERIALS.find(m => m.value === panel.material)?.label}
                  </td>
                  <td className="p-4">{Number(panel.thickness)} mm</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {panel.length} x {panel.width}
                  </td>
                  <td className="p-4 font-medium">{Number(panel.pricePerM2).toFixed(2)} €</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      panel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {panel.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        Modifier
                      </Button>
                      {panel.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(panel.id)}
                        >
                          Désactiver
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
