# Calcul des Prix - Panel Pro

## Vue d'Ensemble

Le système de tarification de Panel Pro est entièrement **administrable** via une interface dédiée. Chaque composant du prix est paramétrable et historisé.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STRUCTURE DU PRIX                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  PRIX PIÈCE = Matière + Découpe + Chants + Perçages + Usinages + Finition
                                      │
                                      ▼
                            × Quantité pièce
                                      │
                                      ▼
                            × Coefficient marge
                                      │
                                      ▼
                            - Remise client (%)
                                      │
                                      ▼
                              PRIX FINAL HT
```

---

## Formules de Calcul Détaillées

### 1. Prix Matière (Panneau)

```
┌─────────────────────────────────────────────────────────────────┐
│  MATIÈRE                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Surface (m²) = (Longueur × Largeur) / 1 000 000               │
│                                                                 │
│  Prix Matière = Surface × Prix_m² du panneau                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
function calculateMaterialPrice(
  length: number,      // mm
  width: number,       // mm
  pricePerM2: number   // €/m²
): number {
  const surfaceM2 = (length * width) / 1_000_000
  return round2(surfaceM2 * pricePerM2)
}

// Exemple: Panneau 800×400mm à 35€/m²
// Surface = 0.32 m²
// Prix = 0.32 × 35 = 11.20€
```

**Paramètres administrables :**
| Paramètre | Source | Modifiable |
|-----------|--------|------------|
| Prix au m² | Fiche panneau catalogue | Admin > Panneaux |

---

### 2. Prix Découpe

```
┌─────────────────────────────────────────────────────────────────┐
│  DÉCOUPE                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Option A : Forfait par pièce                                  │
│  Prix Découpe = CUTTING_PRICE_PER_PIECE                        │
│                                                                 │
│  Option B : Au périmètre (grands formats)                      │
│  Périmètre (ml) = 2 × (Longueur + Largeur) / 1000             │
│  Prix Découpe = Forfait + (Périmètre × CUTTING_PRICE_PER_METER)│
│                                                                 │
│  Option C : Par trait de coupe                                 │
│  Prix Découpe = Nombre_traits × CUTTING_PRICE_PER_CUT          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
interface CuttingPricing {
  mode: 'FORFAIT' | 'PERIMETER' | 'PER_CUT'
  pricePerPiece: number      // €
  pricePerMeter: number      // €/ml
  pricePerCut: number        // €/trait
  perimeterThreshold: number // mm (seuil pour supplément)
}

function calculateCuttingPrice(
  length: number,
  width: number,
  pricing: CuttingPricing
): number {
  const perimeterMl = (2 * (length + width)) / 1000

  switch (pricing.mode) {
    case 'FORFAIT':
      return pricing.pricePerPiece

    case 'PERIMETER':
      const basePrice = pricing.pricePerPiece
      const perimeterPrice = perimeterMl * pricing.pricePerMeter
      return round2(basePrice + perimeterPrice)

    case 'PER_CUT':
      // 2 traits minimum (longueur + largeur)
      return pricing.pricePerCut * 2

    default:
      return pricing.pricePerPiece
  }
}

// Exemple forfait: 2.50€
// Exemple périmètre 800×400: 2.50 + (2.4ml × 0.80) = 4.42€
```

**Paramètres administrables :**
| Clé | Description | Défaut | Unité |
|-----|-------------|--------|-------|
| `cutting_mode` | Mode de calcul | FORFAIT | - |
| `cutting_price_per_piece` | Forfait par pièce | 2.50 | € |
| `cutting_price_per_meter` | Supplément au ml | 0.80 | €/ml |
| `cutting_price_per_cut` | Prix par trait | 1.20 | € |
| `cutting_perimeter_threshold` | Seuil périmètre | 3000 | mm |
| `cutting_min_dimension` | Dimension minimum | 50 | mm |

---

### 3. Prix Placage Chants

```
┌─────────────────────────────────────────────────────────────────┐
│  CHANTS                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pour chaque chant actif (top, bottom, left, right) :          │
│                                                                 │
│  Longueur chant (ml) = dimension côté / 1000                   │
│                                                                 │
│  Prix chant = Longueur × (Prix_matière + Prix_pose)            │
│                                                                 │
│  TOTAL CHANTS = Σ Prix de chaque chant                         │
│                                                                 │
│  Supplément laser : + EDGING_LASER_SUPPLEMENT par ml           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
interface EdgeConfig {
  top: { edgeId: string; thickness: number } | null
  bottom: { edgeId: string; thickness: number } | null
  left: { edgeId: string; thickness: number } | null
  right: { edgeId: string; thickness: number } | null
}

interface EdgePricing {
  laborPerMeter: number        // €/ml main d'œuvre
  laserSupplement: number      // €/ml supplément laser
}

interface Edge {
  pricePerMeter: number        // €/ml matière
  material: string
}

