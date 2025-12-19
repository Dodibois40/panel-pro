# Étapes de Développement - Configurateur Débit Panneaux

## Vue d'Ensemble

Ce document détaille les étapes de développement du configurateur de débit de panneaux, organisées en 5 phases principales.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROADMAP DÉVELOPPEMENT                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  PHASE 1        PHASE 2        PHASE 3        PHASE 4        PHASE 5  │
│  ────────       ────────       ────────       ────────       ──────── │
│  Setup &        Admin &        Configurateur  Commandes &    Tests &  │
│  Infra          Catalogue      Wizard         Export         Deploy   │
│                                                                        │
│  ██████████     ██████████     ██████████     ██████████     ████████ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 : Setup & Infrastructure

### 1.1 Initialisation du Projet

```bash
# Création projet Next.js
npx create-next-app@latest panel-configurator --typescript --tailwind --eslint --app --src-dir

# Installation des dépendances principales
pnpm add @prisma/client @trpc/server @trpc/client @trpc/react-query @trpc/next
pnpm add @tanstack/react-query zustand zod react-hook-form @hookform/resolvers
pnpm add next-auth @auth/prisma-adapter
pnpm add -D prisma

# Installation UI
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge
pnpm add lucide-react
npx shadcn-ui@latest init
```

**Livrables** :
- [ ] Projet Next.js 14+ fonctionnel
- [ ] Configuration TypeScript stricte
- [ ] ESLint + Prettier configurés
- [ ] Structure de dossiers créée

---

### 1.2 Configuration Base de Données

```prisma
// prisma/schema.prisma - Schéma initial
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Tâches** :
- [ ] Docker Compose pour PostgreSQL local
- [ ] Schéma Prisma complet (voir Architecture.md)
- [ ] Migration initiale
- [ ] Script de seed avec données de test

**Commandes** :
```bash
# Initialisation Prisma
npx prisma init

# Après création du schéma
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

---

### 1.3 Configuration tRPC

**Fichiers à créer** :

```
server/
├── trpc.ts              # Configuration tRPC
├── routers/
│   ├── _app.ts          # Router principal
│   ├── panel.ts         # Router panneaux
│   ├── edge.ts          # Router chants
│   ├── hardware.ts      # Router quincaillerie
│   ├── order.ts         # Router commandes
│   └── user.ts          # Router utilisateurs
```

**Livrables** :
- [ ] Context tRPC avec session
- [ ] Middleware d'authentification
- [ ] Routers de base (CRUD)
- [ ] Client tRPC configuré

---

### 1.4 Authentification NextAuth

**Configuration** :

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      // Configuration credentials
    })
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
  },
})
```

**Livrables** :
- [ ] Provider Credentials fonctionnel
- [ ] Pages login/register
- [ ] Middleware protection routes
- [ ] Session avec rôle utilisateur

---

### 1.5 CI/CD & Déploiement

**GitHub Actions** :

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm build
```

**Livrables** :
- [ ] Repository GitHub créé
- [ ] GitHub Actions CI configuré
- [ ] Vercel projet connecté
- [ ] Variables d'environnement configurées
- [ ] Déploiement staging automatique

---

## Phase 2 : Administration & Catalogue

### 2.1 Layout Admin

**Composants** :

```
components/admin/
├── AdminLayout.tsx      # Layout avec sidebar
├── AdminSidebar.tsx     # Navigation latérale
├── AdminHeader.tsx      # Header avec user menu
├── DataTable.tsx        # Table réutilisable
└── StatsCard.tsx        # Card statistiques
```

**Pages** :

```
app/admin/
├── layout.tsx           # Layout admin
├── page.tsx             # Dashboard
├── panneaux/
│   ├── page.tsx         # Liste panneaux
│   ├── [id]/page.tsx    # Détail/édition
│   └── nouveau/page.tsx # Création
├── chants/
├── quincaillerie/
├── tarifs/
├── commandes/
└── utilisateurs/
```

**Livrables** :
- [ ] Layout admin responsive
- [ ] Dashboard avec KPIs
- [ ] Navigation fonctionnelle

---

### 2.2 CRUD Panneaux Fournisseur

**Fonctionnalités** :

