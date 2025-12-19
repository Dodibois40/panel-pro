import Link from 'next/link'

import { Button } from '@/components/ui'
import { Header, Footer } from '@/components/layout'

const FEATURES = [
  {
    title: 'Découpe précise',
    description: 'Découpe numérique au 1/10ème de mm sur machines CNC professionnelles.',
    icon: '✂️',
  },
  {
    title: 'Chants thermocollés',
    description: 'Pose de chants ABS, PVC ou bois massif, avec option laser sans joint.',
    icon: '📏',
  },
  {
    title: 'Perçages assemblage',
    description: 'Perçage système 32, tourillons, excentriques et quincaillerie.',
    icon: '🔩',
  },
  {
    title: 'Usinages spéciaux',
    description: 'Rainures, feuillures, encoches et découpes intérieures.',
    icon: '⚙️',
  },
]

const MATERIALS = [
  { name: 'Mélaminé', description: 'Large choix de décors' },
  { name: 'MDF', description: 'Standard ou laqué' },
  { name: 'Stratifié', description: 'Haute résistance' },
  { name: 'Contreplaqué', description: 'Bois massif' },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              Configurateur en ligne
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Configurez vos <span className="text-primary">panneaux sur-mesure</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Débit de panneaux professionnel avec découpes, chants, perçages et finitions.
              Commandez en ligne et suivez vos projets en temps réel.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/configurateur">
                <Button size="lg" className="text-base px-8">
                  Commencer un devis
                </Button>
              </Link>
              <Link href="/catalogue">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Voir le catalogue
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Nos services</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Un accompagnement complet pour vos projets d&apos;agencement
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <div key={index} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold mb-12">Comment ça marche ?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="font-semibold text-lg">Choisissez votre panneau</h3>
                <p className="text-muted-foreground">
                  Parcourez notre catalogue de panneaux mélaminés, MDF, stratifiés et sélectionnez le matériau adapté à votre projet.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="font-semibold text-lg">Configurez vos pièces</h3>
                <p className="text-muted-foreground">
                  Définissez dimensions, chants, perçages et usinages pour chaque pièce avec notre configurateur intuitif.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="font-semibold text-lg">Validez et récupérez</h3>
                <p className="text-muted-foreground">
                  Vérifiez votre devis en temps réel, passez commande et récupérez vos pièces prêtes à assembler.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Nos matériaux</h2>
              <p className="mt-4 text-muted-foreground">
                Un large choix de panneaux pour tous vos projets
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MATERIALS.map((material, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-card p-6 text-center hover:border-primary transition-colors"
                >
                  <h3 className="font-semibold">{material.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/catalogue">
                <Button variant="outline">Voir tout le catalogue</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              <div>
                <div className="text-4xl font-bold text-primary">500+</div>
                <div className="text-muted-foreground mt-2">Références panneaux</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">24h</div>
                <div className="text-muted-foreground mt-2">Délai express</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">0.1mm</div>
                <div className="text-muted-foreground mt-2">Précision de coupe</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">100%</div>
                <div className="text-muted-foreground mt-2">En ligne</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <div className="rounded-2xl bg-primary p-8 md:p-12 text-center text-primary-foreground">
              <h2 className="text-2xl font-bold md:text-3xl">Prêt à démarrer votre projet ?</h2>
              <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
                Créez votre compte gratuitement et commencez à configurer vos panneaux.
                Devis instantané et suivi en temps réel.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <Button variant="secondary" size="lg">
                    Créer un compte gratuit
                  </Button>
                </Link>
                <Link href="/configurateur">
                  <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Tester sans compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