function calculateEdgingPrice(
  length: number,              // mm (longueur pièce)
  width: number,               // mm (largeur pièce)
  edgeConfig: EdgeConfig,
  edges: Map<string, Edge>,    // Catalogue chants
  pricing: EdgePricing
): { total: number; details: EdgeDetail[] } {
  const details: EdgeDetail[] = []

  // Dimensions des côtés
  const dimensions = {
    top: length,
    bottom: length,
    left: width,
    right: width,
  }

  for (const [position, config] of Object.entries(edgeConfig)) {
    if (!config) continue

    const edge = edges.get(config.edgeId)
    if (!edge) continue

    const lengthMl = dimensions[position as keyof typeof dimensions] / 1000
    const materialPrice = lengthMl * edge.pricePerMeter
    const laborPrice = lengthMl * pricing.laborPerMeter

    // Supplément laser si applicable
    const laserPrice = edge.material === 'ABS_LASER'
      ? lengthMl * pricing.laserSupplement
      : 0

    const totalEdge = round2(materialPrice + laborPrice + laserPrice)

    details.push({
      position,
      lengthMl,
      materialPrice,
      laborPrice,
      laserPrice,
      total: totalEdge,
    })
  }

  return {
    total: round2(details.reduce((sum, d) => sum + d.total, 0)),
    details,
  }
}

// Exemple:
// - Haut (800mm) ABS 1mm à 2.20€/ml + 1.50€/ml pose = 2.96€
// - Gauche (400mm) ABS 1mm = 1.48€
// - Droit (400mm) ABS 1mm = 1.48€
// TOTAL = 5.92€
```

**Paramètres administrables :**
| Clé | Description | Défaut | Unité |
|-----|-------------|--------|-------|
| `edging_labor_per_meter` | Main d'œuvre pose | 1.50 | €/ml |
| `edging_laser_supplement` | Supplément chant laser | 0.50 | €/ml |
| `edging_thick_supplement` | Supplément ép. > 1mm | 0.30 | €/ml |
| `edging_min_length` | Longueur min facturable | 100 | mm |

**+ Prix matière chant** (dans catalogue chants) :
| Champ | Description |
|-------|-------------|
| `price_per_meter` | Prix matière au ml |

---

### 4. Prix Perçages Assemblage

```
┌─────────────────────────────────────────────────────────────────┐
│  PERÇAGES ASSEMBLAGE                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Prix = Nombre_perçages × Prix_unitaire_selon_type             │
│                                                                 │
│  Types et tarifs :                                             │
│  ├── Tourillon Ø8 face      → DRILLING_STANDARD                │
│  ├── Tourillon Ø8 chant     → DRILLING_STANDARD                │
│  ├── Avant-trou Ø3/4/5      → DRILLING_STANDARD                │
│  ├── Clamex (Ø20 + fraisage)→ DRILLING_SPECIAL                 │
│  ├── Cabineo                → DRILLING_SPECIAL                 │
│  └── Lamello (rainure)      → DRILLING_LAMELLO                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
type DrillingType =
  | 'TOURILLON_FACE'
  | 'TOURILLON_CHANT'
  | 'AVANT_TROU'
  | 'CLAMEX'
  | 'CABINEO'
  | 'LAMELLO'
  | 'VISSAGE_FACE'

interface DrillingPricing {
  standard: number    // € (tourillons, avant-trous)
  special: number     // € (Clamex, Cabineo)
  lamello: number     // € (rainure Lamello)
}

const DRILLING_CATEGORIES: Record<DrillingType, keyof DrillingPricing> = {
  TOURILLON_FACE: 'standard',
  TOURILLON_CHANT: 'standard',
  AVANT_TROU: 'standard',
  VISSAGE_FACE: 'standard',
  CLAMEX: 'special',
  CABINEO: 'special',
  LAMELLO: 'lamello',
}

function calculateAssemblyDrillingPrice(
  drillings: Array<{ type: DrillingType }>,
  pricing: DrillingPricing
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {
    standard: 0,
    special: 0,
    lamello: 0,
  }

  for (const drilling of drillings) {
    const category = DRILLING_CATEGORIES[drilling.type]
    breakdown[category]++
  }

  const total = round2(
    breakdown.standard * pricing.standard +
    breakdown.special * pricing.special +
    breakdown.lamello * pricing.lamello
  )

  return { total, breakdown }
}

// Exemple: 6 tourillons + 2 Clamex
// = (6 × 0.40) + (2 × 0.80) = 2.40 + 1.60 = 4.00€
```

**Paramètres administrables :**
| Clé | Description | Défaut | Unité |
|-----|-------------|--------|-------|
| `drilling_price_standard` | Perçage standard | 0.40 | € |
| `drilling_price_special` | Perçage spécial (Clamex...) | 0.80 | € |
| `drilling_price_lamello` | Rainure Lamello | 1.20 | € |
| `drilling_price_cabineo` | Système Cabineo complet | 1.50 | € |

---

### 5. Prix Perçages Quincaillerie

```
┌─────────────────────────────────────────────────────────────────┐
│  PERÇAGES QUINCAILLERIE                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Prix = Σ (Prix_perçage de chaque quincaillerie)               │
│                                                                 │
│  Le prix est défini dans la fiche de chaque quincaillerie      │
│  (champ drilling_price dans table hardware)                    │
│                                                                 │
│  Exemples :                                                    │
│  ├── Charnière Clip Top BLUM     → 2.50€                       │
│  ├── Coulisse TANDEM 550mm       → 4.00€                       │
│  ├── AVENTOS HK-S                → 6.00€                       │
│  └── Pied réglable               → 0.80€                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
interface HardwareDrilling {
  hardwareId: string
  quantity: number
}

