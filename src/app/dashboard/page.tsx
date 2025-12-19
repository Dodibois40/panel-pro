import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Header, Footer } from '@/components/layout'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bonjour, {session.user?.name || 'Utilisateur'}</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue sur votre espace client Panel Pro
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Nouvelle commande */}
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle commande</CardTitle>
              <CardDescription>
                Configurez et commandez vos panneaux sur-mesure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/configurateur">
                <Button className="w-full">Démarrer une commande</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mes commandes */}
          <Card>
            <CardHeader>
              <CardTitle>Mes commandes</CardTitle>
              <CardDescription>
                Consultez l&apos;historique de vos commandes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/commandes">
                <Button variant="outline" className="w-full">
                  Voir mes commandes
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Catalogue */}
          <Card>
            <CardHeader>
              <CardTitle>Catalogue</CardTitle>
              <CardDescription>
                Parcourez notre catalogue de panneaux et chants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/catalogue">
                <Button variant="outline" className="w-full">
                  Voir le catalogue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Commandes récentes */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Commandes récentes</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground py-8">
                Aucune commande pour le moment.
                <br />
                <Link href="/configurateur" className="text-primary hover:underline">
                  Créer votre première commande
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
