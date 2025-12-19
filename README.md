<p align="center">
  <img src="public/images/logo.svg" alt="Panel Pro" width="120" height="120">
</p>

<h1 align="center">Panel Pro</h1>

<p align="center">
  <strong>Configurateur professionnel de débit de panneaux d'agencement</strong>
</p>

<p align="center">
  Plateforme SaaS de configuration et commande de panneaux bois sur-mesure<br>
  pour les professionnels de l'agencement, menuiserie et ébénisterie.
</p>

<p align="center">
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#démonstration">Démo</a> •
  <a href="#installation">Installation</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contribution">Contribution</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="License">
  <img src="https://img.shields.io/badge/Next.js-14+-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5+-3178c6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>

---

## À propos

**Panel Pro** est une solution professionnelle complète destinée aux acteurs de l'agencement bois :

- **Agenceurs** et fabricants de mobilier
- **Menuisiers** et **ébénistes**
- **Architectes d'intérieur**
- **Cuisinistes** et **dressings**

La plateforme permet de configurer avec précision des commandes de panneaux incluant découpes, placage de chants, perçages d'assemblage, quincaillerie et finitions, avec un **calcul de prix instantané** et transparent.

### Pourquoi Panel Pro ?

| Problème | Solution Panel Pro |
|----------|-------------------|
| Devis manuels chronophages | Configuration autonome 24/7 avec prix temps réel |
| Erreurs de communication | Spécifications techniques précises et validées |
| Délais de réponse | Commande instantanée, documents générés automatiquement |
| Saisie redondante | Export direct vers production (PDF, Excel, CNC) |

---

## Fonctionnalités

### Configurateur Intelligent

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WIZARD DE CONFIGURATION                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐ │
│   │ 1 │───▶│ 2 │───▶│ 3 │───▶│ 4 │───▶│ 5 │───▶│ 6 │───▶│ 7 │───▶│ 8 │ │
│   └───┘    └───┘    └───┘    └───┘    └───┘    └───┘    └───┘    └───┘ │
│                                                                         │
│   Réf.    Panneau   Dimens.  Chants  Perçage  Quinc.  Usinage  Finition│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

<table>
<tr>
<td width="50%">

**Configuration Pièces**
- Sélection panneau (catalogue fournisseurs)
- Dimensions sur-mesure avec validation
- Orientation du fil paramétrable
- Notes et instructions spéciales

</td>
<td width="50%">

**Placage de Chants**
- Interface visuelle 4 côtés cliquables
- ABS, mélamine, bois massif, aluminium
- Épaisseurs 0.4mm à 3mm
- Correspondance décor panneau

</td>
</tr>
<tr>
<td width="50%">

**Perçages & Assemblage**
- Tourillons, Clamex, Cabineo, Lamello
- Positionnement par glisser-déposer
- Grille magnétique 32mm
- Modèles prédéfinis (caisson, étagère)

</td>
<td width="50%">

**Quincaillerie Intégrée**
- BLUM (Clip Top, TANDEM, AVENTOS)
- HETTICH (Sensys, ArciTech)
- GRASS (Tiomos, Dynapro)
- Schémas perçage automatiques

</td>
</tr>
<tr>
<td width="50%">

**Usinages Spéciaux**
- Rainures, feuillures, embrèvements
- Profils de poignée intégrée
- Découpes et encoches
- Perçages spéciaux (câbles, aérations)

</td>
<td width="50%">

**Finitions**
- Laquage RAL/NCS
- Vernissage mat/satiné/brillant
- Teinte + vernis
- Une ou deux faces + chants

</td>
</tr>
</table>

