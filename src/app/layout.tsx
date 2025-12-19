import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import '@/app/globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { TRPCProvider } from '@/providers/TRPCProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Panel Pro - Configurateur de panneaux',
    template: '%s | Panel Pro',
  },
  description:
    'Configurateur professionnel de débit de panneaux d\'agencement bois. Commandez vos panneaux sur-mesure avec découpes, chants, perçages et finitions.',
  keywords: ['panneaux', 'agencement', 'bois', 'configurateur', 'menuiserie', 'débit'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Panel Pro',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Panel Pro',
    title: 'Panel Pro - Configurateur de panneaux',
    description: 'Configurateur professionnel de débit de panneaux d\'agencement bois.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <TRPCProvider>
              {children}
              <ToastProvider />
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
