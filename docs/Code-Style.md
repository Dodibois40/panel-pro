# Code Style Guide - Panel Pro

## Vue d'Ensemble

Ce guide définit les conventions de code pour le projet Panel Pro. Ces règles sont appliquées automatiquement via ESLint et Prettier.

---

## Configuration Outils

### ESLint

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ),
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",

      // React
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }],
      "import/no-duplicates": "error",

      // General
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
    }
  },
  {
    // Fichiers de config - règles assouplies
    files: ["*.config.js", "*.config.ts", "*.config.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    }
  }
];

export default eslintConfig;
```

### Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "clsx"]
}
```

```
// .prettierignore
node_modules
.next
dist
build
coverage
*.min.js
pnpm-lock.yaml
```

### TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@/stores/*": ["./stores/*"],
      "@/services/*": ["./services/*"],
      "@/types/*": ["./types/*"],
      "@/schemas/*": ["./schemas/*"],
      "@/server/*": ["./server/*"]
    },

    // Règles strictes
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Conventions de Nommage

### Fichiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONVENTION DE NOMMAGE DES FICHIERS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Type                    │ Convention        │ Exemple                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Composants React        │ PascalCase.tsx    │ PanelViewer.tsx              │
│  Pages Next.js           │ page.tsx          │ app/admin/page.tsx           │
│  Layouts                 │ layout.tsx        │ app/admin/layout.tsx         │
│  Hooks                   │ camelCase.ts      │ usePanelConfig.ts            │
│  Utilitaires             │ camelCase.ts      │ priceCalculation.ts          │
│  Services                │ camelCase.ts      │ orderService.ts              │
│  Types                   │ camelCase.ts      │ panel.types.ts               │
│  Schemas Zod             │ camelCase.ts      │ panel.schema.ts              │
│  Constantes              │ camelCase.ts      │ constants.ts                 │
│  Tests                   │ *.test.ts(x)      │ PanelViewer.test.tsx         │
│  Stores Zustand          │ camelCase.ts      │ configurateur.store.ts       │
│  Routers tRPC            │ camelCase.ts      │ panel.router.ts              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Variables et Fonctions

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

// camelCase pour les variables
const panelWidth = 800
const isLoading = false
const selectedEdges = []

// SCREAMING_SNAKE_CASE pour les constantes globales
const MAX_PANEL_WIDTH = 2800
const DEFAULT_MARGIN_COEFFICIENT = 1.35
const API_ENDPOINTS = { ... }

// Préfixes booléens : is, has, can, should
const isActive = true
const hasEdges = edges.length > 0
const canSubmit = isValid && !isLoading
const shouldShowPrice = quantity > 0


// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// camelCase, verbe d'action en premier
function calculatePrice() { }
function validateDimensions() { }
function fetchPanelsCatalog() { }
function handleSubmit() { }
function formatCurrency() { }

// Handlers : handle + Noun + Verb (ou Event)
function handlePanelSelect() { }
function handleEdgeClick() { }
function handleFormSubmit() { }
function handleInputChange() { }

// Getters : get + Noun
function getPanelById() { }
function getFormattedPrice() { }
function getTotalQuantity() { }

// Setters : set + Noun
function setPanelDimensions() { }
function setEdgeConfig() { }

// Validateurs : validate/check/is + Noun
function validateOrder() { }
function checkAvailability() { }
function isValidDimension() { }

// Transformateurs : transform/convert/format/parse + Noun
function formatPrice() { }
function parseApiResponse() { }
function convertToMillimeters() { }
```

### Composants React

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANTS - PascalCase
// ═══════════════════════════════════════════════════════════════════════════

// Nom descriptif de ce que fait le composant
function PanelViewer() { }
function EdgeSelector() { }
function PriceSummary() { }
function OrderConfirmation() { }

// Props : NomComposant + Props
interface PanelViewerProps {
  width: number
  height: number
  onEdgeClick: (position: EdgePosition) => void
}

// Composants internes : préfixe du parent
function PanelViewerCanvas() { }    // Sous-composant de PanelViewer
function PanelViewerControls() { }  // Sous-composant de PanelViewer


// ═══════════════════════════════════════════════════════════════════════════
// HOOKS - use + NomDescriptif
// ═══════════════════════════════════════════════════════════════════════════

function usePanelConfig() { }
function usePriceCalculation() { }
function useOrderHistory() { }
function useDebounce() { }

// Return type explicite pour les hooks complexes
interface UsePanelConfigReturn {
  panel: Panel | null
  setPanel: (panel: Panel) => void
  isLoading: boolean
  error: Error | null
}

function usePanelConfig(): UsePanelConfigReturn { }
```