### Visualisation Temps Réel

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─── CHANT HAUT (ABS 1mm) ───┐              │
│                    │                             │              │
│              ┌─────┤  ●────────●                 ├─────┐        │
│              │     │  │ Perçages│                │     │        │
│    CHANT     │     │  ●────────●                 │ CHANT        │
│    GAUCHE    │     │                             │ DROIT        │
│   (Méla 2mm) │     │        800 × 400 mm         │ (ABS 1mm)    │
│              │     │                             │     │        │
│              └─────┤      Chêne naturel 19mm     ├─────┘        │
│                    │                             │              │
│                    └─── CHANT BAS (sans) ────────┘              │
│                                                                 │
│   Légende:  ● Perçage Ø8   ○ Perçage Ø5   ═ Rainure            │
└─────────────────────────────────────────────────────────────────┘
```

- **Vue interactive** du panneau avec zones cliquables
- **Cotations automatiques** des dimensions
- **Perçages positionnés** visuellement
- **Zoom et déplacement** fluides
- **Grille magnétique** optionnelle

### Prix Instantané

Le prix est calculé et affiché **en temps réel** à chaque modification :

```
┌─────────────────────────────────┐
│  RÉCAPITULATIF PRIX             │
│  ───────────────────────────    │
│                                 │
│  Panneau (0.32 m²)      11.20 € │
│  Découpe                 2.50 € │
│  Chants (2.4 ml)         4.80 € │
│  Perçages (×8)           3.20 € │
│  Usinages                0.00 € │
│  Finition                0.00 € │
│  ───────────────────────────    │
│  TOTAL PIÈCE            21.70 € │
│  × 2 unités                     │
│  ═══════════════════════════    │
│  TOTAL                  43.40 € │
└─────────────────────────────────┘
```

### Gestion des Commandes

- **Panier multi-pièces** avec regroupement par projet
- **Validation technique** automatique avant commande
- **Historique complet** des commandes
- **Duplication** de commandes précédentes
- **Suivi statut** en temps réel

### Exports Professionnels

| Format | Usage |
|--------|-------|
| **PDF Devis** | Document commercial client |
| **PDF Fiche Débit** | Instructions production détaillées |
| **Excel/CSV** | Intégration ERP/comptabilité |
| **DXF** | Import machines CNC |
| **Étiquettes QR** | Traçabilité pièces |

### Administration

- **Catalogue panneaux** : CRUD, import CSV, gestion images
- **Catalogue chants** : association décors compatibles
- **Quincaillerie** : base de données avec schémas perçage
- **Tarification** : grilles de prix, remises clients
- **Utilisateurs** : rôles, permissions, comptes clients
- **Statistiques** : dashboard KPIs, analyse ventes

---

## Démonstration

<p align="center">
  <img src="docs/assets/demo-configurateur.gif" alt="Démonstration configurateur" width="800">
</p>

> **Accès démo** : [demo.panelpro.fr](https://demo.panelpro.fr)
> **Identifiants** : `demo@panelpro.fr` / `demo2024`

---

## Stack Technique

<table>
<tr>
<td align="center" width="96">
  <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
  <br>Next.js 14
</td>
<td align="center" width="96">
  <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
  <br>React 18
</td>
<td align="center" width="96">
  <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
  <br>TypeScript
</td>
<td align="center" width="96">
  <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
  <br>Tailwind CSS
</td>
<td align="center" width="96">
  <img src="https://skillicons.dev/icons?i=prisma" width="48" height="48" alt="Prisma" />
  <br>Prisma
</td>
<td align="center" width="96">
  <img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
  <br>PostgreSQL
</td>
</tr>
</table>

| Couche | Technologies |
|--------|--------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **Styling** | Tailwind CSS, shadcn/ui, Lucide Icons |
| **State** | Zustand, TanStack Query, React Hook Form |
| **Backend** | Next.js API Routes, tRPC |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | NextAuth.js |
| **Visualisation** | Konva.js / React-Konva |
| **Export** | React-PDF, ExcelJS |
| **Hosting** | Vercel, Railway |

---

## Installation

### Prérequis

- **Node.js** 20.x ou supérieur
- **pnpm** 8.x ou supérieur (recommandé)
- **PostgreSQL** 15.x ou Docker
- **Git**

### Installation rapide

```bash
# 1. Cloner le repository
git clone https://github.com/votre-org/panel-pro.git
cd panel-pro

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos paramètres

# 4. Lancer la base de données (Docker)
docker-compose up -d postgres

# 5. Appliquer les migrations
pnpm db:migrate

