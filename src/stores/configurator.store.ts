/**
 * Store Zustand pour le configurateur de pièces
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EdgePosition = 'top' | 'bottom' | 'left' | 'right'

export interface EdgeConfig {
  position: EdgePosition
  edgeId: string | null
  edgeName?: string
}

export interface DrillingPoint {
  id: string
  x: number
  y: number
  diameter: number
  depth: number
  type: 'through' | 'blind'
}

export interface DrillingLine {
  id: string
  side: EdgePosition
  startOffset: number
  spacing: number
  count: number
  diameter: number
  depth: number
}

export interface HardwareDrilling {
  id: string
  hardwareId: string
  hardwareName: string
  position: { x: number; y: number }
  face: 'front' | 'back'
}

export interface MachiningOperation {
  id: string
  type: 'groove' | 'rebate' | 'notch' | 'cutout'
  dimensions: Record<string, number>
  position: Record<string, number>
}

export interface ConfiguredPart {
  // Étape 1: Identification
  reference: string
  quantity: number
  notes?: string

  // Étape 2: Panneau
  panelId: string | null
  panelName?: string
  panelMaterial?: string
  panelThickness?: number

  // Étape 3: Dimensions
  length: number
  width: number
  grainDirection: 'length' | 'width' | null

  // Étape 4: Chants
  edges: EdgeConfig[]

  // Étape 5: Perçages assemblage
  drillingPoints: DrillingPoint[]
  drillingLines: DrillingLine[]

  // Étape 6: Quincaillerie
  hardwareDrillings: HardwareDrilling[]

  // Étape 7: Usinages
  machiningOperations: MachiningOperation[]

  // Étape 8: Finition
  finish?: {
    type: 'none' | 'varnish' | 'oil' | 'wax' | 'paint'
    color?: string
    faces: ('front' | 'back' | 'both')[]
  }
}

export interface PriceBreakdown {
  panel: number
  cutting: number
  edges: number
  drilling: number
  hardware: number
  machining: number
  finish: number
  total: number
}

// Prix estimé par pièce (simplifié pour demo)
export interface PartWithPrice extends ConfiguredPart {
  calculatedPrice?: number
}

interface ConfiguratorState {
  // État courant
  currentStep: number
  currentPart: ConfiguredPart
  parts: PartWithPrice[]
  priceBreakdown: PriceBreakdown

  // Actions navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Actions pièce courante
  updatePart: (updates: Partial<ConfiguredPart>) => void
  resetPart: () => void

  // Actions liste pièces
  addPart: () => void
  removePart: (index: number) => void
  editPart: (index: number) => void
  duplicatePart: (index: number) => void

  // Actions prix
  updatePrice: (breakdown: PriceBreakdown) => void
  getCartTotal: () => number

  // Reset complet
  resetAll: () => void
}

// ═══════════════════════════════════════════════════════════════════════════
// VALEURS PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════════════

const defaultEdges: EdgeConfig[] = [
  { position: 'top', edgeId: null },
  { position: 'bottom', edgeId: null },
  { position: 'left', edgeId: null },
  { position: 'right', edgeId: null },
]

const defaultPart: ConfiguredPart = {
  reference: '',
  quantity: 1,
  panelId: null,
  length: 0,
  width: 0,
  grainDirection: null,
  edges: defaultEdges,
  drillingPoints: [],
  drillingLines: [],
  hardwareDrillings: [],
  machiningOperations: [],
}

const defaultPriceBreakdown: PriceBreakdown = {
  panel: 0,
  cutting: 0,
  edges: 0,
  drilling: 0,
  hardware: 0,
  machining: 0,
  finish: 0,
  total: 0,
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      currentPart: { ...defaultPart },
      parts: [],
      priceBreakdown: { ...defaultPriceBreakdown },

      nextStep: () => {
        const { currentStep } = get()
        if (currentStep < 8) {
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      goToStep: (step: number) => {
        if (step >= 1 && step <= 8) {
          set({ currentStep: step })
        }
      },

      updatePart: (updates: Partial<ConfiguredPart>) => {
        set(state => ({
          currentPart: { ...state.currentPart, ...updates },
        }))
      },

      resetPart: () => {
        set({
          currentPart: { ...defaultPart },
          currentStep: 1,
          priceBreakdown: { ...defaultPriceBreakdown },
        })
      },

      addPart: () => {
        const { currentPart, parts, priceBreakdown } = get()
        if (currentPart.panelId && currentPart.length > 0 && currentPart.width > 0) {
          const partWithPrice: PartWithPrice = {
            ...currentPart,
            calculatedPrice: priceBreakdown.total * currentPart.quantity,
          }
          set({
            parts: [...parts, partWithPrice],
            currentPart: { ...defaultPart },
            currentStep: 1,
            priceBreakdown: { ...defaultPriceBreakdown },
          })
        }
      },

      removePart: (index: number) => {
        set(state => ({
          parts: state.parts.filter((_, i) => i !== index),
        }))
      },

      editPart: (index: number) => {
        const { parts } = get()
        if (parts[index]) {
          set({
            currentPart: { ...parts[index] },
            currentStep: 1,
            parts: parts.filter((_, i) => i !== index),
          })
        }
      },

      duplicatePart: (index: number) => {
        const { parts } = get()
        if (parts[index]) {
          const duplicated = {
            ...parts[index],
            reference: `${parts[index].reference}-copie`,
          }
          set({
            parts: [...parts, duplicated],
          })
        }
      },

      updatePrice: (breakdown: PriceBreakdown) => {
        set({ priceBreakdown: breakdown })
      },

      getCartTotal: () => {
        const { parts } = get()
        return parts.reduce((total, part) => {
          // Si le prix calculé existe, l'utiliser, sinon estimer basé sur surface
          const price = part.calculatedPrice ?? (part.length * part.width / 10000) * 50 * part.quantity
          return total + price
        }, 0)
      },

      resetAll: () => {
        set({
          currentStep: 1,
          currentPart: { ...defaultPart },
          parts: [],
          priceBreakdown: { ...defaultPriceBreakdown },
        })
      },
    }),
    {
      name: 'panel-pro-configurator',
      partialize: state => ({
        currentPart: state.currentPart,
        parts: state.parts,
        currentStep: state.currentStep,
      }),
    }
  )
)
