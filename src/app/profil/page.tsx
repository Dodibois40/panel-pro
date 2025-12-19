'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { trpc } from '@/lib/trpc'
import { toast } from '@/stores/toast.store'

export default function ProfilPage() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    address: '',
  })

  const { data: profile, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    enabled: !!session,
  })

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès')
      setIsEditing(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        company: profile.company || '',
        phone: profile.phone || '',
        address: profile.address || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile.mutateAsync(formData)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Connexion requise</h1>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à votre profil.
            </p>
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Mon profil</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos informations personnelles
            </p>
          </div>

          <div className="grid gap-6">
            {/* Informations du compte */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Compte</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{profile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inscrit depuis</span>
                  <span className="font-medium">
                    {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {profile?.discountRate && Number(profile.discountRate) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remise accordée</span>
                    <span className="font-medium text-primary">{Number(profile.discountRate)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations personnelles */}
            <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Informations</h2>
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        if (profile) {
                          setFormData({
                            name: profile.name || '',
                            company: profile.company || '',
                            phone: profile.phone || '',
                            address: profile.address || '',
                          })
                        }
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Société</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Nom de votre société"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Votre adresse complète"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </form>

            {/* Statistiques */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Mes statistiques</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{profile?._count?.orders ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Commandes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">
                    {Number(profile?.discountRate ?? 0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Remise fidélité</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-green-600">
                    {profile?.isActive ? 'Actif' : 'Inactif'}
                  </div>
                  <div className="text-sm text-muted-foreground">Statut</div>
                </div>
              </div>
            </div>

            {/* Liens rapides */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/mes-commandes"
                className="rounded-xl border bg-card p-6 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold mb-1">Mes commandes</h3>
                <p className="text-sm text-muted-foreground">
                  Consultez l&apos;historique de vos commandes
                </p>
              </Link>
              <Link
                href="/configurateur"
                className="rounded-xl border bg-card p-6 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold mb-1">Nouvelle commande</h3>
                <p className="text-sm text-muted-foreground">
                  Configurez vos pièces sur-mesure
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
