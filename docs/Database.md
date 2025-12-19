# Base de Données - Panel Pro

## Vue d'Ensemble

| Paramètre | Valeur |
|-----------|--------|
| **SGBD** | PostgreSQL 15+ |
| **ORM** | Prisma 5+ |
| **Hébergement** | Railway |
| **Backup** | Automatique quotidien (Railway) |

---

## Architecture Déploiement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE PRODUCTION                            │
└─────────────────────────────────────────────────────────────────────────────┘

     NETLIFY                                      RAILWAY
  ┌─────────────┐                            ┌─────────────────┐
  │             │                            │                 │
  │  Frontend   │    HTTPS API Calls         │    Backend      │
  │  Next.js    │◄──────────────────────────▶│    Node.js      │
  │  (Static +  │                            │    tRPC API     │
  │   SSR Edge) │                            │                 │
  │             │                            └────────┬────────┘
  └─────────────┘                                     │
                                                      │ Prisma
                                                      │
                                              ┌───────▼────────┐
                                              │                │
                                              │  PostgreSQL    │
                                              │  Railway       │
                                              │                │
                                              │  ┌──────────┐  │
                                              │  │ Backups  │  │
                                              │  │ Auto     │  │
                                              │  └──────────┘  │
                                              └────────────────┘
```

---

## Schéma Entité-Relation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DIAGRAMME ER                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │     User     │         │    Order     │         │   Configured │
  ├──────────────┤         ├──────────────┤         │     Part     │
  │ id visé          │ 1       ∞ │ id           │ 1       ∞ ├──────────────┤
  │ email        ├─────────┤ orderNumber  ├─────────┤ id           │
  │ name         │         │ projectName  │         │ reference    │
  │ company      │         │ status       │         │ quantity     │
  │ role         │         │ totalPrice   │         │ length       │
  │ discountRate │         │ customerId   │         │ width        │
  └──────────────┘         └──────────────┘         │ panelId      │
                                                    │ orderId      │
                                                    └──────┬───────┘
                                                           │
         ┌─────────────────────────────────────────────────┼─────────┐
         │                                                 │         │
         ▼                                                 ▼         ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │ SupplierPanel│         │  EdgeBanding │         │   Hardware   │
  ├──────────────┤         ├──────────────┤         ├──────────────┤
  │ id           │ ∞     ∞ │ id           │         │ id           │
  │ reference    ├─────────┤ reference    │         │ reference    │
  │ name         │         │ name         │         │ brand        │
  │ supplier     │         │ material     │         │ category     │
  │ material     │         │ thickness    │         │ drillingPattern
  │ thickness    │         │ pricePerMeter│         │ drillingPrice│
  │ pricePerM2   │         └──────────────┘         └──────────────┘
  └──────────────┘

  ┌──────────────┐
  │PricingConfig │
  ├──────────────┤
  │ id           │
  │ key          │
  │ value        │
  │ description  │
  └──────────────┘
```

---

## Modèle de Données Détaillé

### 1. User (Utilisateurs)

Gestion des comptes utilisateurs (clients professionnels et administrateurs).

```sql
TABLE: users
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Email de connexion |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Mot de passe hashé (bcrypt) |
| `name` | `VARCHAR(100)` | NULL | Nom complet |
| `company` | `VARCHAR(150)` | NULL | Raison sociale |
| `phone` | `VARCHAR(20)` | NULL | Téléphone |
| `address` | `TEXT` | NULL | Adresse postale |
| `role` | `ENUM` | NOT NULL, DEFAULT 'CLIENT' | CLIENT, ADMIN, PRODUCTION |
| `discount_rate` | `DECIMAL(5,2)` | DEFAULT 0 | Taux remise client (%) |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Compte actif |
| `email_verified` | `TIMESTAMP` | NULL | Date vérification email |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date création |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Index :**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company);
```

**Prisma Schema :**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String?
  company       String?
  phone         String?
  address       String?
  role          UserRole  @default(CLIENT)
  discountRate  Decimal   @default(0) @map("discount_rate") @db.Decimal(5, 2)
  isActive      Boolean   @default(true) @map("is_active")
  emailVerified DateTime? @map("email_verified")

  orders        Order[]
  sessions      Session[]

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

