'use client'

import { useConfiguratorStore } from '@/stores/configurator.store'
import { Button } from '@/components/ui'

interface WizardNavigationProps {
  totalSteps: number
}

export function WizardNavigation({ totalSteps }: WizardNavigationProps) {
  const { currentStep, nextStep, prevStep, addPart, currentPart } = useConfiguratorStore()

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  // Validation pour passer à l'étape suivante
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!currentPart.reference && currentPart.quantity > 0
      case 2:
        return !!currentPart.panelId
      case 3:
        return currentPart.length > 0 && currentPart.width > 0
      default:
        return true
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      addPart()
    } else {
      nextStep()
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4">
      <Button variant="outline" onClick={prevStep} disabled={isFirstStep}>
        Précédent
      </Button>

      <div className="text-sm text-muted-foreground">
        Étape {currentStep} sur {totalSteps}
      </div>

      <Button onClick={handleNext} disabled={!canProceed()}>
        {isLastStep ? 'Ajouter la pièce' : 'Suivant'}
      </Button>
    </div>
  )
}