| Fonction | Description |
|----------|-------------|
| Liste | Table paginée, filtres, recherche |
| Création | Formulaire complet avec validation |
| Édition | Modification avec historique |
| Suppression | Soft delete avec confirmation |
| Import | CSV/Excel bulk import |
| Export | Export catalogue PDF |

**Formulaire panneau** :

```typescript
const panelSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  supplier: z.string().min(1),
  material: z.enum(['MELAMINE', 'MDF', 'STRATIFIE', 'PLAQUE_BOIS']),
  thickness: z.number().min(1).max(100),
  length: z.number().min(100).max(5000),
  width: z.number().min(100).max(3000),
  pricePerM2: z.number().min(0),
  grainDirection: z.boolean(),
  imageUrl: z.string().url().optional(),
  colorCode: z.string().optional(),
})
```

**Livrables** :
- [ ] Liste panneaux avec DataTable
- [ ] Formulaire création/édition
- [ ] Upload image panneau
- [ ] Import CSV
- [ ] Validation Zod

---

### 2.3 CRUD Chants

**Fonctionnalités similaires aux panneaux** :

```typescript
const edgeSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  material: z.enum(['ABS', 'MELAMINE', 'BOIS_MASSIF', 'ALUMINIUM', 'PVC']),
  thickness: z.number().refine(v => [0.4, 1, 2, 3].includes(v)),
  width: z.number().min(10).max(100),
  pricePerMeter: z.number().min(0),
  colorCode: z.string().optional(),
  compatiblePanelIds: z.array(z.string()),
})
```

**Livrables** :
- [ ] CRUD chants complet
- [ ] Association panneaux compatibles
- [ ] Gestion couleurs/décors

---

### 2.4 CRUD Quincaillerie

**Structure données** :

```typescript
const hardwareSchema = z.object({
  reference: z.string(),
  name: z.string(),
  brand: z.enum(['BLUM', 'HETTICH', 'GRASS', 'HAFELE', 'AUTRE']),
  category: z.enum(['CHARNIERE', 'COULISSE', 'RELEVABLE', 'COMPAS', 'PIED']),
  model: z.string(),
  drillingPattern: z.object({
    holes: z.array(z.object({
      x: z.number(),
      y: z.number(),
      diameter: z.number(),
      depth: z.number(),
      face: z.enum(['TOP', 'BOTTOM', 'FRONT', 'BACK', 'LEFT', 'RIGHT']),
    }))
  }),
  minThickness: z.number(),
  maxThickness: z.number(),
  drillingPrice: z.number(),
})
```

**Livrables** :
- [ ] CRUD quincaillerie
- [ ] Éditeur schémas perçage (JSON)
- [ ] Import catalogues fabricants

---

### 2.5 Gestion Tarifs

**Configuration tarifaire** :

| Clé | Description | Type |
|-----|-------------|------|
| `cutting_price_per_piece` | Prix découpe par pièce | € |
| `cutting_price_per_meter` | Prix découpe au mètre | €/m |
| `drilling_price_per_hole` | Prix par perçage | € |
| `finishing_lacquer_per_m2` | Prix laquage au m² | €/m² |
| `finishing_varnish_per_m2` | Prix vernissage au m² | €/m² |
| `margin_coefficient` | Coefficient de marge | % |

**Livrables** :
- [ ] Interface édition tarifs
- [ ] Historique modifications
- [ ] Grilles tarifaires par client

---

## Phase 3 : Configurateur Wizard

### 3.1 Store Zustand Configurateur

```typescript
// stores/configurateur.store.ts
interface ConfigurateurState {
  // Étape courante
  currentStep: number

  // Données pièce
  part: {
    reference: string
    quantity: number
    notes: string
    panelId: string | null
    length: number
    width: number
    grainOrientation: 'LONGUEUR' | 'LARGEUR' | null
    edges: {
      top: EdgeConfig | null
      bottom: EdgeConfig | null
      left: EdgeConfig | null
      right: EdgeConfig | null
    }
    assemblyDrillings: Drilling[]
    hardwareDrillings: HardwareDrilling[]
    machining: Machining[]
    finish: Finish | null
  }

  // Prix calculé
  priceBreakdown: PriceBreakdown

  // Actions
  setStep: (step: number) => void
  updatePart: (data: Partial<Part>) => void
  setEdge: (position: EdgePosition, config: EdgeConfig | null) => void
  addDrilling: (drilling: Drilling) => void
  removeDrilling: (id: string) => void
  calculatePrice: () => void
  reset: () => void
}
```

