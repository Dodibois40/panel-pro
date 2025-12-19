'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { WizardSteps } from './WizardSteps'
import { WizardNavigation } from './WizardNavigation'
import { PriceSummary } from './PriceSummary'
import { PartsList } from './PartsList'
import { CartSummary } from './CartSummary'

// Étapes du wizard
import {
  StepIdentification,
  StepPanel,
  StepDimensions,
  StepEdges,
  StepDrilling,
  StepHardware,
  StepMachining,
  StepFinish,
} from './steps'

const STEPS = [
  { number: 1, title: 'Identification', component: StepIdentification },
  { number: 2, title: 'Panneau', component: StepPanel },
  { number: 3, title: 'Dimensions', component: StepDimensions },
  { number: 4, title: 'Chants', component: StepEdges },
  { number: 5, title: 'Perçages', component: StepDrilling },
  { number: 6, title: 'Quincaillerie', component: StepHardware },
  { number: 7, title: 'Usinages', component: StepMachining },
  { number: 8, title: 'Finition', component: StepFinish },
]

export function ConfiguratorWizard() {
  const { currentStep, parts } = useConfiguratorStore()

  const CurrentStepComponent = STEPS[currentStep - 1]?.component

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurateur de pièces</h1>
        <p className="text-muted-foreground mt-2">
          Configurez vos panneaux étape par étape
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Zone principale */}
        <div className="space-y-6">
          {/* Indicateur d'étapes */}
          <WizardSteps steps={STEPS} currentStep={currentStep} />

          {/* Contenu de l'étape */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
              Étape {currentStep}: {STEPS[currentStep - 1]?.title}
            </h2>
            {CurrentStepComponent && <CurrentStepComponent />}
          </div>

          {/* Navigation */}
          <WizardNavigation totalSteps={STEPS.length} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Résumé panier si pièces ajoutées */}
          {parts.length > 0 && <CartSummary />}

          {/* Résumé prix pièce courante */}
          <PriceSummary />

          {/* Liste des pièces */}
          {parts.length > 0 && <PartsList />}
        </div>
      </div>
    </div>
  )
}