enum UserRole {
  ADMIN
  PRODUCTION
  CLIENT
}
```

---

### 2. SupplierPanel (Panneaux Fournisseur)

Catalogue des panneaux disponibles à la commande.

```sql
TABLE: supplier_panels
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `reference` | `VARCHAR(50)` | UNIQUE, NOT NULL | Référence fournisseur |
| `name` | `VARCHAR(150)` | NOT NULL | Nom commercial |
| `supplier` | `VARCHAR(100)` | NOT NULL | Nom fournisseur (EGGER, KRONOSPAN...) |
| `material` | `ENUM` | NOT NULL | Type matériau |
| `thickness` | `DECIMAL(5,2)` | NOT NULL | Épaisseur en mm |
| `length` | `INTEGER` | NOT NULL | Longueur standard en mm |
| `width` | `INTEGER` | NOT NULL | Largeur standard en mm |
| `price_per_m2` | `DECIMAL(10,2)` | NOT NULL | Prix au m² HT |
| `grain_direction` | `BOOLEAN` | DEFAULT FALSE | Panneau avec sens du fil |
| `color_code` | `VARCHAR(20)` | NULL | Code couleur/décor |
| `image_url` | `VARCHAR(500)` | NULL | URL image panneau |
| `stock_status` | `ENUM` | DEFAULT 'IN_STOCK' | Disponibilité |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Actif au catalogue |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date création |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Enums :**
```sql
CREATE TYPE panel_material AS ENUM (
  'MELAMINE',      -- Mélaminé
  'MDF',           -- MDF brut
  'MDF_LAQUE',     -- MDF laqué
  'STRATIFIE',     -- Stratifié HPL
  'PLAQUE_BOIS',   -- Plaqué bois naturel
  'CONTREPLAQUE',  -- Contreplaqué
  'AGGLO',         -- Aggloméré
  'COMPACT'        -- Compact HPL
);

CREATE TYPE stock_status AS ENUM (
  'IN_STOCK',      -- En stock
  'LOW_STOCK',     -- Stock limité
  'ON_ORDER',      -- Sur commande
  'DISCONTINUED'   -- Arrêté
);
```

**Index :**
```sql
CREATE UNIQUE INDEX idx_panels_reference ON supplier_panels(reference);
CREATE INDEX idx_panels_supplier ON supplier_panels(supplier);
CREATE INDEX idx_panels_material ON supplier_panels(material);
CREATE INDEX idx_panels_thickness ON supplier_panels(thickness);
CREATE INDEX idx_panels_active ON supplier_panels(is_active) WHERE is_active = TRUE;
```

**Prisma Schema :**
```prisma
model SupplierPanel {
  id             String        @id @default(cuid())
  reference      String        @unique
  name           String
  supplier       String
  material       PanelMaterial
  thickness      Decimal       @db.Decimal(5, 2)
  length         Int
  width          Int
  pricePerM2     Decimal       @map("price_per_m2") @db.Decimal(10, 2)
  grainDirection Boolean       @default(false) @map("grain_direction")
  colorCode      String?       @map("color_code")
  imageUrl       String?       @map("image_url")
  stockStatus    StockStatus   @default(IN_STOCK) @map("stock_status")
  isActive       Boolean       @default(true) @map("is_active")

  configuredParts ConfiguredPart[]
  compatibleEdges SupplierPanelEdge[]

  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  @@index([supplier])
  @@index([material])
  @@index([thickness])
  @@map("supplier_panels")
}

enum PanelMaterial {
  MELAMINE
  MDF
  MDF_LAQUE
  STRATIFIE
  PLAQUE_BOIS
  CONTREPLAQUE
  AGGLO
  COMPACT
}

enum StockStatus {
  IN_STOCK
  LOW_STOCK
  ON_ORDER
  DISCONTINUED
}
```

---

### 3. EdgeBanding (Chants)

Catalogue des chants pour placage.