interface Hardware {
  id: string
  drillingPrice: number  // Prix défini par quincaillerie
}

function calculateHardwareDrillingPrice(
  hardwareDrillings: HardwareDrilling[],
  hardwareCatalog: Map<string, Hardware>
): number {
  let total = 0

  for (const item of hardwareDrillings) {
    const hardware = hardwareCatalog.get(item.hardwareId)
    if (hardware) {
      total += hardware.drillingPrice * item.quantity
    }
  }

  return round2(total)
}

// Exemple: 2 charnières Clip Top (2×2.50) + 1 coulisse (4.00)
// = 5.00 + 4.00 = 9.00€
```

**Paramètres administrables :**
| Source | Champ | Description |
|--------|-------|-------------|
| Fiche Quincaillerie | `drilling_price` | Prix perçage unitaire |

---

### 6. Prix Usinages Spéciaux

```
┌─────────────────────────────────────────────────────────────────┐
│  USINAGES                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Usinages linéaires (au ml) :                                  │
│  ├── Rainure      → longueur × MACHINING_GROOVE_PER_METER      │
│  ├── Feuillure    → longueur × MACHINING_RABBET_PER_METER      │
│  ├── Profil       → longueur × MACHINING_PROFILE_PER_METER     │
│  └── Embrèvement  → longueur × MACHINING_HOUSING_PER_METER     │
│                                                                 │
│  Usinages ponctuels (forfait) :                                │
│  ├── Encoche      → MACHINING_NOTCH_PRICE                      │
│  ├── Arrondi      → MACHINING_RADIUS_PRICE                     │
│  └── Perçage spécial → MACHINING_SPECIAL_HOLE_PRICE            │
│                                                                 │
│  Supplément profondeur > 10mm : +20%                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
type MachiningType =
  | 'RAINURE'
  | 'FEUILLURE'
  | 'EMBREMENT'
  | 'PROFIL'
  | 'ENCOCHE'
  | 'ARRONDI'
  | 'PERCAGE_SPECIAL'

interface MachiningOperation {
  type: MachiningType
  length?: number      // mm (pour linéaires)
  depth?: number       // mm
  quantity?: number    // pour ponctuels
}

interface MachiningPricing {
  groovePerMeter: number     // €/ml rainure
  rabbetPerMeter: number     // €/ml feuillure
  housingPerMeter: number    // €/ml embrèvement
  profilePerMeter: number    // €/ml profil
  notchPrice: number         // € forfait encoche
  radiusPrice: number        // € forfait arrondi
  specialHolePrice: number   // € forfait perçage spécial
  deepSupplement: number     // % supplément prof > 10mm
  deepThreshold: number      // mm seuil profondeur
}

function calculateMachiningPrice(
  operations: MachiningOperation[],
  pricing: MachiningPricing
): number {
  let total = 0

  for (const op of operations) {
    let price = 0

    switch (op.type) {
      case 'RAINURE':
        price = (op.length! / 1000) * pricing.groovePerMeter
        break
      case 'FEUILLURE':
        price = (op.length! / 1000) * pricing.rabbetPerMeter
        break
      case 'EMBREMENT':
        price = (op.length! / 1000) * pricing.housingPerMeter
        break
      case 'PROFIL':
        price = (op.length! / 1000) * pricing.profilePerMeter
        break
      case 'ENCOCHE':
        price = pricing.notchPrice * (op.quantity || 1)
        break
      case 'ARRONDI':
        price = pricing.radiusPrice * (op.quantity || 1)
        break
      case 'PERCAGE_SPECIAL':
        price = pricing.specialHolePrice * (op.quantity || 1)
        break
    }

    // Supplément profondeur
    if (op.depth && op.depth > pricing.deepThreshold) {
      price *= (1 + pricing.deepSupplement / 100)
    }

    total += price
  }

  return round2(total)
}

