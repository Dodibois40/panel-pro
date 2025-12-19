'use client'

import { useMemo } from 'react'
import type { ConfiguredPart, PriceBreakdown } from '@/stores/configurator.store'

// Tarifs par défaut (seront chargés depuis la DB en production)
const DEFAULT_PRICING = {
  // Découpe
  COUPE_PANNEAU: 1.5,
  COUPE_MINIMUM: 5,
  // Chants
  POSE_CHANT_ML: 2.0,
  POSE_CHANT_LASER_ML: 3.5,
  // Perçage
  PERCAGE_UNITAIRE: 0.15,
  PERCAGE_LIGNE: 2.0,
  // Usinage
  RAINURE_ML: 3.0,
  FEUILLURE_ML: 4.0,
  ENCOCHE_UNITAIRE: 5.0,
  DECOUPE_UNITAIRE: 8.0,
  // Quincaillerie pose
  HARDWARE_UNITAIRE: 1.0,
  // Finitions multiplicateurs
  FINISH_VARNISH: 1.4,
  FINISH_OIL: 1.3,
  FINISH_WAX: 1.2,
  FINISH_PAINT: 1.8,
}

interface PanelInfo {
  pricePerM2: number
  thickness: number
}

interface EdgeInfo {
  pricePerMeter: number
  isLaser?: boolean
}

export function useCalculatePrice(
  part: ConfiguredPart,
  panelInfo?: PanelInfo,
  edgeInfos?: Map<string, EdgeInfo>
): PriceBreakdown {
  return useMemo(() => {
    const breakdown: PriceBreakdown = {
      panel: 0,
      cutting: 0,
      edges: 0,
      drilling: 0,
      hardware: 0,
      machining: 0,
      finish: 0,
      total: 0,
    }

    if (!part.panelId || !panelInfo) {
      return breakdown
    }

    const { length, width } = part
    const quantity = part.quantity || 1

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL PANNEAUX
    // ═══════════════════════════════════════════════════════════════════════════
    const surfaceM2 = (length / 1000) * (width / 1000)
    breakdown.panel = surfaceM2 * panelInfo.pricePerM2 * quantity

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL DÉCOUPE
    // ═══════════════════════════════════════════════════════════════════════════
    // 2 coupes par pièce (longueur + largeur)
    const cuttingCost = DEFAULT_PRICING.COUPE_PANNEAU * 2 * quantity
    breakdown.cutting = Math.max(cuttingCost, DEFAULT_PRICING.COUPE_MINIMUM)

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL CHANTS
    // ═══════════════════════════════════════════════════════════════════════════
    let edgeCost = 0

    for (const edge of part.edges) {
      if (edge.edgeId) {
        // Calculer la longueur selon la position
        const edgeLength =
          edge.position === 'top' || edge.position === 'bottom' ? length : width
        const ml = (edgeLength / 1000) * quantity

        // Récupérer le prix du chant si disponible
        const edgeInfo = edgeInfos?.get(edge.edgeId)
        const pricePerMl = edgeInfo?.isLaser
          ? DEFAULT_PRICING.POSE_CHANT_LASER_ML
          : DEFAULT_PRICING.POSE_CHANT_ML

        edgeCost += ml * pricePerMl
        if (edgeInfo) {
          edgeCost += ml * edgeInfo.pricePerMeter
        }
      }
    }

    breakdown.edges = edgeCost

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL PERÇAGES
    // ═══════════════════════════════════════════════════════════════════════════
    let drillingCost = 0

    // Lignes de perçage
    for (const line of part.drillingLines) {
      // Prix par ligne + prix par trou
      drillingCost += DEFAULT_PRICING.PERCAGE_LIGNE * quantity
      drillingCost += line.count * DEFAULT_PRICING.PERCAGE_UNITAIRE * quantity
    }

    // Points de perçage individuels
    drillingCost += part.drillingPoints.length * DEFAULT_PRICING.PERCAGE_UNITAIRE * quantity

    breakdown.drilling = drillingCost

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL QUINCAILLERIE
    // ═══════════════════════════════════════════════════════════════════════════
    let hardwareCost = 0

    for (const _hw of part.hardwareDrillings) {
      hardwareCost += DEFAULT_PRICING.HARDWARE_UNITAIRE * quantity
    }

    breakdown.hardware = hardwareCost

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL USINAGES
    // ═══════════════════════════════════════════════════════════════════════════
    let machiningCost = 0

    for (const op of part.machiningOperations) {
      switch (op.type) {
        case 'groove': {
          // Rainure: longueur estimée (tout le panneau)
          const grooveLength = length / 1000
          machiningCost += grooveLength * DEFAULT_PRICING.RAINURE_ML * quantity
          break
        }
        case 'rebate': {
          // Feuillure: périmètre selon nombre de côtés
          const sides = (op.position.sides as number) || 4
          const perimeterMl = ((length * 2 + width * 2) / 1000) * (sides / 4)
          machiningCost += perimeterMl * DEFAULT_PRICING.FEUILLURE_ML * quantity
          break
        }
        case 'notch':
          machiningCost += DEFAULT_PRICING.ENCOCHE_UNITAIRE * quantity
          break
        case 'cutout':
          machiningCost += DEFAULT_PRICING.DECOUPE_UNITAIRE * quantity
          break
      }
    }

    breakdown.machining = machiningCost

    // ═══════════════════════════════════════════════════════════════════════════
    // CALCUL FINITIONS
    // ═══════════════════════════════════════════════════════════════════════════
    if (part.finish) {
      const finishMultipliers: Record<string, number> = {
        varnish: DEFAULT_PRICING.FINISH_VARNISH,
        oil: DEFAULT_PRICING.FINISH_OIL,
        wax: DEFAULT_PRICING.FINISH_WAX,
        paint: DEFAULT_PRICING.FINISH_PAINT,
      }
      const multiplier = finishMultipliers[part.finish.type] || 1
      const basePrice = breakdown.panel
      breakdown.finish = basePrice * (multiplier - 1)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TOTAL
    // ═══════════════════════════════════════════════════════════════════════════
    breakdown.total =
      breakdown.panel +
      breakdown.cutting +
      breakdown.edges +
      breakdown.drilling +
      breakdown.hardware +
      breakdown.machining +
      breakdown.finish

    // Arrondir à 2 décimales
    Object.keys(breakdown).forEach(key => {
      breakdown[key as keyof PriceBreakdown] =
        Math.round(breakdown[key as keyof PriceBreakdown] * 100) / 100
    })

    return breakdown
  }, [part, panelInfo, edgeInfos])
}

/**
 * Calcule le prix total pour une liste de pièces (simplifié)
 */
export function calculateOrderTotal(
  parts: ConfiguredPart[],
  panelInfos: Map<string, PanelInfo>
): number {
  let total = 0

  for (const part of parts) {
    if (!part.panelId) continue

    const panelInfo = panelInfos.get(part.panelId)
    if (panelInfo) {
      const surfaceM2 = (part.length / 1000) * (part.width / 1000)
      const panelCost = surfaceM2 * panelInfo.pricePerM2 * part.quantity

      // Ajouter les autres coûts (simplifié)
      const cuttingCost = DEFAULT_PRICING.COUPE_PANNEAU * 2 * part.quantity
      const edgeCount = part.edges.filter(e => e.edgeId !== null).length
      const edgeCost =
        edgeCount * ((part.length + part.width) / 2000) * DEFAULT_PRICING.POSE_CHANT_ML * part.quantity

      total += panelCost + cuttingCost + edgeCost
    }
  }

  return Math.round(total * 100) / 100
}
