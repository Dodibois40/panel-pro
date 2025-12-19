'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useConfiguratorStore } from '@/stores/configurator.store'

import { Button, ThemeToggle } from '@/components/ui'

export function Header() {
  const { data: session, status } = useSession()
  const parts = useConfiguratorStore(state => state.parts)
  const cartCount = parts.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Panel Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/catalogue"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Catalogue
            </Link>
            <Link
              href="/configurateur"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Configurateur
            </Link>
            {session && (
              <Link
                href="/mes-commandes"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Mes commandes
              </Link>
            )}
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Administration
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Indicateur panier */}
          {cartCount > 0 && (
            <Link
              href="/configurateur"
              className="relative flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Panier</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {cartCount}
              </span>
            </Link>
          )}

          {status === 'loading' ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profil"
                className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {session.user?.name || session.user?.email}
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Inscription</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