// Exemple: Rainure 800mm prof 8mm + 2 encoches
// = (0.8 × 3.00) + (2 × 2.00) = 2.40 + 4.00 = 6.40€
```

**Paramètres administrables :**
| Clé | Description | Défaut | Unité |
|-----|-------------|--------|-------|
| `machining_groove_per_meter` | Rainure au ml | 3.00 | €/ml |
| `machining_rabbet_per_meter` | Feuillure au ml | 4.00 | €/ml |
| `machining_housing_per_meter` | Embrèvement au ml | 4.50 | €/ml |
| `machining_profile_per_meter` | Profil au ml | 5.00 | €/ml |
| `machining_notch_price` | Encoche (forfait) | 2.00 | € |
| `machining_radius_price` | Arrondi (forfait) | 1.50 | € |
| `machining_special_hole_price` | Perçage spécial | 1.00 | € |
| `machining_deep_supplement` | Supplément prof > seuil | 20 | % |
| `machining_deep_threshold` | Seuil profondeur | 10 | mm |

---

### 7. Prix Finition

```
┌─────────────────────────────────────────────────────────────────┐
│  FINITION                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Applicable uniquement si panneau = MDF ou PLAQUE_BOIS         │
│                                                                 │
│  Surface à traiter :                                           │
│  ├── UNE_FACE    → Longueur × Largeur                          │
│  ├── DEUX_FACES  → 2 × (Longueur × Largeur)                    │
│  └── AVEC_CHANTS → 2 × faces + périmètre × épaisseur          │
│                                                                 │
│  Prix = Surface_m² × Prix_selon_type                           │
│                                                                 │
│  Types :                                                       │
│  ├── Laquage     → FINISHING_LACQUER_PER_M2                    │
│  ├── Vernissage  → FINISHING_VARNISH_PER_M2                    │
│  └── Teinte      → FINISHING_STAIN_PER_M2                      │
│                                                                 │
│  Supplément brillant : +15%                                    │
│  Supplément couleur spéciale (hors RAL standard) : +10%        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript :**
```typescript
type FinishType = 'LAQUAGE' | 'VERNISSAGE' | 'TEINTE_VERNIS'
type FinishSheen = 'MAT' | 'SATINE' | 'BRILLANT'
type FinishFaces = 'ONE' | 'TWO' | 'TWO_WITH_EDGES'

interface Finish {
  type: FinishType
  sheen: FinishSheen
  faces: FinishFaces
  isSpecialColor: boolean
}

interface FinishingPricing {
  lacquerPerM2: number      // €/m²
  varnishPerM2: number      // €/m²
  stainPerM2: number        // €/m²
  brillantSupplement: number // %
  specialColorSupplement: number // %
}

function calculateFinishingPrice(
  length: number,           // mm
  width: number,            // mm
  thickness: number,        // mm (pour chants)
  finish: Finish | null,
  pricing: FinishingPricing
): number {
  if (!finish) return 0

  // Calcul surface
  const faceArea = (length * width) / 1_000_000  // m²
  const perimeterM = (2 * (length + width)) / 1000
  const edgeArea = perimeterM * (thickness / 1000)  // m²

  let surfaceM2: number
  switch (finish.faces) {
    case 'ONE':
      surfaceM2 = faceArea
      break
    case 'TWO':
      surfaceM2 = faceArea * 2
      break
    case 'TWO_WITH_EDGES':
      surfaceM2 = (faceArea * 2) + edgeArea
      break
  }

  // Prix de base selon type
  let pricePerM2: number
  switch (finish.type) {
    case 'LAQUAGE':
      pricePerM2 = pricing.lacquerPerM2
      break
    case 'VERNISSAGE':
      pricePerM2 = pricing.varnishPerM2
      break
    case 'TEINTE_VERNIS':
      pricePerM2 = pricing.stainPerM2 + pricing.varnishPerM2
      break
  }

  let total = surfaceM2 * pricePerM2

  // Suppléments
  if (finish.sheen === 'BRILLANT') {
    total *= (1 + pricing.brillantSupplement / 100)
  }
  if (finish.isSpecialColor) {
    total *= (1 + pricing.specialColorSupplement / 100)
  }

  return round2(total)
}

// Exemple: Laquage 2 faces 800×400mm (0.64m²) RAL standard satiné
// = 0.64 × 45.00 = 28.80€
```

**Paramètres administrables :**
| Clé | Description | Défaut | Unité |
|-----|-------------|--------|-------|
| `finishing_lacquer_per_m2` | Laquage au m² | 45.00 | €/m² |
| `finishing_varnish_per_m2` | Vernissage au m² | 25.00 | €/m² |
| `finishing_stain_per_m2` | Teinte au m² | 15.00 | €/m² |
| `finishing_brillant_supplement` | Supplément brillant | 15 | % |
| `finishing_special_color_supplement` | Supplément couleur spéciale | 10 | % |
| `finishing_min_surface` | Surface min facturable | 0.1 | m² |

---

### 8. Calcul Final

```
┌─────────────────────────────────────────────────────────────────┐
│  CALCUL PRIX FINAL                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Sous-total pièce :                                         │
│     ST = Matière + Découpe + Chants + Perçages + Usinage + Fin │
│                                                                 │
│  2. Application marge :                                        │
│     Prix_marge = ST × MARGIN_COEFFICIENT                       │
│                                                                 │
│  3. Prix unitaire :                                            │
│     PU = Prix_marge                                            │
│                                                                 │
│  4. Prix total pièce :                                         │
│     PT = PU × Quantité                                         │
│                                                                 │
│  5. Remise client :                                            │
│     Remise = PT × (Taux_remise_client / 100)                   │
│                                                                 │
│  6. Prix final HT :                                            │
│     PF = PT - Remise                                           │
│                                                                 │
│  7. Prix TTC :                                                 │
│     TTC = PF × (1 + TVA / 100)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Formule TypeScript complète :**
```typescript
interface PriceBreakdown {
  material: number
  cutting: number
  edging: number
  assemblyDrilling: number
  hardwareDrilling: number
  machining: number
  finishing: number
  subtotal: number
  marginCoefficient: number
  priceWithMargin: number
  unitPrice: number
  quantity: number
  totalBeforeDiscount: number
  discountRate: number
  discountAmount: number
  totalHT: number
  taxRate: number
  taxAmount: number
  totalTTC: number
}