**Livrables** :
- [ ] Store Zustand complet
- [ ] Persistence localStorage
- [ ] Calcul prix temps réel
- [ ] Actions CRUD éléments

---

### 3.2 Composant Visualiseur Panneau

```typescript
// components/configurateur/PanelViewer.tsx
interface PanelViewerProps {
  width: number
  height: number
  edges: EdgeConfig
  drillings: Drilling[]
  machining: Machining[]
  onEdgeClick: (position: EdgePosition) => void
  onPanelClick: (x: number, y: number) => void
  onDrillingMove: (id: string, x: number, y: number) => void
}
```

**Fonctionnalités** :
- [ ] Rendu SVG/Canvas du panneau
- [ ] Chants cliquables avec états visuels
- [ ] Affichage perçages positionnés
- [ ] Affichage usinages
- [ ] Cotations automatiques
- [ ] Zoom/Pan
- [ ] Grille magnétique (32mm)

**Livrables** :
- [ ] Composant PanelViewer fonctionnel
- [ ] Interactions drag & drop
- [ ] Responsive (scale proportionnel)

---

### 3.3 Étapes 1-3 : Identification, Panneau, Dimensions

**Étape 1 - Identification** :
```typescript
// Formulaire simple
- Input référence (autocomplete suggestions)
- Input quantité (stepper)
- Textarea notes (optionnel)
```

**Étape 2 - Sélection Panneau** :
```typescript
// Composant PanelSelector
- Recherche textuelle
- Filtres (matière, épaisseur, fournisseur)
- Grille cards panneaux
- Modal détail panneau
- Sélection avec highlight
```

**Étape 3 - Dimensions** :
```typescript
// Formulaire dimensions
- Input longueur (mm)
- Input largeur (mm)
- Radio sens du fil (si applicable)
- Validation dimensions vs panneau source
- Visualisation pièce sur panneau source
```

**Livrables** :
- [ ] Composants formulaires étapes 1-3
- [ ] Validations Zod
- [ ] PanelSelector avec filtres
- [ ] Visualisation dimensions

---

### 3.4 Étape 4 : Configuration Chants

**Interface** :
```
┌─────────────────────────────────────┐
│  [Visualiseur avec 4 zones chants]  │
└─────────────────────────────────────┘

Pour chaque chant sélectionné:
┌─────────────────────────────────────┐
│  Matière:    [Dropdown ABS/Méla...] │
│  Épaisseur:  [Radio 0.4/1/2/3mm]    │
│  Décor:      [Selector couleur]     │
│  [Appliquer] [Annuler]              │
└─────────────────────────────────────┘
```

**Livrables** :
- [ ] EdgeSelector composant
- [ ] Dropdown chants filtrés par panneau
- [ ] Aperçu couleur temps réel
- [ ] Option "Appliquer à tous"

---

### 3.5 Étape 5 : Perçages Assemblage

**Types perçages** :
```typescript
type AssemblyDrillingType =
  | 'TOURILLON_FACE'
  | 'TOURILLON_CHANT'
  | 'CLAMEX'
  | 'CABINEO'
  | 'LAMELLO'
  | 'VISSAGE_FACE'
  | 'AVANT_TROU_CHANT'

interface AssemblyDrilling {
  id: string
  type: AssemblyDrillingType
  x: number
  y: number
  face: 'TOP' | 'BOTTOM' | 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT'
  diameter: number
  depth: number
}
```

**Interface** :
- Palette types perçages (drag)
- Zone de drop sur panneau
- Saisie coordonnées (X, Y)
- Modèles prédéfinis (étagère, caisson...)

**Livrables** :
- [ ] DrillConfigurator composant
- [ ] Drag & drop perçages
- [ ] Saisie manuelle coordonnées
- [ ] Modèles prédéfinis
- [ ] Détection collisions

---

### 3.6 Étape 6 : Quincaillerie

**Workflow** :
1. Sélection marque (BLUM, HETTICH, GRASS)
2. Sélection catégorie (charnière, coulisse...)
3. Sélection modèle précis
4. Positionnement automatique selon schéma
5. Ajustement position si nécessaire