```sql
TABLE: edge_bandings
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `reference` | `VARCHAR(50)` | UNIQUE, NOT NULL | Référence |
| `name` | `VARCHAR(150)` | NOT NULL | Nom commercial |
| `material` | `ENUM` | NOT NULL | Type matériau chant |
| `thickness` | `DECIMAL(3,1)` | NOT NULL | Épaisseur (0.4, 1, 2, 3 mm) |
| `width` | `DECIMAL(5,1)` | NOT NULL | Hauteur disponible en mm |
| `price_per_meter` | `DECIMAL(8,2)` | NOT NULL | Prix au mètre linéaire HT |
| `color_code` | `VARCHAR(20)` | NULL | Code couleur/décor |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Actif au catalogue |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date création |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Enums :**
```sql
CREATE TYPE edge_material AS ENUM (
  'ABS',           -- ABS standard
  'ABS_LASER',     -- ABS pour placage laser
  'MELAMINE',      -- Mélamine
  'PVC',           -- PVC
  'BOIS_MASSIF',   -- Bois massif
  'ALUMINIUM',     -- Profilé aluminium
  'ACRYLIQUE'      -- Acrylique (brillant)
);
```

**Prisma Schema :**
```prisma
model EdgeBanding {
  id            String       @id @default(cuid())
  reference     String       @unique
  name          String
  material      EdgeMaterial
  thickness     Decimal      @db.Decimal(3, 1)
  width         Decimal      @db.Decimal(5, 1)
  pricePerMeter Decimal      @map("price_per_meter") @db.Decimal(8, 2)
  colorCode     String?      @map("color_code")
  isActive      Boolean      @default(true) @map("is_active")

  compatiblePanels SupplierPanelEdge[]

  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  @@index([material])
  @@index([thickness])
  @@map("edge_bandings")
}

enum EdgeMaterial {
  ABS
  ABS_LASER
  MELAMINE
  PVC
  BOIS_MASSIF
  ALUMINIUM
  ACRYLIQUE
}
```

---

### 4. SupplierPanelEdge (Relation Panneau-Chant)

Table de jonction pour les chants compatibles avec chaque panneau.

```sql
TABLE: supplier_panel_edges
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `panel_id` | `VARCHAR(25)` | PK, FK | Référence panneau |
| `edge_id` | `VARCHAR(25)` | PK, FK | Référence chant |
| `is_default` | `BOOLEAN` | DEFAULT FALSE | Chant par défaut pour ce panneau |

**Prisma Schema :**
```prisma
model SupplierPanelEdge {
  panel     SupplierPanel @relation(fields: [panelId], references: [id], onDelete: Cascade)
  panelId   String        @map("panel_id")
  edge      EdgeBanding   @relation(fields: [edgeId], references: [id], onDelete: Cascade)
  edgeId    String        @map("edge_id")
  isDefault Boolean       @default(false) @map("is_default")

  @@id([panelId, edgeId])
  @@map("supplier_panel_edges")
}
```

---

### 5. Hardware (Quincaillerie)

Catalogue de quincaillerie avec schémas de perçage.

```sql
TABLE: hardware
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `reference` | `VARCHAR(50)` | UNIQUE, NOT NULL | Référence fabricant |
| `name` | `VARCHAR(150)` | NOT NULL | Nom produit |
| `brand` | `ENUM` | NOT NULL | Marque |
| `category` | `ENUM` | NOT NULL | Catégorie |
| `model` | `VARCHAR(100)` | NOT NULL | Modèle précis |
| `drilling_pattern` | `JSONB` | NOT NULL | Schéma perçages (JSON) |
| `min_thickness` | `DECIMAL(5,2)` | NOT NULL | Épaisseur panneau min (mm) |
| `max_thickness` | `DECIMAL(5,2)` | NOT NULL | Épaisseur panneau max (mm) |
| `drilling_price` | `DECIMAL(8,2)` | NOT NULL | Prix perçage unitaire HT |
| `image_url` | `VARCHAR(500)` | NULL | URL image produit |
| `documentation_url` | `VARCHAR(500)` | NULL | URL fiche technique |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Actif au catalogue |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date création |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Enums :**
```sql
CREATE TYPE hardware_brand AS ENUM (
  'BLUM',
  'HETTICH',
  'GRASS',
  'HAFELE',
  'SALICE',
  'KING_SLIDE',
  'OTHER'
);

