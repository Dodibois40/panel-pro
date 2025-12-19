import { Header, Footer } from '@/components/layout'
import { ConfiguratorWizard } from '@/components/configurator/ConfiguratorWizard'

export const metadata = {
  title: 'Configurateur',
  description: 'Configurez vos panneaux sur-mesure',
}

export default function ConfigurateurPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <ConfiguratorWizard />
      </main>
      <Footer />
    </div>
  )
}