### Types et Interfaces

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// TYPES ET INTERFACES - PascalCase
// ═══════════════════════════════════════════════════════════════════════════

// Interfaces pour les objets avec structure fixe
interface Panel {
  id: string
  reference: string
  name: string
  pricePerM2: number
}

// Types pour les unions, intersections, utilitaires
type EdgePosition = 'top' | 'bottom' | 'left' | 'right'
type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'completed'
type PanelWithEdges = Panel & { edges: Edge[] }

// Enums : PascalCase, valeurs SCREAMING_SNAKE ou PascalCase
enum PanelMaterial {
  MELAMINE = 'MELAMINE',
  MDF = 'MDF',
  STRATIFIE = 'STRATIFIE',
}

// Props : NomComposantProps
interface ButtonProps { }
interface PanelViewerProps { }

// API Response : NomResponse
interface PanelListResponse { }
interface OrderCreateResponse { }

// API Request : NomRequest
interface OrderCreateRequest { }
interface PanelFilterRequest { }

// State : NomState
interface ConfigurateurState { }
interface PanierState { }
```

---

## Structure des Composants

### Template Composant Standard

```tsx
// components/configurateur/PanelCard.tsx

// ═══════════════════════════════════════════════════════════════════════════
// 1. IMPORTS (groupés et ordonnés)
// ═══════════════════════════════════════════════════════════════════════════

// React et hooks
import { memo, useCallback, useState } from 'react'

// Librairies externes
import { Check } from 'lucide-react'

// Composants internes
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Hooks personnalisés
import { usePanelConfig } from '@/hooks/usePanelConfig'

// Utils et helpers
import { cn, formatCurrency } from '@/lib/utils'

// Types
import type { Panel } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════
// 2. TYPES LOCAUX
// ═══════════════════════════════════════════════════════════════════════════