# 6. Charger les données de démonstration
pnpm db:seed

# 7. Lancer le serveur de développement
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

### Variables d'environnement

```env
# .env.local

# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/panelpro"

# Authentification
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-32-caracteres-minimum"

# Stockage images (optionnel)
CLOUDINARY_URL="cloudinary://..."

# Email (optionnel)
RESEND_API_KEY="re_..."
```

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur développement (hot reload) |
| `pnpm build` | Build production |
| `pnpm start` | Serveur production |
| `pnpm lint` | Vérification ESLint |
| `pnpm type-check` | Vérification TypeScript |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:e2e` | Tests E2E (Playwright) |
| `pnpm db:migrate` | Appliquer migrations Prisma |
| `pnpm db:studio` | Interface Prisma Studio |
| `pnpm db:seed` | Charger données démo |

---

## Structure du Projet

```
panel-pro/
│
├── app/                      # Next.js App Router
│   ├── (auth)/               # Routes authentification
│   ├── (dashboard)/          # Routes protégées client
│   │   ├── configurateur/    # Wizard configuration
│   │   ├── panier/           # Panier commande
│   │   ├── commandes/        # Historique commandes
│   │   └── profil/           # Profil utilisateur
│   ├── admin/                # Back-office administration
│   └── api/                  # API Routes (tRPC)
│
├── components/               # Composants React
│   ├── ui/                   # Composants UI génériques (shadcn)
│   ├── configurateur/        # Composants métier configurateur
│   ├── panier/               # Composants panier
│   └── admin/                # Composants administration
│
├── server/                   # Code serveur
│   ├── routers/              # Routers tRPC
│   └── services/             # Logique métier
│
├── stores/                   # Zustand stores
├── hooks/                    # Custom React hooks
├── lib/                      # Utilitaires et configuration
├── types/                    # Types TypeScript
├── prisma/                   # Schéma et migrations BDD
│
├── docs/                     # Documentation projet
├── public/                   # Assets statiques
└── tests/                    # Tests unitaires et E2E
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture.md](docs/Architecture.md) | Architecture technique détaillée |
| [UX.md](docs/UX.md) | Parcours utilisateur et expérience |
| [UI.md](docs/UI.md) | Design system et composants |
| [Etapes-Developpement.md](docs/Etapes-Developpement.md) | Roadmap et tâches développement |
| [API.md](docs/API.md) | Documentation API tRPC |
| [Database.md](docs/Database.md) | Schéma base de données |

---

## Déploiement

### Production (Vercel + Railway)

```bash
# 1. Configurer Vercel
vercel link

# 2. Configurer les variables d'environnement sur Vercel
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET

# 3. Déployer
vercel --prod
```

### Docker

```bash
# Build image
docker build -t panel-pro .

# Run container
docker run -p 3000:3000 --env-file .env.production panel-pro
```

---

## Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

### Workflow

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/ma-feature`)
3. **Commit** les changements (`git commit -m 'feat: ajout ma feature'`)
4. **Push** la branche (`git push origin feature/ma-feature`)
5. **Ouvrir** une Pull Request

### Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
- **Code** : ESLint + Prettier (config incluse)
- **Tests** : Requis pour nouvelles fonctionnalités

---

## Roadmap

- [x] Configurateur 8 étapes
- [x] Calcul prix temps réel
- [x] Gestion commandes
- [x] Export PDF/Excel
- [ ] Optimisation de découpe (calepinage)
- [ ] Visualisation 3D meubles
- [ ] Application mobile
- [ ] Intégration ERP (API)
- [ ] Export direct CNC (BXF)
- [ ] Module gestion stock

---

## Support

- **Documentation** : [docs.panelpro.fr](https://docs.panelpro.fr)
- **Email** : support@panelpro.fr
- **Issues** : [GitHub Issues](https://github.com/votre-org/panel-pro/issues)

---

## Licence

Ce logiciel est propriétaire. Tous droits réservés.
© 2024 La Manufacture de l'Agencement

---

<p align="center">
  <sub>Développé avec passion pour les professionnels du bois</sub>
</p>