**Livrables** :
- [ ] HardwareSelector composant
- [ ] Chargement schémas perçage
- [ ] Positionnement auto avec ajustement
- [ ] Vérification compatibilité épaisseur

---

### 3.7 Étape 7 : Usinages Spéciaux

**Types usinages** :
```typescript
type MachiningType =
  | 'RAINURE'      // Groove
  | 'FEUILLURE'    // Rabbet
  | 'EMBREMENT'    // Housing
  | 'PROFIL'       // Profile cut
  | 'ENCOCHE'      // Notch
  | 'ARRONDI'      // Radius
  | 'PERCAGE_SPECIAL' // Special drilling

interface Machining {
  id: string
  type: MachiningType
  geometry: {
    // Dépend du type
    startX?: number
    startY?: number
    endX?: number
    endY?: number
    width?: number
    depth?: number
    radius?: number
    diameter?: number
  }
  face: Face
}
```

**Livrables** :
- [ ] MachiningConfigurator composant
- [ ] Dessin géométrique sur panneau
- [ ] Paramètres par type d'usinage
- [ ] Aperçu visuel

---

### 3.8 Étape 8 : Finition

**Conditions affichage** :
- Uniquement si panneau = MDF ou plaqué bois

**Options** :
```typescript
interface Finish {
  type: 'LAQUAGE' | 'VERNISSAGE' | 'TEINTE_VERNIS' | null
  color?: string           // Code RAL/NCS pour laquage
  tint?: string            // Teinte bois
  sheen: 'MAT' | 'SATINE' | 'BRILLANT'
  faces: 'ONE' | 'TWO' | 'TWO_WITH_EDGES'
}
```

**Livrables** :
- [ ] FinishSelector composant
- [ ] Nuancier RAL/NCS
- [ ] Calcul surface automatique
- [ ] Option "Pas de finition"

---

### 3.9 Récapitulatif Prix & Ajout Panier

**Composant PriceSummary** :
```typescript
interface PriceBreakdown {
  material: { label: string; quantity: string; unitPrice: number; total: number }
  cutting: { label: string; quantity: string; unitPrice: number; total: number }
  edging: { label: string; quantity: string; unitPrice: number; total: number }
  drilling: { label: string; quantity: string; unitPrice: number; total: number }
  machining: { label: string; quantity: string; unitPrice: number; total: number }
  finishing: { label: string; quantity: string; unitPrice: number; total: number }
  unitTotal: number
  quantity: number
  grandTotal: number
}
```

**Livrables** :
- [ ] PriceSummary composant sidebar
- [ ] Détail par poste
- [ ] Animation mise à jour prix
- [ ] Bouton "Ajouter au panier"

---

## Phase 4 : Commandes & Export

### 4.1 Panier

**Fonctionnalités** :
- Liste pièces avec miniature
- Modification quantité
- Duplication pièce
- Suppression pièce
- Édition pièce (retour wizard)
- Regroupement par projet

**Livrables** :
- [ ] Page panier
- [ ] Store panier Zustand
- [ ] Actions CRUD pièces
- [ ] Calcul total panier

---

### 4.2 Validation Commande

**Workflow validation** :
1. Vérification technique automatique
   - Dimensions dans limites
   - Perçages sans collision
   - Quincaillerie compatible
2. Récapitulatif commande
3. Sélection livraison (retrait/livraison)
4. Acceptation CGV
5. Confirmation

**Livrables** :
- [ ] Service validation technique
- [ ] Page récapitulatif commande
- [ ] Formulaire livraison
- [ ] Checkbox CGV
- [ ] Mutation création commande

---

### 4.3 Génération PDF

**Documents générés** :
- Devis client (récapitulatif prix)
- Fiche de débit par pièce
- Bon de commande
- Étiquettes QR code

**Librairie** : React-PDF (@react-pdf/renderer)

```typescript
// services/pdf.service.ts
export async function generateQuotePDF(order: Order): Promise<Buffer>
export async function generateCuttingSheetPDF(part: ConfiguredPart): Promise<Buffer>
export async function generateLabelsPDF(parts: ConfiguredPart[]): Promise<Buffer>
```

**Livrables** :
- [ ] Template devis PDF
- [ ] Template fiche débit PDF
- [ ] Template étiquettes
- [ ] API endpoints download

---

### 4.4 Export Excel/CSV

