'use client'

import { cn } from '@/lib/utils'
import { useConfiguratorStore } from '@/stores/configurator.store'

interface Step {
  number: number
  title: string
}

interface WizardStepsProps {
  steps: Step[]
  currentStep: number
}

export function WizardSteps({ steps, currentStep }: WizardStepsProps) {
  const { goToStep, currentPart } = useConfiguratorStore()

  // Déterminer quelles étapes sont accessibles
  const canAccessStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) return true
    if (stepNumber === 2) return !!currentPart.reference
    if (stepNumber === 3) return !!currentPart.panelId
    if (stepNumber >= 4) return currentPart.length > 0 && currentPart.width > 0
    return false
  }

  return (
    <div className="relative">
      {/* Barre de progression */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Étapes */}
      <div className="relative flex justify-between">
        {steps.map(step => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isAccessible = canAccessStep(step.number)

          return (
            <button
              key={step.number}
              onClick={() => isAccessible && goToStep(step.number)}
              disabled={!isAccessible}
              className={cn(
                'flex flex-col items-center gap-2 transition-colors',
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-background text-primary',
                  !isCompleted && !isCurrent && 'border-border bg-background text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