CREATE TYPE hardware_category AS ENUM (
  'CHARNIERE',       -- Charnières
  'COULISSE',        -- Coulisses tiroir
  'RELEVABLE',       -- Relevables (AVENTOS...)
  'COMPAS',          -- Compas abattants
  'PIED',            -- Pieds réglables
  'TIROIR_SYSTEME',  -- Systèmes tiroir complets
  'POUBELLE',        -- Systèmes poubelle
  'TOURNIQUET',      -- Tourniquets
  'OTHER'
);
```

**Structure JSON `drilling_pattern` :**
```json
{
  "holes": [
    {
      "id": "h1",
      "x": 0,
      "y": 37,
      "diameter": 35,
      "depth": 13,
      "face": "FRONT",
      "type": "BLIND"
    },
    {
      "id": "h2",
      "x": 9.5,
      "y": 37,
      "diameter": 8,
      "depth": 11,
      "face": "TOP",
      "type": "BLIND"
    }
  ],
  "referencePoint": "TOP_LEFT",
  "unit": "mm"
}
```

**Prisma Schema :**
```prisma
model Hardware {
  id               String           @id @default(cuid())
  reference        String           @unique
  name             String
  brand            HardwareBrand
  category         HardwareCategory
  model            String
  drillingPattern  Json             @map("drilling_pattern")
  minThickness     Decimal          @map("min_thickness") @db.Decimal(5, 2)
  maxThickness     Decimal          @map("max_thickness") @db.Decimal(5, 2)
  drillingPrice    Decimal          @map("drilling_price") @db.Decimal(8, 2)
  imageUrl         String?          @map("image_url")
  documentationUrl String?          @map("documentation_url")
  isActive         Boolean          @default(true) @map("is_active")

  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  @@index([brand])
  @@index([category])
  @@map("hardware")
}

enum HardwareBrand {
  BLUM
  HETTICH
  GRASS
  HAFELE
  SALICE
  KING_SLIDE
  OTHER
}

enum HardwareCategory {
  CHARNIERE
  COULISSE
  RELEVABLE
  COMPAS
  PIED
  TIROIR_SYSTEME
  POUBELLE
  TOURNIQUET
  OTHER
}
```

---

### 6. Order (Commandes)

Commandes clients.

```sql
TABLE: orders
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `order_number` | `VARCHAR(20)` | UNIQUE, NOT NULL | N° commande (PP-2024-00001) |
| `project_name` | `VARCHAR(150)` | NULL | Nom du projet/chantier |
| `customer_id` | `VARCHAR(25)` | FK, NOT NULL | Référence client |
| `status` | `ENUM` | NOT NULL, DEFAULT 'DRAFT' | Statut commande |
| `total_price` | `DECIMAL(12,2)` | DEFAULT 0 | Total HT |
| `discount_applied` | `DECIMAL(12,2)` | DEFAULT 0 | Remise appliquée |
| `tax_rate` | `DECIMAL(5,2)` | DEFAULT 20 | Taux TVA (%) |
| `delivery_option` | `ENUM` | DEFAULT 'PICKUP' | Mode livraison |
| `delivery_address` | `TEXT` | NULL | Adresse livraison |
| `delivery_date` | `DATE` | NULL | Date livraison souhaitée |
| `notes` | `TEXT` | NULL | Notes commande |
| `confirmed_at` | `TIMESTAMP` | NULL | Date confirmation |
| `produced_at` | `TIMESTAMP` | NULL | Date mise en production |
| `completed_at` | `TIMESTAMP` | NULL | Date finalisation |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date création |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Enums :**
```sql
CREATE TYPE order_status AS ENUM (
  'DRAFT',          -- Brouillon (panier)
  'PENDING',        -- En attente validation
  'CONFIRMED',      -- Confirmée
  'IN_PRODUCTION',  -- En fabrication
  'READY',          -- Prête
  'SHIPPED',        -- Expédiée
  'DELIVERED',      -- Livrée
  'COMPLETED',      -- Terminée
  'CANCELLED'       -- Annulée
);

CREATE TYPE delivery_option AS ENUM (
  'PICKUP',         -- Retrait sur place
  'DELIVERY',       -- Livraison standard
  'EXPRESS',        -- Livraison express
  'TRANSPORT'       -- Transport spécial
);
```