**Formats export** :
- Liste pièces (Excel)
- Récapitulatif commande (CSV)
- Export ERP (format personnalisé)

**Librairie** : ExcelJS

**Livrables** :
- [ ] Export Excel pièces
- [ ] Export CSV commande
- [ ] Format configurable admin

---

### 4.5 Historique Commandes

**Interface client** :
- Liste commandes avec statut
- Détail commande
- Téléchargement documents
- Duplication commande

**Livrables** :
- [ ] Page mes commandes
- [ ] Page détail commande
- [ ] Filtres statut/date
- [ ] Actions duplication

---

## Phase 5 : Tests & Déploiement

### 5.1 Tests Unitaires

**Outils** : Vitest

**Cibles** :
- Services calcul prix
- Validations Zod
- Helpers/utils
- Store Zustand

```typescript
// __tests__/services/price.test.ts
describe('PriceService', () => {
  it('calculates material price correctly', () => {
    const result = calculateMaterialPrice({
      panelPricePerM2: 35,
      length: 800,
      width: 400,
      quantity: 2
    })
    expect(result).toBe(22.40) // 0.32m² × 35€ × 2
  })
})
```

**Livrables** :
- [ ] Tests services métier
- [ ] Tests validations
- [ ] Coverage > 80%

---

### 5.2 Tests E2E

**Outils** : Playwright

**Scénarios** :
1. Parcours complet configurateur
2. Création commande
3. Administration catalogue
4. Authentification

```typescript
// e2e/configurator.spec.ts
test('complete configuration flow', async ({ page }) => {
  await page.goto('/configurateur')

  // Étape 1
  await page.fill('[name="reference"]', 'TEST-001')
  await page.fill('[name="quantity"]', '2')
  await page.click('button:has-text("Suivant")')

  // Étape 2
  await page.click('[data-panel-id="panel-1"]')
  await page.click('button:has-text("Suivant")')

  // ... continuer
})
```

**Livrables** :
- [ ] Tests E2E parcours principaux
- [ ] Tests E2E admin
- [ ] CI intégration Playwright

---

### 5.3 Optimisation Performance

**Actions** :
- [ ] Audit Lighthouse (score > 90)
- [ ] Optimisation images (next/image)
- [ ] Code splitting par route
- [ ] Prefetch liens navigation
- [ ] Mise en cache API (TanStack Query)

---

### 5.4 Sécurité

**Checklist** :
- [ ] Validation Zod côté serveur
- [ ] Rate limiting API
- [ ] Headers sécurité (CSP, HSTS)
- [ ] Audit dépendances (npm audit)
- [ ] Protection CSRF
- [ ] Logs audit actions admin

---

### 5.5 Déploiement Production

**Checklist pré-prod** :
- [ ] Variables environnement production
- [ ] Base de données production (Railway/Supabase)
- [ ] Domaine configuré
- [ ] SSL actif
- [ ] Monitoring (Sentry)
- [ ] Analytics (Vercel)
- [ ] Backup BDD automatique

**Déploiement** :
```bash
# Tag release
git tag v1.0.0
git push origin v1.0.0

# Déploiement auto via Vercel
```

---

### 5.6 Documentation & Formation

**Livrables** :
- [ ] README projet complet
- [ ] Documentation API (tRPC)
- [ ] Guide administrateur
- [ ] Guide utilisateur
- [ ] Session formation équipe

---

## Checklist Globale

### Phase 1 : Setup
- [ ] Projet Next.js initialisé
- [ ] Base de données configurée
- [ ] tRPC configuré
- [ ] Authentification fonctionnelle
- [ ] CI/CD opérationnel

### Phase 2 : Admin
- [ ] Layout admin
- [ ] CRUD panneaux
- [ ] CRUD chants
- [ ] CRUD quincaillerie
- [ ] Gestion tarifs

### Phase 3 : Configurateur
- [ ] Store Zustand
- [ ] Visualiseur panneau
- [ ] 8 étapes wizard
- [ ] Calcul prix temps réel
- [ ] Ajout panier

### Phase 4 : Commandes
- [ ] Panier complet
- [ ] Validation commande
- [ ] Génération PDF
- [ ] Export Excel
- [ ] Historique commandes

### Phase 5 : Production
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Optimisation performance
- [ ] Sécurité validée
- [ ] Déploiement production
- [ ] Documentation complète
