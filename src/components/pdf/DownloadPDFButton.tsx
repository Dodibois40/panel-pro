'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui'

// Import dynamique pour éviter les erreurs SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)

interface DownloadPDFButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: React.ReactElement<any>
  fileName: string
  children?: React.ReactNode
}

export function DownloadPDFButton({
  document,
  fileName,
  children,
}: DownloadPDFButtonProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Button variant="outline" disabled>
        Chargement...
      </Button>
    )
  }

  return (
    <PDFDownloadLink document={document as any} fileName={fileName}>
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? 'Génération...' : children || 'Télécharger PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