**Index :**
```sql
CREATE UNIQUE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

**Prisma Schema :**
```prisma
model Order {
  id              String         @id @default(cuid())
  orderNumber     String         @unique @map("order_number")
  projectName     String?        @map("project_name")

  customer        User           @relation(fields: [customerId], references: [id])
  customerId      String         @map("customer_id")

  status          OrderStatus    @default(DRAFT)
  totalPrice      Decimal        @default(0) @map("total_price") @db.Decimal(12, 2)
  discountApplied Decimal        @default(0) @map("discount_applied") @db.Decimal(12, 2)
  taxRate         Decimal        @default(20) @map("tax_rate") @db.Decimal(5, 2)

  deliveryOption  DeliveryOption @default(PICKUP) @map("delivery_option")
  deliveryAddress String?        @map("delivery_address")
  deliveryDate    DateTime?      @map("delivery_date") @db.Date
  notes           String?

  parts           ConfiguredPart[]

  confirmedAt     DateTime?      @map("confirmed_at")
  producedAt      DateTime?      @map("produced_at")
  completedAt     DateTime?      @map("completed_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  @@index([customerId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("orders")
}

enum OrderStatus {
  DRAFT
  PENDING
  CONFIRMED
  IN_PRODUCTION
  READY
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
}

enum DeliveryOption {
  PICKUP
  DELIVERY
  EXPRESS
  TRANSPORT
}
```

---

### 7. ConfiguredPart (Pièces Configurées)

Pièces individuelles configurées dans une commande.

```sql
TABLE: configured_parts
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `reference` | `VARCHAR(100)` | NOT NULL | Référence pièce client |
| `quantity` | `INTEGER` | NOT NULL, DEFAULT 1 | Quantité |
| `order_id` | `VARCHAR(25)` | FK, NOT NULL | Référence commande |
| `panel_id` | `VARCHAR(25)` | FK, NOT NULL | Référence panneau |
| `length` | `INTEGER` | NOT NULL | Longueur finie (mm) |
| `width` | `INTEGER` | NOT NULL | Largeur finie (mm) |
| `grain_orientation` | `ENUM` | NULL | Orientation du fil |
| `edge_config` | `JSONB` | NOT NULL | Configuration chants |
| `assembly_drillings` | `JSONB` | DEFAULT '[]' | Perçages assemblage |
| `hardware_drillings` | `JSONB` | DEFAULT '[]' | Perçages quincaillerie |
| `machining_operations` | `JSONB` | DEFAULT '[]' | Usinages spéciaux |
| `finish` | `JSONB` | NULL | Configuration finition |
| `calculated_price` | `DECIMAL(10,2)` | NOT NULL | Prix calculé HT |
| `price_breakdown` | `JSONB` | NOT NULL | Détail calcul prix |
| `notes` | `TEXT` | NULL | Notes/instructions |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date création |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Structure JSON `edge_config` :**
```json
{
  "top": {
    "edgeId": "clx123...",
    "thickness": 1
  },
  "bottom": null,
  "left": {
    "edgeId": "clx123...",
    "thickness": 2
  },
  "right": {
    "edgeId": "clx456...",
    "thickness": 1
  }
}
```

**Structure JSON `assembly_drillings` :**
```json
[
  {
    "id": "d1",
    "type": "TOURILLON_FACE",
    "x": 50,
    "y": 25,
    "diameter": 8,
    "depth": 12,
    "face": "TOP"
  },
  {
    "id": "d2",
    "type": "TOURILLON_CHANT",
    "x": 0,
    "y": 100,
    "diameter": 8,
    "depth": 30,
    "face": "LEFT"
  }
]
```

**Structure JSON `hardware_drillings` :**
```json
[
  {
    "id": "hw1",
    "hardwareId": "clx789...",
    "hardwareRef": "CLIP TOP 110°",
    "position": { "x": 100, "y": 37 },
    "holes": [
      { "x": 100, "y": 37, "diameter": 35, "depth": 13, "face": "FRONT" },
      { "x": 109.5, "y": 37, "diameter": 8, "depth": 11, "face": "TOP" }
    ]
  }
]
```

**Structure JSON `machining_operations` :**
```json
[
  {
    "id": "m1",
    "type": "RAINURE",
    "startX": 0,
    "startY": 200,
    "endX": 800,
    "endY": 200,
    "width": 8,
    "depth": 10,
    "face": "BACK"
  }
]
```

**Structure JSON `finish` :**
```json
{
  "type": "LAQUAGE",
  "colorCode": "RAL 9010",
  "colorName": "Blanc pur",
  "sheen": "SATINE",
  "faces": "TWO_WITH_EDGES"
}
```

**Structure JSON `price_breakdown` :**
```json
{
  "material": { "surface": 0.32, "unitPrice": 35, "total": 11.20 },
  "cutting": { "quantity": 1, "unitPrice": 2.50, "total": 2.50 },
  "edging": { "length": 2.4, "unitPrice": 2, "total": 4.80 },
  "assemblyDrilling": { "count": 8, "unitPrice": 0.40, "total": 3.20 },
  "hardwareDrilling": { "count": 0, "unitPrice": 0, "total": 0 },
  "machining": { "length": 0, "unitPrice": 0, "total": 0 },
  "finishing": { "surface": 0, "unitPrice": 0, "total": 0 },
  "unitTotal": 21.70,
  "quantity": 2,
  "total": 43.40
}
```

**Prisma Schema :**
```prisma
model ConfiguredPart {
  id                  String            @id @default(cuid())
  reference           String
  quantity            Int               @default(1)

  order               Order             @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId             String            @map("order_id")

  panel               SupplierPanel     @relation(fields: [panelId], references: [id])
  panelId             String            @map("panel_id")

  length              Int
  width               Int
  grainOrientation    GrainOrientation? @map("grain_orientation")

  edgeConfig          Json              @map("edge_config")
  assemblyDrillings   Json              @default("[]") @map("assembly_drillings")
  hardwareDrillings   Json              @default("[]") @map("hardware_drillings")
  machiningOperations Json              @default("[]") @map("machining_operations")
  finish              Json?

  calculatedPrice     Decimal           @map("calculated_price") @db.Decimal(10, 2)
  priceBreakdown      Json              @map("price_breakdown")
  notes               String?

  createdAt           DateTime          @default(now()) @map("created_at")
  updatedAt           DateTime          @updatedAt @map("updated_at")

  @@index([orderId])
  @@index([panelId])
  @@map("configured_parts")
}

enum GrainOrientation {
  LENGTH    // Fil dans le sens de la longueur
  WIDTH     // Fil dans le sens de la largeur
}
```

---

### 8. PricingConfig (Configuration Tarifs)

Paramètres de tarification globaux.

```sql
TABLE: pricing_configs
```

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `VARCHAR(25)` | PK, CUID | Identifiant unique |
| `key` | `VARCHAR(50)` | UNIQUE, NOT NULL | Clé paramètre |
| `value` | `DECIMAL(12,4)` | NOT NULL | Valeur |
| `unit` | `VARCHAR(20)` | NULL | Unité (€, €/m², €/ml...) |
| `description` | `TEXT` | NULL | Description |
| `category` | `VARCHAR(50)` | NOT NULL | Catégorie |
| `updated_by` | `VARCHAR(25)` | FK | Utilisateur modificateur |
| `updated_at` | `TIMESTAMP` | AUTO UPDATE | Date modification |

**Données initiales :**
```sql
INSERT INTO pricing_configs (key, value, unit, description, category) VALUES
-- Découpe
('cutting_price_per_piece', 2.50, '€', 'Forfait découpe par pièce', 'CUTTING'),
('cutting_price_per_meter', 0.80, '€/ml', 'Supplément découpe au mètre', 'CUTTING'),
('cutting_min_size', 50, 'mm', 'Dimension minimum de découpe', 'CUTTING'),

-- Chants
('edging_labor_per_meter', 1.50, '€/ml', 'Main d''œuvre placage chant', 'EDGING'),
('edging_laser_supplement', 0.50, '€/ml', 'Supplément chant laser', 'EDGING'),

-- Perçages
('drilling_price_standard', 0.40, '€', 'Prix perçage standard', 'DRILLING'),
('drilling_price_special', 0.80, '€', 'Prix perçage spécial', 'DRILLING'),

-- Usinages
('machining_groove_per_meter', 3.00, '€/ml', 'Rainure au mètre linéaire', 'MACHINING'),
('machining_rabbet_per_meter', 4.00, '€/ml', 'Feuillure au mètre linéaire', 'MACHINING'),
('machining_profile_per_meter', 5.00, '€/ml', 'Profil au mètre linéaire', 'MACHINING'),

-- Finitions
('finishing_lacquer_per_m2', 45.00, '€/m²', 'Laquage au m²', 'FINISHING'),
('finishing_varnish_per_m2', 25.00, '€/m²', 'Vernissage au m²', 'FINISHING'),
('finishing_stain_per_m2', 15.00, '€/m²', 'Teinte au m²', 'FINISHING'),

-- Marge
('margin_coefficient', 1.35, '', 'Coefficient de marge global', 'MARGIN'),
('min_order_amount', 50.00, '€', 'Montant minimum commande', 'ORDER');
```

**Prisma Schema :**
```prisma
model PricingConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Decimal  @db.Decimal(12, 4)
  unit        String?
  description String?
  category    String

  updatedBy   User?    @relation(fields: [updatedById], references: [id])
  updatedById String?  @map("updated_by")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@map("pricing_configs")
}
```

---

### 9. Session (Sessions Auth)

Sessions d'authentification (NextAuth).

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## Configuration Railway

### Variables d'Environnement

```bash
# Railway PostgreSQL (auto-généré)
DATABASE_URL="postgresql://postgres:password@hostname.railway.app:5432/railway"

# Pool de connexions (recommandé)
DATABASE_URL="postgresql://postgres:password@hostname.railway.app:5432/railway?connection_limit=10&pool_timeout=30"
```

### Configuration Prisma pour Railway

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Pour les migrations
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
  binaryTargets   = ["native", "linux-musl-openssl-3.0.x"] // Railway
}
```

### Script de Déploiement

```json
// package.json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## Migrations

