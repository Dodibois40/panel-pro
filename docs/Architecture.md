# Architecture de Développement - Configurateur Débit Panneaux

## Vue d'ensemble

Application SaaS de configuration et débit de panneaux d'agencement bois permettant aux professionnels de commander des panneaux avec découpes, placage de chants, perçages, usinages et finitions.

---

## Stack Technique

### Frontend

| Technologie | Version | Justification |
|-------------|---------|---------------|
| **Next.js** | 14+ (App Router) | SSR pour SEO, performance optimale, full-stack |
| **React** | 18+ | Composants réutilisables, écosystème riche |
| **TypeScript** | 5+ | Typage fort, maintenabilité, DX |
| **Tailwind CSS** | 3+ | Utility-first, design system rapide |
| **shadcn/ui** | latest | Composants accessibles, personnalisables |

### State Management

| Technologie | Usage |
|-------------|-------|
| **Zustand** | État global application (panier, config utilisateur) |
| **TanStack Query** | Cache serveur, synchronisation données |
| **React Hook Form** | Gestion formulaires complexes |
| **Zod** | Validation schémas TypeScript |

### Backend

| Technologie | Justification |
|-------------|---------------|
| **Next.js API Routes** | API intégrée, simplicité déploiement |
| **tRPC** | API type-safe end-to-end |
| **Prisma** | ORM moderne, migrations, type-safe |
| **PostgreSQL** | Relations complexes, robuste, ACID |

### Services Externes

| Service | Usage |
|---------|-------|
| **NextAuth.js** | Authentification, SSO, multi-tenant |
| **Vercel** | Hébergement frontend, Edge Functions |
| **Railway/Supabase** | Base de données PostgreSQL managée |
| **Cloudinary/S3** | Stockage images panneaux |
| **Resend** | Emails transactionnels |

### Visualisation & Export

| Technologie | Usage |
|-------------|-------|
| **Konva.js / React-Konva** | Visualisation 2D panneaux interactive |
| **React-PDF** | Génération PDF côté serveur |
| **ExcelJS** | Export Excel/CSV |

---