function calculateFullPrice(
  partConfig: PartConfig,
  pricingParams: PricingParams,
  customerDiscountRate: number = 0
): PriceBreakdown {
  // Calculs individuels
  const material = calculateMaterialPrice(...)
  const cutting = calculateCuttingPrice(...)
  const edging = calculateEdgingPrice(...)
  const assemblyDrilling = calculateAssemblyDrillingPrice(...)
  const hardwareDrilling = calculateHardwareDrillingPrice(...)
  const machining = calculateMachiningPrice(...)
  const finishing = calculateFinishingPrice(...)

  // Sous-total
  const subtotal = material + cutting + edging + assemblyDrilling +
                   hardwareDrilling + machining + finishing

  // Application marge
  const marginCoefficient = pricingParams.marginCoefficient
  const priceWithMargin = round2(subtotal * marginCoefficient)

  // Prix unitaire
  const unitPrice = priceWithMargin

  // Total avant remise
  const quantity = partConfig.quantity
  const totalBeforeDiscount = round2(unitPrice * quantity)

  // Remise client
  const discountRate = customerDiscountRate
  const discountAmount = round2(totalBeforeDiscount * (discountRate / 100))
  const totalHT = round2(totalBeforeDiscount - discountAmount)

  // TVA
  const taxRate = pricingParams.taxRate // 20%
  const taxAmount = round2(totalHT * (taxRate / 100))
  const totalTTC = round2(totalHT + taxAmount)

  return {
    material,
    cutting,
    edging,
    assemblyDrilling,
    hardwareDrilling,
    machining,
    finishing,
    subtotal,
    marginCoefficient,
    priceWithMargin,
    unitPrice,
    quantity,
    totalBeforeDiscount,
    discountRate,
    discountAmount,
    totalHT,
    taxRate,
    taxAmount,
    totalTTC,
  }
}
```

**Paramètres administrables :**
| Clé | Description | Défaut | Unité |
|-----|-------------|--------|-------|
| `margin_coefficient` | Coefficient de marge | 1.35 | × |
| `tax_rate` | Taux TVA | 20.00 | % |
| `min_order_amount` | Montant minimum commande | 50.00 | € |
| `small_order_fee` | Frais petite commande | 15.00 | € |
| `small_order_threshold` | Seuil petite commande | 100.00 | € |

---

## Interface Administration Tarifs

### Structure Menu Admin

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN > TARIFICATION                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │ Navigation  │                                               │
│  ├─────────────┤                                               │
│  │ □ Général   │  ← Marge, TVA, minimums                       │
│  │ □ Découpe   │  ← Paramètres découpe                         │
│  │ □ Chants    │  ← Main d'œuvre, suppléments                  │
│  │ □ Perçages  │  ← Tarifs par type                            │
│  │ □ Usinages  │  ← Tarifs par opération                       │
│  │ □ Finitions │  ← Laquage, vernissage, teinte               │
│  │ □ Remises   │  ← Grilles remises clients                    │
│  │ □ Historique│  ← Journal modifications                      │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page Admin : Paramètres Généraux

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > PARAMÈTRES GÉNÉRAUX                          [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MARGE & TAXES                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Coefficient de marge          [  1.35  ] ×                        │   │
│  │  ├─ Appliqué sur le sous-total de chaque pièce                     │   │
│  │  └─ Exemple: coût 100€ → prix vente 135€                           │   │
│  │                                                                     │   │
│  │  Taux de TVA                   [  20.00 ] %                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMMANDE MINIMUM                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Montant minimum commande      [  50.00 ] €                        │   │
│  │  ├─ En dessous, commande refusée                                   │   │
│  │                                                                     │   │
│  │  Seuil petite commande         [ 100.00 ] €                        │   │
│  │  Frais petite commande         [  15.00 ] €                        │   │
│  │  ├─ Si total < seuil, frais ajoutés                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ARRONDIS                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Arrondi prix                  [ 2 décimales ▼]                    │   │
│  │  Mode arrondi                  [ Au centième supérieur ▼]          │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                          Dernière modification: 18/12/2024 │
│                                          Par: admin@panelpro.fr            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Tarifs Découpe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > DÉCOUPE                                      [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MODE DE CALCUL                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ○ Forfait par pièce                                               │   │
│  │  ● Forfait + supplément périmètre                                  │   │
│  │  ○ Par trait de coupe                                              │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  TARIFS                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Forfait par pièce             [   2.50 ] €                        │   │
│  │                                                                     │   │
│  │  Supplément au mètre linéaire  [   0.80 ] €/ml                     │   │
│  │  ├─ Appliqué si mode "Forfait + périmètre"                         │   │
│  │                                                                     │   │
│  │  Prix par trait de coupe       [   1.20 ] €                        │   │
│  │  ├─ Appliqué si mode "Par trait"                                   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  CONTRAINTES                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Dimension minimum             [     50 ] mm                       │   │
│  │  Dimension maximum             [   2800 ] mm                       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SIMULATEUR                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Longueur: [ 800 ] mm   Largeur: [ 400 ] mm                        │   │
│  │                                                                     │   │
│  │  Périmètre: 2.40 ml                                                │   │
│  │  Prix découpe: 2.50 + (2.40 × 0.80) = 4.42 €                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Tarifs Chants

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > CHANTS                                       [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MAIN D'ŒUVRE                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Pose standard (au ml)         [   1.50 ] €/ml                     │   │
│  │  ├─ ABS, PVC, mélamine jusqu'à 1mm                                 │   │
│  │                                                                     │   │
│  │  Supplément épaisseur > 1mm    [   0.30 ] €/ml                     │   │
│  │  ├─ Chants 2mm et 3mm                                              │   │
│  │                                                                     │   │
│  │  Supplément chant laser        [   0.50 ] €/ml                     │   │
│  │  ├─ Technologie joint invisible                                    │   │
│  │                                                                     │   │
│  │  Supplément bois massif        [   2.00 ] €/ml                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ℹ️ Le prix matière est défini dans chaque fiche chant (catalogue)        │
│  └─ Admin > Chants > [Fiche chant] > Prix au mètre                        │
│                                                                             │
│  CONTRAINTES                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Longueur minimum facturable   [    100 ] mm                       │   │
│  │  ├─ En dessous, arrondi à 100mm                                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Tarifs Perçages

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > PERÇAGES                                     [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PERÇAGES D'ASSEMBLAGE                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Type                               Prix unitaire                  │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  Tourillon face (Ø8)               [  0.40 ] €                     │   │
│  │  Tourillon chant (Ø8)              [  0.40 ] €                     │   │
│  │  Avant-trou (Ø3/4/5)               [  0.40 ] €                     │   │
│  │  Vissage traversant                [  0.40 ] €                     │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  Clamex P (Ø20 + fraisage)         [  0.80 ] €                     │   │
│  │  Cabineo                           [  1.50 ] €                     │   │
│  │  Rainure Lamello                   [  1.20 ] €                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PERÇAGES QUINCAILLERIE                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ℹ️ Les prix sont définis dans chaque fiche quincaillerie          │   │
│  │  └─ Admin > Quincaillerie > [Fiche] > Prix perçage                 │   │
│  │                                                                     │   │
│  │  Aperçu des tarifs actuels :                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ Réf.              │ Désignation           │ Prix perçage    │  │   │
│  │  ├───────────────────┼───────────────────────┼─────────────────┤  │   │
│  │  │ BLUM-71B3550      │ Clip Top 110°         │ 2.50 €          │  │   │
│  │  │ BLUM-560H3000B    │ TANDEM 300mm          │ 4.00 €          │  │   │
│  │  │ BLUM-20K2301      │ AVENTOS HK-S          │ 6.00 €          │  │   │
│  │  │ HETT-9073665      │ Sensys 110°           │ 2.50 €          │  │   │
│  │  │ ...               │ ...                   │ ...             │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                        [Gérer la quincaillerie →]  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Tarifs Usinages

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > USINAGES                                     [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USINAGES LINÉAIRES (au mètre)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Opération                          Prix au ml                     │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  Rainure (pour fond, dos...)       [  3.00 ] €/ml                  │   │
│  │  Feuillure                         [  4.00 ] €/ml                  │   │
│  │  Embrèvement                       [  4.50 ] €/ml                  │   │
│  │  Profil de poignée                 [  5.00 ] €/ml                  │   │
│  │  Gorge décorative                  [  3.50 ] €/ml                  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USINAGES PONCTUELS (forfait)                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Opération                          Forfait                        │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  Encoche rectangulaire             [  2.00 ] €                     │   │
│  │  Arrondi d'angle                   [  1.50 ] €                     │   │
│  │  Perçage spécial (câbles...)       [  1.00 ] €                     │   │
│  │  Découpe forme libre               [  5.00 ] €                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SUPPLÉMENTS                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Seuil profondeur supplément       [     10 ] mm                   │   │
│  │  Supplément profondeur > seuil     [     20 ] %                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Tarifs Finitions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > FINITIONS                                    [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TARIFS DE BASE (au m²)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Type                               Prix au m²                     │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  Laquage                           [ 45.00 ] €/m²                  │   │
│  │  Vernissage                        [ 25.00 ] €/m²                  │   │
│  │  Teinte bois                       [ 15.00 ] €/m²                  │   │
│  │                                                                     │   │
│  │  ℹ️ Teinte + Vernis = Teinte + Vernissage                          │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SUPPLÉMENTS                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Finition brillante                [     15 ] %                    │   │
│  │  ├─ vs mat/satiné                                                  │   │
│  │                                                                     │   │
│  │  Couleur spéciale (hors RAL std)   [     10 ] %                    │   │
│  │  ├─ NCS, Pantone, mélange sur mesure                               │   │
│  │                                                                     │   │
│  │  Effet métallisé                   [     25 ] %                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  CONTRAINTES                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Surface minimum facturable        [   0.10 ] m²                   │   │
│  │  ├─ En dessous, facturé 0.10 m²                                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PANNEAUX ÉLIGIBLES                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ☑ MDF                                                             │   │
│  │  ☑ MDF Laqué (retouches)                                           │   │
│  │  ☑ Plaqué bois                                                     │   │
│  │  ☐ Mélaminé (non applicable)                                       │   │
│  │  ☐ Stratifié (non applicable)                                      │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Remises Clients

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > REMISES CLIENTS                              [Enregistrer] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GRILLE DE REMISES PAR CATÉGORIE                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Catégorie client               Remise par défaut                  │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  Standard                       [   0.00 ] %                       │   │
│  │  Professionnel                  [   5.00 ] %                       │   │
│  │  Revendeur                      [  10.00 ] %                       │   │
│  │  Grand compte                   [  15.00 ] %                       │   │
│  │                                                                     │   │
│  │  ℹ️ Remise personnalisée possible par client                       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  REMISES VOLUME (cumulables)                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ☑ Activer les remises volume                                      │   │
│  │                                                                     │   │
│  │  Palier                         Remise supplémentaire              │   │
│  │  ─────────────────────────────────────────────────                 │   │
│  │  > 500€ HT                      [   2.00 ] %                       │   │
│  │  > 1000€ HT                     [   3.00 ] %                       │   │
│  │  > 2500€ HT                     [   5.00 ] %                       │   │
│  │  > 5000€ HT                     [   7.00 ] %                       │   │
│  │                                                        [+ Palier]  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  CLIENTS AVEC REMISE PERSONNALISÉE                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  │ Client              │ Société              │ Remise  │ Action │  │   │
│  │  ├─────────────────────┼──────────────────────┼─────────┼────────┤  │   │
│  │  │ Dupont Martin       │ Menuiserie Dupont    │ 8%      │ [Édit] │  │   │
│  │  │ Lefebvre Jean       │ Agencement Lefebvre  │ 12%     │ [Édit] │  │   │
│  │  │ Garcia Antoine      │ Cuisines Garcia      │ 15%     │ [Édit] │  │   │
│  │  │ ...                 │ ...                  │ ...     │ ...    │  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Admin : Historique Modifications

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARIFICATION > HISTORIQUE                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filtres: [Tous les paramètres ▼] [Ce mois ▼] [Tous les admins ▼] [Rech.] │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  │ Date       │ Paramètre              │ Ancien │ Nouveau │ Par   │  │   │
│  │  ├────────────┼────────────────────────┼────────┼─────────┼───────┤  │   │
│  │  │ 18/12 14:32│ margin_coefficient     │ 1.30   │ 1.35    │ Admin │  │   │
│  │  │ 17/12 09:15│ finishing_lacquer_m2   │ 42.00  │ 45.00   │ Admin │  │   │
│  │  │ 15/12 16:48│ drilling_price_standard│ 0.35   │ 0.40    │ Admin │  │   │
│  │  │ 10/12 11:22│ cutting_price_per_piece│ 2.00   │ 2.50    │ Admin │  │   │
│  │  │ ...        │ ...                    │ ...    │ ...     │ ...   │  │   │
│  │                                                                     │   │
│  │                                              [1] [2] [3] ... [12]  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Exporter CSV]                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Modèle de Données Admin Tarifs

### Table pricing_configs (rappel)

```prisma
model PricingConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Decimal  @db.Decimal(12, 4)
  unit        String?
  description String?
  category    String   // GENERAL, CUTTING, EDGING, DRILLING, MACHINING, FINISHING

  updatedBy   User?    @relation(fields: [updatedById], references: [id])
  updatedById String?  @map("updated_by")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@map("pricing_configs")
}
```

### Table pricing_history (historique)

```prisma
model PricingHistory {
  id          String   @id @default(cuid())
  configKey   String   @map("config_key")
  oldValue    Decimal  @map("old_value") @db.Decimal(12, 4)
  newValue    Decimal  @map("new_value") @db.Decimal(12, 4)

  changedBy   User     @relation(fields: [changedById], references: [id])
  changedById String   @map("changed_by")
  changedAt   DateTime @default(now()) @map("changed_at")
  reason      String?  // Motif optionnel

  @@index([configKey])
  @@index([changedAt])
  @@map("pricing_history")
}
```

### Table customer_discounts (remises personnalisées)

```prisma
model CustomerDiscount {
  id          String   @id @default(cuid())
  customerId  String   @unique @map("customer_id")
  customer    User     @relation(fields: [customerId], references: [id])

  discountRate Decimal @map("discount_rate") @db.Decimal(5, 2)
  validFrom   DateTime @default(now()) @map("valid_from")
  validUntil  DateTime? @map("valid_until")
  notes       String?

  createdBy   User     @relation("CreatedBy", fields: [createdById], references: [id])
  createdById String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("customer_discounts")
}
```

### Table volume_discounts (remises volume)

```prisma
model VolumeDiscount {
  id          String   @id @default(cuid())
  threshold   Decimal  @db.Decimal(12, 2)  // Montant seuil
  discountRate Decimal @map("discount_rate") @db.Decimal(5, 2)
  isActive    Boolean  @default(true) @map("is_active")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("volume_discounts")
}
```

---

## API tRPC Admin Tarifs

```typescript
// server/routers/pricing.ts