### Workflow Migrations

```bash
# 1. Développement - Créer une migration
pnpm prisma migrate dev --name add_feature_xyz

# 2. Vérifier le SQL généré
cat prisma/migrations/[timestamp]_add_feature_xyz/migration.sql

# 3. Production - Appliquer les migrations
pnpm prisma migrate deploy
```

### Migration Initiale

```bash
# Générer la première migration
pnpm prisma migrate dev --name init

# Structure générée
prisma/
├── migrations/
│   └── 20241218120000_init/
│       └── migration.sql
└── schema.prisma
```

---

## Seed (Données Initiales)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminPassword = await hash('admin123!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@panelpro.fr' },
    update: {},
    create: {
      email: 'admin@panelpro.fr',
      passwordHash: adminPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  })

  // Demo client
  const clientPassword = await hash('demo123!', 12)
  await prisma.user.upsert({
    where: { email: 'demo@panelpro.fr' },
    update: {},
    create: {
      email: 'demo@panelpro.fr',
      passwordHash: clientPassword,
      name: 'Client Démo',
      company: 'Menuiserie Dupont',
      role: 'CLIENT',
      discountRate: 5,
    },
  })

  // Sample panels
  const panels = [
    {
      reference: 'EGG-H3303-ST10',
      name: 'Chêne naturel Hamilton',
      supplier: 'EGGER',
      material: 'MELAMINE' as const,
      thickness: 19,
      length: 2800,
      width: 2070,
      pricePerM2: 35.50,
      grainDirection: true,
      colorCode: 'H3303',
    },
    {
      reference: 'EGG-W1000-ST9',
      name: 'Blanc premium',
      supplier: 'EGGER',
      material: 'MELAMINE' as const,
      thickness: 18,
      length: 2800,
      width: 2070,
      pricePerM2: 28.00,
      grainDirection: false,
      colorCode: 'W1000',
    },
    {
      reference: 'KRO-MDF-19',
      name: 'MDF Standard',
      supplier: 'KRONOSPAN',
      material: 'MDF' as const,
      thickness: 19,
      length: 2800,
      width: 2070,
      pricePerM2: 12.50,
      grainDirection: false,
    },
  ]

  for (const panel of panels) {
    await prisma.supplierPanel.upsert({
      where: { reference: panel.reference },
      update: {},
      create: panel,
    })
  }

  // Sample edges
  const edges = [
    {
      reference: 'ABS-H3303-1',
      name: 'ABS Chêne Hamilton 1mm',
      material: 'ABS' as const,
      thickness: 1,
      width: 23,
      pricePerMeter: 2.20,
      colorCode: 'H3303',
    },
    {
      reference: 'ABS-W1000-1',
      name: 'ABS Blanc 1mm',
      material: 'ABS' as const,
      thickness: 1,
      width: 23,
      pricePerMeter: 1.80,
      colorCode: 'W1000',
    },
  ]

  for (const edge of edges) {
    await prisma.edgeBanding.upsert({
      where: { reference: edge.reference },
      update: {},
      create: edge,
    })
  }

  // Pricing config
  const pricingConfigs = [
    { key: 'cutting_price_per_piece', value: 2.50, unit: '€', category: 'CUTTING', description: 'Forfait découpe par pièce' },
    { key: 'drilling_price_standard', value: 0.40, unit: '€', category: 'DRILLING', description: 'Prix perçage standard' },
    { key: 'margin_coefficient', value: 1.35, unit: '', category: 'MARGIN', description: 'Coefficient de marge global' },
    { key: 'min_order_amount', value: 50.00, unit: '€', category: 'ORDER', description: 'Montant minimum commande' },
  ]

  for (const config of pricingConfigs) {
    await prisma.pricingConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  console.log('✅ Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## Requêtes Optimisées

### Requête Panier Complet

```typescript
const orderWithParts = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        discountRate: true,
      },
    },
    parts: {
      include: {
        panel: {
          select: {
            id: true,
            reference: true,
            name: true,
            material: true,
            thickness: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    },
  },
})
```

### Recherche Panneaux avec Filtres

```typescript
const panels = await prisma.supplierPanel.findMany({
  where: {
    isActive: true,
    material: material ? { equals: material } : undefined,
    thickness: thickness ? { equals: thickness } : undefined,
    supplier: supplier ? { contains: supplier, mode: 'insensitive' } : undefined,
    OR: search ? [
      { name: { contains: search, mode: 'insensitive' } },
      { reference: { contains: search, mode: 'insensitive' } },
    ] : undefined,
  },
  include: {
    compatibleEdges: {
      include: { edge: true },
      where: { isDefault: true },
    },
  },
  orderBy: { name: 'asc' },
  take: 50,
})
```

### Dashboard Stats Admin

```typescript
const [ordersCount, revenue, pendingOrders] = await Promise.all([
  prisma.order.count({
    where: {
      status: { not: 'DRAFT' },
      createdAt: { gte: startOfMonth },
    },
  }),
  prisma.order.aggregate({
    where: {
      status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'COMPLETED'] },
      confirmedAt: { gte: startOfMonth },
    },
    _sum: { totalPrice: true },
  }),
  prisma.order.count({
    where: { status: 'PENDING' },
  }),
])
```

---

## Backup & Maintenance

### Backup Automatique (Railway)

Railway effectue des backups automatiques quotidiens. Pour un backup manuel :

```bash
# Export via pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restauration
psql $DATABASE_URL < backup_20241218.sql
```

### Monitoring Connexions

```sql
-- Vérifier les connexions actives
SELECT count(*) FROM pg_stat_activity WHERE datname = 'railway';

-- Tuer les connexions inactives
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'railway'
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '10 minutes';
```

---

## Schéma Prisma Complet

Le fichier complet est disponible dans [prisma/schema.prisma](../prisma/schema.prisma).

```bash
# Visualiser le schéma
pnpm prisma studio

# Générer le client
pnpm prisma generate

# Formater le schéma
pnpm prisma format
```
