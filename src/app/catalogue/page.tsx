'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Input, Label } from '@/components/ui'
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

export default function CataloguePage() {
  const [search, setSearch] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [selectedThickness, setSelectedThickness] = useState<number | undefined>()
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')

  // Récupérer les panneaux avec filtres
  const { data: panelsData, isLoading } = trpc.panel.list.useQuery({
    search: search || undefined,
    material: selectedMaterial || undefined,
    thickness: selectedThickness,
    supplier: selectedSupplier || undefined,
    limit: 50,
  })

  // Récupérer les fournisseurs et épaisseurs pour les filtres
  const { data: suppliers } = trpc.panel.getSuppliers.useQuery()
  const { data: thicknesses } = trpc.panel.getThicknesses.useQuery()

  const clearFilters = () => {
    setSearch('')
    setSelectedMaterial('')
    setSelectedThickness(undefined)
    setSelectedSupplier('')
  }

  const hasFilters = search || selectedMaterial || selectedThickness || selectedSupplier

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Catalogue des panneaux</h1>
            <p className="text-muted-foreground mt-2">
              Découvrez notre gamme complète de panneaux
            </p>
          </div>
          <Link href="/configurateur">
            <Button size="lg">Configurer mes pièces</Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filtres */}
          <aside className="space-y-6">
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filtres</h2>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Effacer
                  </Button>
                )}
              </div>

              {/* Recherche */}
              <div className="space-y-2">
                <Label>Recherche</Label>
                <Input
                  placeholder="Nom ou référence..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Matériau */}
              <div className="space-y-2">
                <Label>Matériau</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={selectedMaterial}
                  onChange={e => setSelectedMaterial(e.target.value)}
                >
                  <option value="">Tous les matériaux</option>
                  {MATERIALS.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fournisseur */}
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={selectedSupplier}
                  onChange={e => setSelectedSupplier(e.target.value)}
                >
                  <option value="">Tous les fournisseurs</option>
                  {suppliers?.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Épaisseur */}
              <div className="space-y-2">
                <Label>Épaisseur</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={selectedThickness ?? ''}
                  onChange={e =>
                    setSelectedThickness(e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <option value="">Toutes épaisseurs</option>
                  {thicknesses?.map(t => (
                    <option key={t} value={t}>
                      {t} mm
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Liste des panneaux */}
          <div>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4" />
                    <div className="h-5 bg-muted rounded mb-2 w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : panelsData?.panels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun panneau trouvé avec ces critères
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {panelsData?.total} panneau(x) trouvé(s)
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {panelsData?.panels.map(panel => (
                    <div
                      key={panel.id}
                      className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Aperçu couleur */}
                      <div
                        className="aspect-video flex items-center justify-center"
                        style={{
                          backgroundColor: panel.colorCode || '#e5e5e5',
                        }}
                      >
                        {panel.grainDirection && (
                          <div className="text-xs text-white/80 bg-black/30 px-2 py-1 rounded">
                            Sens du fil
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold">{panel.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {panel.reference}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                            {Number(panel.thickness)} mm
                          </span>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                            {panel.supplier}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {panel.length} x {panel.width} mm
                          </div>
                          <div className="font-semibold text-primary">
                            {Number(panel.pricePerM2).toFixed(2)} €/m²
                          </div>
                        </div>

                        {/* Chants compatibles */}
                        {panel.compatibleEdges.length > 0 && panel.compatibleEdges[0] && (
                          <div className="pt-2 border-t">
                            <div className="text-xs text-muted-foreground mb-1">
                              Chant par défaut:
                            </div>
                            <div className="text-sm">
                              {panel.compatibleEdges[0].edge.name}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