export const pricingRouter = router({

  // Récupérer tous les paramètres par catégorie
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      const configs = await ctx.prisma.pricingConfig.findMany({
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      })

      // Grouper par catégorie
      return groupBy(configs, 'category')
    }),

  // Récupérer un paramètre
  getByKey: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.pricingConfig.findUnique({
        where: { key: input.key },
      })
    }),

  // Mettre à jour un paramètre
  update: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.prisma.pricingConfig.findUnique({
        where: { key: input.key },
      })

      if (!current) throw new TRPCError({ code: 'NOT_FOUND' })

      // Enregistrer dans l'historique
      await ctx.prisma.pricingHistory.create({
        data: {
          configKey: input.key,
          oldValue: current.value,
          newValue: input.value,
          changedById: ctx.session.user.id,
          reason: input.reason,
        },
      })

      // Mettre à jour
      return ctx.prisma.pricingConfig.update({
        where: { key: input.key },
        data: {
          value: input.value,
          updatedById: ctx.session.user.id,
        },
      })
    }),

  // Mise à jour en masse
  updateMany: adminProcedure
    .input(z.array(z.object({
      key: z.string(),
      value: z.number(),
    })))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(
        input.map(item =>
          ctx.prisma.pricingConfig.update({
            where: { key: item.key },
            data: {
              value: item.value,
              updatedById: ctx.session.user.id,
            },
          })
        )
      )
    }),

  // Historique des modifications
  getHistory: adminProcedure
    .input(z.object({
      key: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.pricingHistory.findMany({
        where: input.key ? { configKey: input.key } : undefined,
        include: { changedBy: { select: { name: true, email: true } } },
        orderBy: { changedAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      })
    }),

  // Simulateur de prix
  simulate: publicProcedure
    .input(partConfigSchema)
    .query(async ({ ctx, input }) => {
      const pricing = await loadPricingConfig(ctx.prisma)
      return calculateFullPrice(input, pricing, 0)
    }),

})
```

---

## Exemple de Calcul Complet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EXEMPLE : Pièce MEUBLE-01-COTE-G (×2)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Configuration :                                                           │
│  ├── Panneau : Chêne naturel 19mm (35.50 €/m²)                             │
│  ├── Dimensions : 800 × 400 mm                                             │
│  ├── Chants : Haut (ABS 1mm), Gauche (ABS 2mm), Droit (ABS 1mm)           │
│  ├── Perçages : 6 tourillons face, 2 Clamex                                │
│  ├── Usinages : Rainure 800mm pour fond                                    │
│  └── Finition : Aucune                                                     │
│                                                                             │
│  CALCUL DÉTAILLÉ :                                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  1. MATIÈRE                                                                │
│     Surface = 0.80 × 0.40 = 0.32 m²                                        │
│     Prix = 0.32 × 35.50 = 11.36 €                                          │
│                                                                             │
│  2. DÉCOUPE                                                                │
│     Forfait = 2.50 €                                                       │
│     Périmètre = 2.40 ml → Supplément = 2.40 × 0.80 = 1.92 €               │
│     Prix = 2.50 + 1.92 = 4.42 €                                            │
│                                                                             │
│  3. CHANTS                                                                 │
│     Haut (800mm, ABS 1mm) : 0.80 × (2.20 + 1.50) = 2.96 €                 │
│     Gauche (400mm, ABS 2mm) : 0.40 × (2.50 + 1.50 + 0.30) = 1.72 €        │
│     Droit (400mm, ABS 1mm) : 0.40 × (2.20 + 1.50) = 1.48 €                │
│     Total chants = 6.16 €                                                  │
│                                                                             │
│  4. PERÇAGES                                                               │
│     6 tourillons × 0.40 = 2.40 €                                           │
│     2 Clamex × 0.80 = 1.60 €                                               │
│     Total perçages = 4.00 €                                                │
│                                                                             │
│  5. USINAGES                                                               │
│     Rainure 800mm = 0.80 × 3.00 = 2.40 €                                   │
│                                                                             │
│  6. FINITION                                                               │
│     Aucune = 0.00 €                                                        │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  SOUS-TOTAL = 11.36 + 4.42 + 6.16 + 4.00 + 2.40 + 0.00 = 28.34 €          │
│                                                                             │
│  MARGE (×1.35) = 28.34 × 1.35 = 38.26 €                                    │
│                                                                             │
│  PRIX UNITAIRE = 38.26 €                                                   │
│                                                                             │
│  QUANTITÉ = 2                                                              │
│  TOTAL AVANT REMISE = 38.26 × 2 = 76.52 €                                  │
│                                                                             │
│  REMISE CLIENT (5%) = -3.83 €                                              │
│                                                                             │
│  TOTAL HT = 72.69 €                                                        │
│                                                                             │
│  TVA (20%) = 14.54 €                                                       │
│                                                                             │
│  TOTAL TTC = 87.23 €                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fonctions Utilitaires

```typescript
// lib/pricing.ts

/**
 * Arrondi à 2 décimales (centième supérieur)
 */
export function round2(value: number): number {
  return Math.ceil(value * 100) / 100
}

/**
 * Charger tous les paramètres de pricing depuis la BDD
 */
export async function loadPricingConfig(
  prisma: PrismaClient
): Promise<PricingParams> {
  const configs = await prisma.pricingConfig.findMany()

  const params: Record<string, number> = {}
  for (const config of configs) {
    params[config.key] = Number(config.value)
  }

  return params as PricingParams
}

/**
 * Valider que tous les paramètres requis existent
 */
export function validatePricingConfig(
  params: Record<string, number>
): boolean {
  const requiredKeys = [
    'margin_coefficient',
    'tax_rate',
    'cutting_price_per_piece',
    'edging_labor_per_meter',
    'drilling_price_standard',
    // ... etc
  ]

  return requiredKeys.every(key => key in params && !isNaN(params[key]))
}
```