interface PanelCardProps {
  panel: Panel
  isSelected?: boolean
  onSelect: (panel: Panel) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const PanelCard = memo(function PanelCard({
  panel,
  isSelected = false,
  onSelect,
  className,
}: PanelCardProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // State local
  // ─────────────────────────────────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // Hooks
  // ─────────────────────────────────────────────────────────────────────────
  const { formatThickness } = usePanelConfig()

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    onSelect(panel)
  }, [onSelect, panel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(panel)
      }
    },
    [onSelect, panel]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
        isHovered && !isSelected && 'shadow-md',
        className
      )}
    >
      <CardContent className="p-4">
        {/* Image */}
        {panel.imageUrl && (
          <div className="relative mb-3 aspect-video overflow-hidden rounded-md bg-muted">
            <img
              src={panel.imageUrl}
              alt={panel.name}
              className="h-full w-full object-cover"
            />
            {isSelected && (
              <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Infos */}
        <h3 className="font-medium leading-tight">{panel.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{panel.reference}</p>

        {/* Specs */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{formatThickness(panel.thickness)}</Badge>
          <Badge variant="outline">{panel.supplier}</Badge>
        </div>

        {/* Prix */}
        <p className="mt-3 text-lg font-semibold">
          {formatCurrency(panel.pricePerM2)}/m²
        </p>
      </CardContent>
    </Card>
  )
})
```

### Template Hook Personnalisé

```typescript
// hooks/usePriceCalculation.ts

// ═══════════════════════════════════════════════════════════════════════════
// 1. IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo } from 'react'

import { useConfigurateur } from '@/stores/configurateur.store'
import {
  calculateMaterial,
  calculateCutting,
  calculateEdging,
  calculateTotal,
} from '@/services/price'

import type { PriceBreakdown } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════
// 2. TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface UsePriceCalculationReturn {
  breakdown: PriceBreakdown
  unitPrice: number
  totalPrice: number
  isCalculating: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function usePriceCalculation(): UsePriceCalculationReturn {
  // ─────────────────────────────────────────────────────────────────────────
  // State from store
  // ─────────────────────────────────────────────────────────────────────────
  const { part, pricingConfig } = useConfigurateur()

  // ─────────────────────────────────────────────────────────────────────────
  // Memoized calculations
  // ─────────────────────────────────────────────────────────────────────────
  const breakdown = useMemo<PriceBreakdown>(() => {
    if (!part.panel) {
      return getEmptyBreakdown()
    }

    const material = calculateMaterial(part, pricingConfig)
    const cutting = calculateCutting(part, pricingConfig)
    const edging = calculateEdging(part, pricingConfig)
    // ... autres calculs

    return calculateTotal({
      material,
      cutting,
      edging,
      // ...
    })
  }, [part, pricingConfig])

  const unitPrice = useMemo(() => breakdown.unitTotal, [breakdown])

  const totalPrice = useMemo(
    () => breakdown.unitTotal * part.quantity,
    [breakdown, part.quantity]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────
  return {
    breakdown,
    unitPrice,
    totalPrice,
    isCalculating: false,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. HELPERS (privés au module)
// ═══════════════════════════════════════════════════════════════════════════

function getEmptyBreakdown(): PriceBreakdown {
  return {
    material: 0,
    cutting: 0,
    edging: 0,
    drilling: 0,
    machining: 0,
    finishing: 0,
    subtotal: 0,
    unitTotal: 0,
  }
}
```

### Template Service

```typescript
// services/price/calculateEdging.ts

// ═══════════════════════════════════════════════════════════════════════════
// 1. IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

import type { EdgeConfig, PricingConfig, PartConfig } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════
// 2. TYPES LOCAUX
// ═══════════════════════════════════════════════════════════════════════════

interface EdgeCalculation {
  position: string
  lengthMl: number
  materialPrice: number
  laborPrice: number
  total: number
}

interface EdgingResult {
  details: EdgeCalculation[]
  total: number
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const EDGE_POSITIONS = ['top', 'bottom', 'left', 'right'] as const

// ═══════════════════════════════════════════════════════════════════════════
// 4. FONCTION PRINCIPALE (exportée)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule le prix total du placage de chants
 *
 * @param part - Configuration de la pièce
 * @param pricing - Paramètres de tarification
 * @returns Détail et total du prix des chants
 */
export function calculateEdging(
  part: PartConfig,
  pricing: PricingConfig
): EdgingResult {
  const details: EdgeCalculation[] = []

  const dimensions = {
    top: part.length,
    bottom: part.length,
    left: part.width,
    right: part.width,
  }

  for (const position of EDGE_POSITIONS) {
    const edgeConfig = part.edges[position]

    if (!edgeConfig) {
      continue
    }

    const calculation = calculateSingleEdge(
      position,
      dimensions[position],
      edgeConfig,
      pricing
    )

    details.push(calculation)
  }

  const total = roundToTwoDecimals(
    details.reduce((sum, edge) => sum + edge.total, 0)
  )

  return { details, total }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. FONCTIONS HELPERS (privées)
// ═══════════════════════════════════════════════════════════════════════════

function calculateSingleEdge(
  position: string,
  lengthMm: number,
  config: EdgeConfig,
  pricing: PricingConfig
): EdgeCalculation {
  const lengthMl = lengthMm / 1000

  const materialPrice = lengthMl * config.pricePerMeter
  const laborPrice = lengthMl * pricing.edgingLaborPerMeter

  const total = roundToTwoDecimals(materialPrice + laborPrice)

  return {
    position,
    lengthMl,
    materialPrice,
    laborPrice,
    total,
  }
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}
```

---

## Patterns React

### État et Props

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// GESTION DES PROPS
// ═══════════════════════════════════════════════════════════════════════════

// ✅ Destructuration avec valeurs par défaut
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  // ...
}

// ✅ Spread des props restantes
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

function Card({ title, className, ...props }: CardProps) {
  return (
    <div className={cn('card', className)} {...props}>
      <h2>{title}</h2>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CALLBACKS STABLES
// ═══════════════════════════════════════════════════════════════════════════

// ✅ useCallback pour les handlers passés en props
const handleSelect = useCallback((id: string) => {
  setSelectedId(id)
}, [])

// ✅ useMemo pour les calculs coûteux
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT DÉRIVÉ
// ═══════════════════════════════════════════════════════════════════════════

// ❌ MAUVAIS : état redondant
const [items, setItems] = useState([])
const [itemCount, setItemCount] = useState(0) // Redondant !

// ✅ BON : état dérivé calculé
const [items, setItems] = useState([])
const itemCount = items.length // Dérivé directement
```

### Rendu Conditionnel

```tsx
// ═══════════════════════════════════════════════════════════════════════════
// RENDU CONDITIONNEL
// ═══════════════════════════════════════════════════════════════════════════

// ✅ Early return pour les états de chargement/erreur
function PanelList({ isLoading, error, panels }: PanelListProps) {
  if (isLoading) {
    return <Skeleton />
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  if (panels.length === 0) {
    return <EmptyState message="Aucun panneau trouvé" />
  }

  return (
    <ul>
      {panels.map(panel => (
        <PanelCard key={panel.id} panel={panel} />
      ))}
    </ul>
  )
}

// ✅ Ternaire pour choix simple inline
return (
  <Button variant={isActive ? 'primary' : 'secondary'}>
    {isLoading ? 'Chargement...' : 'Valider'}
  </Button>
)

// ✅ && pour affichage conditionnel simple
return (
  <div>
    {showPrice && <PriceSummary />}
    {error && <ErrorBanner error={error} />}
  </div>
)
```

### Gestion des Formulaires

```tsx
// ═══════════════════════════════════════════════════════════════════════════
// FORMULAIRES AVEC REACT HOOK FORM + ZOD
// ═══════════════════════════════════════════════════════════════════════════

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Schéma Zod
const panelFormSchema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  name: z.string().min(2, 'Nom trop court'),
  thickness: z.number().min(1).max(100),
  pricePerM2: z.number().positive('Prix invalide'),
})

type PanelFormValues = z.infer<typeof panelFormSchema>

// 2. Composant formulaire
function PanelForm({ onSubmit }: PanelFormProps) {
  const form = useForm<PanelFormValues>({
    resolver: zodResolver(panelFormSchema),
    defaultValues: {
      reference: '',
      name: '',
      thickness: 18,
      pricePerM2: 0,
    },
  })

  const handleSubmit = form.handleSubmit(async data => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      form.setError('root', { message: 'Erreur lors de la sauvegarde' })
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        control={form.control}
        name="reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Référence</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* ... autres champs */}

      {form.formState.errors.root && (
        <Alert variant="destructive">
          {form.formState.errors.root.message}
        </Alert>
      )}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  )
}
```

---

## TypeScript Strict

### Types Stricts

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ÉVITER any - TOUJOURS typer
// ═══════════════════════════════════════════════════════════════════════════

// ❌ INTERDIT
function processData(data: any) { }
const result: any = fetchData()

// ✅ OBLIGATOIRE
function processData(data: PanelData) { }
const result: PanelListResponse = await fetchData()

// Si type inconnu, utiliser unknown + type guard
function processUnknown(data: unknown) {
  if (isPanelData(data)) {
    // data est maintenant typé PanelData
    console.log(data.reference)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

function isPanelData(data: unknown): data is PanelData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'reference' in data &&
    'name' in data
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPES DISCRIMINÉES
// ═══════════════════════════════════════════════════════════════════════════

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function handleResult<T>(result: ApiResult<T>) {
  if (result.success) {
    // TypeScript sait que result.data existe
    return result.data
  } else {
    // TypeScript sait que result.error existe
    throw new Error(result.error)
  }
}
```

### Null Safety

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// GESTION DES NULL/UNDEFINED
// ═══════════════════════════════════════════════════════════════════════════

// ✅ Optional chaining
const userName = user?.profile?.name

// ✅ Nullish coalescing (préféré à ||)
const count = value ?? 0  // Seulement si null/undefined
const count = value || 0  // Aussi si 0, '', false (souvent non voulu)

// ✅ Vérification explicite avant usage
function getPanel(id: string): Panel | null {
  const panel = panels.find(p => p.id === id)
  return panel ?? null
}

// Usage
const panel = getPanel(id)
if (!panel) {
  throw new Error(`Panel ${id} not found`)
}
// Ici panel est garanti non-null

// ✅ Non-null assertion SEULEMENT si certain
const element = document.getElementById('app')!
// À utiliser avec parcimonie, préférer les checks

// ═══════════════════════════════════════════════════════════════════════════
// TYPES UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

// Rendre des champs optionnels
type PartialPanel = Partial<Panel>

// Rendre des champs requis
type RequiredPanel = Required<Panel>

// Sélectionner des champs
type PanelPreview = Pick<Panel, 'id' | 'name' | 'imageUrl'>

// Exclure des champs
type PanelWithoutId = Omit<Panel, 'id'>

// Readonly
type ImmutablePanel = Readonly<Panel>
```

---

## Commentaires

### Quand Commenter

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// COMMENTAIRES : QUALITÉ > QUANTITÉ
// ═══════════════════════════════════════════════════════════════════════════

// ❌ INUTILE : Commentaire qui répète le code
// Incrémente le compteur
count++

// Récupère l'utilisateur par ID
const user = getUserById(id)

// ✅ UTILE : Explique le POURQUOI, pas le QUOI

// On arrondit au centième supérieur pour éviter les pertes sur les petites pièces
const price = Math.ceil(rawPrice * 100) / 100

// Délai de 300ms pour laisser l'animation de fermeture se terminer
setTimeout(() => cleanup(), 300)

// Le coefficient 1.35 est la marge standard définie par la direction commerciale
const MARGIN_COEFFICIENT = 1.35

// ═══════════════════════════════════════════════════════════════════════════
// TODO / FIXME
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implémenter le cache pour les requêtes catalogue
// FIXME: Le calcul est incorrect pour les panneaux > 2m²
// HACK: Contournement temporaire du bug #123, à supprimer après fix API
// NOTE: Cette fonction sera dépréciée en v2

// ═══════════════════════════════════════════════════════════════════════════
// JSDOC POUR LES FONCTIONS PUBLIQUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule le prix total d'une pièce configurée
 *
 * @param part - Configuration complète de la pièce
 * @param pricing - Paramètres de tarification actuels
 * @returns Breakdown détaillé avec prix par poste et total
 *
 * @example
 * const result = calculatePartPrice(partConfig, pricingConfig)
 * console.log(result.total) // 45.50
 */
export function calculatePartPrice(
  part: PartConfig,
  pricing: PricingConfig
): PriceBreakdown {
  // ...
}
```

---

## Imports

### Ordre des Imports

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ORDRE STRICT DES IMPORTS (appliqué par ESLint)
// ═══════════════════════════════════════════════════════════════════════════

// 1. React
import { memo, useCallback, useEffect, useState } from 'react'

// 2. Next.js
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 3. Librairies externes (alphabétique)
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// 4. Composants UI internes (@/components/ui)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// 5. Autres composants internes
import { PanelCard } from '@/components/configurateur/PanelCard'
import { PriceSummary } from '@/components/configurateur/PriceSummary'

// 6. Hooks
import { usePanelConfig } from '@/hooks/usePanelConfig'
import { usePriceCalculation } from '@/hooks/usePriceCalculation'

// 7. Stores
import { useConfigurateur } from '@/stores/configurateur.store'

// 8. Services/Utils
import { calculatePrice } from '@/services/price'
import { cn, formatCurrency } from '@/lib/utils'

// 9. Types (toujours avec `type`)
import type { Panel, PriceBreakdown } from '@/types'
```

### Alias de Paths

```typescript
// ✅ Toujours utiliser les alias
import { Button } from '@/components/ui/button'
import { calculatePrice } from '@/services/price'
import type { Panel } from '@/types'

// ❌ Éviter les chemins relatifs profonds
import { Button } from '../../../components/ui/button'
import { calculatePrice } from '../../services/price'
```

---

## Gestion des Erreurs

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PATTERN DE GESTION D'ERREURS
// ═══════════════════════════════════════════════════════════════════════════

// Custom Error classes
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Usage dans les services
async function createOrder(data: OrderData): Promise<Order> {
  try {
    const response = await api.post('/orders', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.message ?? 'Erreur serveur',
        error.response?.status ?? 500,
        error.response?.data?.code
      )
    }
    throw error
  }
}

// Usage dans les composants
function OrderForm() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: OrderData) => {
    try {
      setError(null)
      await createOrder(data)
      toast.success('Commande créée')
    } catch (error) {
      if (error instanceof ValidationError) {
        form.setError(error.field, { message: error.message })
      } else if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Une erreur inattendue est survenue')
        console.error('Unexpected error:', error)
      }
    }
  }
}
```

---

## Scripts Package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",

    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",

    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "type-check": "tsc --noEmit",

    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",

    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed",

    "check-all": "pnpm lint && pnpm type-check && pnpm test:run",
    "prepare": "prisma generate"
  }
}
```

---

## Récapitulatif

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RÈGLES ESSENTIELLES                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. TypeScript strict : no any, explicit types                             │
│  2. ESLint + Prettier : 0 erreurs, 0 warnings                              │
│  3. Imports ordonnés et avec alias @/                                      │
│  4. Composants < 150 lignes                                                │
│  5. Nommage explicite et cohérent                                          │
│  6. Commentaires = POURQUOI, pas QUOI                                      │
│  7. Gestion d'erreurs avec classes custom                                  │
│  8. Forms avec React Hook Form + Zod                                       │
│  9. Callbacks stables (useCallback/useMemo)                                │
│  10. Tests pour toute logique métier                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