## Architecture Applicative

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages/Routes          │  Composants UI        │  State          │
│  ├── /                 │  ├── PanelViewer      │  ├── Zustand    │
│  ├── /configurateur    │  ├── EdgeSelector     │  ├── TanStack   │
│  ├── /panier          │  ├── DrillConfigurator│  └── React HF   │
│  ├── /commandes       │  ├── PriceCalculator  │                 │
│  └── /admin/*         │  └── ...              │                 │
├─────────────────────────────────────────────────────────────────┤
│                        API LAYER (tRPC)                          │
├─────────────────────────────────────────────────────────────────┤
│  Routers               │  Services             │  Validations    │
│  ├── panel.router      │  ├── PriceService     │  ├── Zod        │
│  ├── order.router      │  ├── OrderService     │  Schemas        │
│  ├── user.router       │  ├── ExportService    │                 │
│  └── admin.router      │  └── ValidationSvc    │                 │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER (Prisma)                         │
├─────────────────────────────────────────────────────────────────┤
│  Models                │  PostgreSQL           │  Migrations     │
│  ├── User              │                       │                 │
│  ├── Panel             │  ┌─────────────────┐  │                 │
│  ├── EdgeBanding       │  │   Database      │  │                 │
│  ├── Hardware          │  │   PostgreSQL    │  │                 │
│  ├── ConfiguredPart    │  └─────────────────┘  │                 │
│  └── Order             │                       │                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Structure du Projet

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Routes authentification
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Routes protégées
│   │   ├── configurateur/
│   │   │   └── [step]/           # Wizard étapes 1-8
│   │   ├── panier/
│   │   ├── commandes/
│   │   │   └── [id]/
│   │   └── profil/
│   ├── admin/                    # Back-office admin
│   │   ├── panneaux/
│   │   ├── chants/
│   │   ├── quincaillerie/
│   │   ├── tarifs/
│   │   ├── commandes/
│   │   └── utilisateurs/
│   ├── api/                      # API Routes
│   │   └── trpc/[trpc]/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # Composants React
│   ├── ui/                       # shadcn/ui components
│   ├── configurateur/
│   │   ├── PanelViewer.tsx       # Visualiseur panneau 2D
│   │   ├── EdgeSelector.tsx      # Sélection chants
│   │   ├── DrillConfigurator.tsx # Config perçages
│   │   ├── HardwareSelector.tsx  # Sélection quincaillerie
│   │   ├── FinishSelector.tsx    # Sélection finitions
│   │   └── PriceSummary.tsx      # Résumé prix temps réel
│   ├── panier/
│   ├── commandes/
│   └── admin/
│
├── lib/                          # Utilitaires
│   ├── prisma.ts                 # Client Prisma
│   ├── trpc.ts                   # Config tRPC
│   ├── auth.ts                   # Config NextAuth
│   └── utils.ts                  # Helpers
│
├── server/                       # Code serveur
│   ├── routers/                  # tRPC routers
│   │   ├── panel.ts
│   │   ├── edge.ts
│   │   ├── hardware.ts
│   │   ├── order.ts
│   │   └── admin.ts
│   ├── services/                 # Logique métier
│   │   ├── price.service.ts      # Calcul prix
│   │   ├── validation.service.ts # Validations techniques
│   │   ├── export.service.ts     # PDF, Excel, DXF
│   │   └── order.service.ts
│   └── trpc.ts                   # Init tRPC
│
├── prisma/
│   ├── schema.prisma             # Schéma BDD
│   ├── migrations/
│   └── seed.ts                   # Données initiales
│
├── stores/                       # Zustand stores
│   ├── configurateur.store.ts
│   ├── panier.store.ts
│   └── user.store.ts
│
├── types/                        # Types TypeScript
│   ├── panel.types.ts
│   ├── order.types.ts
│   └── index.ts
│
├── hooks/                        # Custom React hooks
│   ├── useConfigurator.ts
│   ├── usePriceCalculation.ts
│   └── usePanelViewer.ts
│
└── public/                       # Assets statiques
    └── images/
```

---

## Modèle de Données (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============== UTILISATEURS ==============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  company       String?
  role          UserRole  @default(CLIENT)
  discountRate  Float     @default(0)

  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  PRODUCTION
  CLIENT
}

// ============== CATALOGUE ==============

model SupplierPanel {
  id              String   @id @default(cuid())
  reference       String   @unique
  name            String
  supplier        String
  material        PanelMaterial
  thickness       Float    // en mm
  length          Int      // en mm
  width           Int      // en mm
  pricePerM2      Float
  grainDirection  Boolean  @default(false)
  imageUrl        String?
  colorCode       String?
  isActive        Boolean  @default(true)

  configuredParts ConfiguredPart[]
  compatibleEdges EdgeBanding[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PanelMaterial {
  MELAMINE
  MDF
  STRATIFIE
  PLAQUE_BOIS
  CONTREPLAQUE
  AGGLO
}

model EdgeBanding {
  id              String   @id @default(cuid())
  reference       String   @unique
  name            String
  material        EdgeMaterial
  thickness       Float    // 0.4, 1, 2, 3mm
  width           Float    // hauteur disponible
  pricePerMeter   Float
  colorCode       String?

  compatiblePanels SupplierPanel[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum EdgeMaterial {
  ABS
  MELAMINE
  BOIS_MASSIF
  ALUMINIUM
  PVC
}

model Hardware {
  id              String   @id @default(cuid())
  reference       String   @unique
  name            String
  brand           HardwareBrand
  category        HardwareCategory
  model           String
  drillingPattern Json     // Schéma perçages JSON
  minThickness    Float
  maxThickness    Float
  drillingPrice   Float

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum HardwareBrand {
  BLUM
  HETTICH
  GRASS
  HAFELE
  AUTRE
}

enum HardwareCategory {
  CHARNIERE
  COULISSE
  RELEVABLE
  COMPAS
  PIED
  AUTRE
}

// ============== CONFIGURATION ==============

model ConfiguredPart {
  id              String   @id @default(cuid())
  reference       String   // Référence pièce client
  quantity        Int      @default(1)

  panel           SupplierPanel @relation(fields: [panelId], references: [id])
  panelId         String

  length          Int      // mm
  width           Int      // mm
  grainOrientation GrainOrientation?

  edgeConfig      Json     // {top, bottom, left, right}
  assemblyDrillings Json   // Liste perçages assemblage
  hardwareDrillings Json   // Liste perçages quincaillerie
  machiningOperations Json // Usinages spéciaux

  finish          Json?    // {type, color, faces}

  calculatedPrice Float
  notes           String?

  order           Order    @relation(fields: [orderId], references: [id])
  orderId         String

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum GrainOrientation {
  LONGUEUR
  LARGEUR
}

// ============== COMMANDES ==============

model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  projectName     String?

  customer        User     @relation(fields: [customerId], references: [id])
  customerId      String

  status          OrderStatus @default(DRAFT)
  parts           ConfiguredPart[]

  totalPrice      Float    @default(0)
  discountApplied Float    @default(0)

  deliveryOption  DeliveryOption @default(PICKUP)
  deliveryAddress String?

  confirmedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum OrderStatus {
  DRAFT
  PENDING
  CONFIRMED
  IN_PRODUCTION
  READY
  DELIVERED
  COMPLETED
  CANCELLED
}

enum DeliveryOption {
  PICKUP
  DELIVERY
  TRANSPORT
}

// ============== TARIFICATION ==============

model PricingConfig {
  id              String   @id @default(cuid())
  key             String   @unique
  value           Float
  description     String?

  updatedAt       DateTime @updatedAt
}
```

---

## Flux de Données

### Configurateur (Client → Serveur)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Zustand    │────▶│   tRPC       │────▶│   Prisma     │
│   Store      │     │   Mutation   │     │   DB         │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  État local          Validation          Persistance
  Calcul prix         Zod Schema          PostgreSQL
  temps réel
```

### Calcul Prix (Temps Réel)

```typescript
// Exécuté côté client via Zustand
calculatePrice(config: PartConfig): PriceBreakdown {
  return {
    material: calculateMaterialPrice(config),
    cutting: calculateCuttingPrice(config),
    edging: calculateEdgingPrice(config),
    drilling: calculateDrillingPrice(config),
    machining: calculateMachiningPrice(config),
    finishing: calculateFinishingPrice(config),
    total: sum(allPrices)
  }
}
```

---

## Sécurité

### Authentification & Autorisation

- **NextAuth.js** avec providers (credentials, Google, etc.)
- Sessions JWT stockées côté client
- Middleware Next.js pour protection des routes
- Vérification des rôles via tRPC middleware

### Validation

- **Zod** schemas pour toutes les entrées
- Validation côté client ET serveur
- Sanitization des inputs utilisateur

### Protection

- HTTPS obligatoire
- Rate limiting sur API
- CSRF protection (natif Next.js)
- Headers sécurité (CSP, HSTS, etc.)

---

## Environnements

| Environnement | URL | Base de données |
|---------------|-----|-----------------|
| **Development** | localhost:3000 | PostgreSQL local (Docker) |
| **Staging** | staging.app.com | Railway PostgreSQL |
| **Production** | app.com | Railway/Supabase PostgreSQL |

---

## CI/CD

```yaml
# Workflow GitHub Actions
- Push sur main → Deploy Staging
- Tag release → Deploy Production

Pipeline:
1. Lint (ESLint)
2. Type Check (TypeScript)
3. Tests (Vitest)
4. Build (Next.js)
5. Deploy (Vercel)
```

---

## Monitoring & Logs

| Service | Usage |
|---------|-------|
| **Vercel Analytics** | Performance, Core Web Vitals |
| **Sentry** | Error tracking |
| **Axiom/LogTail** | Logs applicatifs |
