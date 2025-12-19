import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine et fusionne les classes Tailwind de manière intelligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un nombre en devise EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Formate une surface en m²
 */
export function formatSurface(mm2: number): string {
  const m2 = mm2 / 1_000_000
  return `${m2.toFixed(2)} m²`
}

/**
 * Arrondi au centième supérieur (pour les prix)
 */
export function roundPrice(value: number): number {
  return Math.ceil(value * 100) / 100
}

/**
 * Génère un ID unique simple
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}
