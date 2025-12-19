'use client'

import { useState } from 'react'

import { Button, Input, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'

export default function AdminChantsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = trpc.edge.list.useQuery({})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Catalogue chants</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les références de chants disponibles
          </p>
        </div>
        <Button>+ Ajouter un chant</Button>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <Input
          placeholder="Rechercher un chant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <div className="text-muted-foreground">
            Aucun chant trouvé
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
                <th className="text-left p-4 font-medium">Dimensions</th>
                <th className="text-left p-4 font-medium">Prix/ml</th>
                <th className="text-left p-4 font-medium">Statut</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data
                .filter(edge =>
                  !search ||
                  edge.name.toLowerCase().includes(search.toLowerCase()) ||
                  edge.reference.toLowerCase().includes(search.toLowerCase())
                )
                .map(edge => (
                  <tr key={edge.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div
                        className="w-10 h-4 rounded border"
                        style={{ backgroundColor: edge.colorCode || '#e5e5e5' }}
                      />
                    </td>
                    <td className="p-4 font-mono text-sm">{edge.reference}</td>
                    <td className="p-4 font-medium">{edge.name}</td>
                    <td className="p-4 text-sm">{edge.material}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {Number(edge.thickness)} x {Number(edge.width)} mm
                    </td>
                    <td className="p-4 font-medium">{Number(edge.pricePerMeter).toFixed(2)} €</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        edge.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {edge.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          Modifier
                        </Button>
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
