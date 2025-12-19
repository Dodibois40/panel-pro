# Workflow de Développement - Claude Code

## Introduction

Ce document définit le workflow de développement adapté aux capacités et limitations de Claude Code, l'IA qui développera l'intégralité de ce projet.

> **Objectif** : Maximiser la qualité du code produit en travaillant AVEC les forces de Claude Code et en contournant ses faiblesses.

---

## Auto-Évaluation Claude Code

### Forces

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CE QUE JE FAIS BIEN                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Code propre et structuré                                               │
│     → J'applique naturellement les bonnes pratiques                        │
│     → Mon code est lisible et maintenable                                  │
│                                                                             │
│  ✅ Maîtrise des technologies modernes                                     │
│     → Next.js 14, React 18, TypeScript 5                                   │
│     → Prisma, tRPC, Tailwind, shadcn/ui                                    │
│     → Patterns actuels (App Router, Server Components...)                  │
│                                                                             │
│  ✅ Cohérence et patterns                                                  │
│     → Je maintiens un style uniforme sur tout le projet                    │
│     → Je réutilise les patterns établis                                    │
│                                                                             │
│  ✅ Génération rapide                                                      │
│     → Scaffolding efficace de composants                                   │
│     → Création de structures répétitives                                   │
│                                                                             │
│  ✅ Refactoring                                                            │
│     → Je peux reprendre du code existant et l'améliorer                    │
│     → Détection de code dupliqué                                           │
│                                                                             │
│  ✅ Documentation                                                          │
│     → Commentaires pertinents                                              │
│     → Types TypeScript explicites                                          │
│                                                                             │
│  ✅ Gestion d'erreurs                                                      │
│     → Try/catch appropriés                                                 │
│     → Messages d'erreur clairs                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Faiblesses

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CE QUI ME POSE PROBLÈME                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ❌ Pas de rendu visuel                                                    │
│     → Je ne vois pas le résultat dans un navigateur                        │
│     → Je ne peux pas vérifier si l'UI est correcte visuellement            │
│     → SOLUTION : Tests, descriptions précises, validation utilisateur      │
│                                                                             │
│  ❌ Perte de contexte sur longues sessions                                 │
│     → Après beaucoup d'échanges, je peux oublier des détails               │
│     → SOLUTION : Fichiers courts, commits fréquents, TodoWrite             │
│                                                                             │
│  ❌ Erreurs sur fichiers longs (>300 lignes)                               │
│     → Plus le fichier est long, plus je risque des erreurs                 │
│     → SOLUTION : Découpage strict, 1 responsabilité par fichier            │
│                                                                             │
│  ❌ Doit relire avant de modifier                                          │
│     → Je dois TOUJOURS lire un fichier avant de l'éditer                   │
│     → SOLUTION : Structure claire, convention de nommage stricte           │
│                                                                             │
│  ❌ Pas d'exécution en temps réel                                          │
│     → Je ne peux pas lancer `npm run dev` et voir le résultat              │
│     → SOLUTION : L'utilisateur teste, je corrige                           │
│                                                                             │
│  ❌ Pas de debugger visuel                                                 │
│     → Je ne vois pas les erreurs console en direct                         │
│     → SOLUTION : Logs explicites, gestion d'erreurs robuste                │
│                                                                             │
│  ❌ Contexte limité par session                                            │
│     → Nouvelle session = contexte à reconstruire                           │
│     → SOLUTION : Documentation à jour, code auto-documenté                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Règles de Développement

### Règle 1 : Fichiers Courts

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TAILLE MAXIMALE DES FICHIERS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Composants React       │  150 lignes max    │  Si plus → découper         │
│  Pages Next.js          │  100 lignes max    │  Logique dans hooks/utils   │
│  Hooks personnalisés    │  80 lignes max     │  1 hook = 1 responsabilité  │
│  Services/Utils         │  200 lignes max    │  Découper par domaine       │
│  Routers tRPC           │  150 lignes max    │  1 router = 1 entité        │
│  Types/Interfaces       │  100 lignes max    │  Grouper par domaine        │
│  Tests                  │  200 lignes max    │  1 fichier test = 1 module  │
│                                                                             │
│  ⚠️  AU-DELÀ = REFACTORING OBLIGATOIRE                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pourquoi ?** Plus un fichier est long, plus j'ai de chances de :
- Oublier une partie du contexte
- Faire des erreurs d'édition
- Introduire des incohérences

### Règle 2 : Un Fichier = Une Responsabilité

```typescript
// ❌ MAUVAIS : Tout dans un fichier
// components/Panel.tsx (500 lignes)
export function PanelViewer() { /* 200 lignes */ }
export function PanelSelector() { /* 150 lignes */ }
export function PanelDetails() { /* 150 lignes */ }

// ✅ BON : Découpage strict
// components/panel/PanelViewer.tsx (150 lignes)
// components/panel/PanelSelector.tsx (120 lignes)
// components/panel/PanelDetails.tsx (100 lignes)
// components/panel/index.ts (exports)
```

### Règle 3 : Nommage Ultra-Explicite

```typescript
// ❌ MAUVAIS : Noms ambigus
const data = await fetch(...)
const items = data.map(...)
function handle() { }
const val = calculate(x, y)

// ✅ BON : Noms explicites
const panelsCatalog = await fetchPanelsCatalog()
const activePanels = panelsCatalog.filter(p => p.isActive)
function handlePanelSelection(panelId: string) { }
const edgingPriceTotal = calculateEdgingPrice(length, width)
```

**Convention de nommage :**

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `PanelViewer`, `EdgeSelector` |
| Hooks | camelCase + use | `usePanelConfig`, `usePriceCalculation` |
| Utils/Services | camelCase | `calculatePrice`, `validateDimensions` |
| Types | PascalCase | `PanelConfig`, `EdgePosition` |
| Constantes | SCREAMING_SNAKE | `MAX_PANEL_WIDTH`, `DEFAULT_MARGIN` |
| Fichiers composants | PascalCase.tsx | `PanelViewer.tsx` |
| Fichiers utils | camelCase.ts | `priceCalculation.ts` |

### Règle 4 : Toujours Relire Avant Modifier

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AVANT CHAQUE MODIFICATION DE FICHIER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LIRE le fichier complet avec l'outil Read                              │
│  2. COMPRENDRE la structure actuelle                                        │
│  3. IDENTIFIER l'endroit exact de modification                              │
│  4. MODIFIER avec précision                                                │
│  5. VÉRIFIER la cohérence post-modification                                │
│                                                                             │
│  ⚠️  JAMAIS de modification "à l'aveugle"                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Règle 5 : Commits Atomiques et Fréquents

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STRATÉGIE DE COMMITS                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Fréquence : 1 commit par fonctionnalité unitaire                          │
│                                                                             │
│  ✅ BON                              ❌ MAUVAIS                             │
│  ─────────────────────────           ─────────────────────────              │
│  "feat: add PanelViewer component"   "add components"                       │
│  "feat: add edge selection logic"    "WIP"                                  │
│  "fix: correct price calculation"    "fixes"                                │
│  "refactor: extract usePrice hook"   "update files"                         │
│                                                                             │
│  Format : <type>: <description courte>                                     │
│                                                                             │
│  Types :                                                                   │
│  ├── feat     : nouvelle fonctionnalité                                    │
│  ├── fix      : correction de bug                                          │
│  ├── refactor : refactoring sans changement fonctionnel                    │
│  ├── style    : formatage, pas de changement de code                       │
│  ├── docs     : documentation                                              │
│  ├── test     : ajout/modification de tests                                │
│  └── chore    : maintenance, dépendances                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Règle 6 : Tests Systématiques

Puisque je ne vois pas le rendu visuel, les tests sont **critiques** :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STRATÉGIE DE TESTS                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRIORITÉ 1 : Tests unitaires (Vitest)                                     │
│  ├── Services de calcul (prix, validations)                                │
│  ├── Helpers et utilitaires                                                │
│  ├── Schémas de validation Zod                                             │
│  └── Logique métier pure                                                   │
│                                                                             │
│  PRIORITÉ 2 : Tests de composants (Testing Library)                        │
│  ├── Comportement des formulaires                                          │
│  ├── États des composants                                                  │
│  └── Interactions utilisateur simulées                                     │
│                                                                             │
│  PRIORITÉ 3 : Tests E2E (Playwright)                                       │
│  ├── Parcours configurateur complet                                        │
│  ├── Création de commande                                                  │
│  └── Flux admin                                                            │
│                                                                             │
│  💡 Les tests compensent mon incapacité à voir l'UI                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Structure de Projet Optimisée

### Architecture Fichiers

```
panel-pro/
│
├── app/                          # Pages Next.js (COURTES)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # < 50 lignes, délègue aux composants
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── configurateur/
│   │   │   ├── page.tsx          # < 50 lignes
│   │   │   └── [step]/
│   │   │       └── page.tsx      # < 80 lignes
│   │   ├── panier/
│   │   │   └── page.tsx
│   │   └── commandes/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   └── admin/
│       └── ...
│
├── components/                   # Composants (150 lignes MAX)
│   │
│   ├── ui/                       # shadcn/ui (ne pas toucher)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # ~80 lignes
│   │   ├── Sidebar.tsx           # ~100 lignes
│   │   ├── Footer.tsx            # ~50 lignes
│   │   └── index.ts
│   │
│   ├── configurateur/            # Composants configurateur
│   │   ├── PanelViewer/          # Composant complexe → sous-dossier
│   │   │   ├── PanelViewer.tsx   # Composant principal ~120 lignes
│   │   │   ├── PanelCanvas.tsx   # Canvas de dessin ~100 lignes
│   │   │   ├── EdgeZone.tsx      # Zone chant cliquable ~60 lignes
│   │   │   ├── DrillPoint.tsx    # Point de perçage ~50 lignes
│   │   │   ├── usePanelViewer.ts # Hook logique ~80 lignes
│   │   │   ├── types.ts          # Types locaux ~40 lignes
│   │   │   └── index.ts          # Exports
│   │   │
│   │   ├── PanelSelector/
│   │   │   ├── PanelSelector.tsx
│   │   │   ├── PanelCard.tsx
│   │   │   ├── PanelFilters.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── EdgeSelector/
│   │   │   └── ...
│   │   │
│   │   ├── StepWizard/
│   │   │   ├── StepWizard.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── StepNavigation.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── PriceSummary/
│   │   │   └── ...
│   │   │
│   │   └── index.ts              # Export tous les composants
│   │
│   ├── panier/
│   │   └── ...
│   │
│   ├── commandes/
│   │   └── ...
│   │
│   └── admin/
│       └── ...
│
├── hooks/                        # Hooks personnalisés (80 lignes MAX)
│   ├── useConfigurator.ts        # État global configurateur
│   ├── usePriceCalculation.ts    # Calcul prix temps réel
│   ├── usePanelCatalog.ts        # Données catalogue panneaux
│   ├── useEdgeCatalog.ts         # Données catalogue chants
│   ├── useOrder.ts               # Gestion commande
│   └── index.ts
│
├── stores/                       # Zustand stores (100 lignes MAX)
│   ├── configurateur.store.ts    # État wizard
│   ├── panier.store.ts           # État panier
│   ├── ui.store.ts               # État UI (modals, sidebar...)
│   └── index.ts
│
├── services/                     # Logique métier (200 lignes MAX)
│   ├── price/
│   │   ├── calculateMaterial.ts  # ~50 lignes
│   │   ├── calculateCutting.ts   # ~60 lignes
│   │   ├── calculateEdging.ts    # ~80 lignes
│   │   ├── calculateDrilling.ts  # ~70 lignes
│   │   ├── calculateMachining.ts # ~70 lignes
│   │   ├── calculateFinishing.ts # ~60 lignes
│   │   ├── calculateTotal.ts     # ~100 lignes (orchestration)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── validation/
│   │   ├── validateDimensions.ts
│   │   ├── validateDrillings.ts
│   │   ├── validateOrder.ts
│   │   └── index.ts
│   │
│   ├── export/
│   │   ├── generatePDF.ts
│   │   ├── generateExcel.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── server/                       # Backend tRPC
│   ├── trpc.ts                   # Config tRPC ~50 lignes
│   ├── routers/
│   │   ├── panel.router.ts       # ~120 lignes
│   │   ├── edge.router.ts        # ~100 lignes
│   │   ├── hardware.router.ts    # ~100 lignes
│   │   ├── order.router.ts       # ~150 lignes
│   │   ├── pricing.router.ts     # ~120 lignes
│   │   ├── user.router.ts        # ~100 lignes
│   │   ├── admin.router.ts       # ~100 lignes
│   │   └── _app.ts               # Router principal ~30 lignes
│   │
│   └── services/                 # Services backend
│       ├── order.service.ts
│       ├── pricing.service.ts
│       └── export.service.ts
│
├── lib/                          # Utilitaires (fichiers courts)
│   ├── prisma.ts                 # ~20 lignes
│   ├── trpc.ts                   # ~30 lignes
│   ├── auth.ts                   # ~50 lignes
│   ├── utils.ts                  # ~50 lignes (cn, formatters...)
│   └── constants.ts              # ~50 lignes
│
├── types/                        # Types TypeScript (100 lignes MAX)
│   ├── panel.types.ts
│   ├── edge.types.ts
│   ├── order.types.ts
│   ├── pricing.types.ts
│   └── index.ts
│
├── schemas/                      # Schémas Zod (séparés des types)
│   ├── panel.schema.ts
│   ├── edge.schema.ts
│   ├── order.schema.ts
│   └── index.ts
│
└── __tests__/                    # Tests
    ├── unit/
    │   ├── services/
    │   │   └── price/
    │   │       ├── calculateMaterial.test.ts
    │   │       ├── calculateEdging.test.ts
    │   │       └── ...
    │   └── utils/
    │
    ├── components/
    │   └── configurateur/
    │       ├── PanelViewer.test.tsx
    │       └── ...
    │
    └── e2e/
        ├── configurateur.spec.ts
        ├── order.spec.ts
        └── admin.spec.ts
```

---

## Workflow de Développement

### Phase de Développement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW PAR FONCTIONNALITÉ                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PLANIFIER                                                              │
│     ├── Lire les specs dans la documentation                               │
│     ├── Identifier les fichiers à créer/modifier                           │
│     ├── Créer les todos avec TodoWrite                                     │
│     └── Estimer la complexité                                              │
│                                                                             │
│  2. CRÉER LES TYPES                                                        │
│     ├── Définir les interfaces TypeScript                                  │
│     ├── Créer les schémas Zod si nécessaire                                │
│     └── Commit: "feat: add types for [feature]"                            │
│                                                                             │
│  3. CRÉER LES TESTS (TDD si applicable)                                    │
│     ├── Écrire les tests unitaires                                         │
│     ├── Définir les comportements attendus                                 │
│     └── Commit: "test: add tests for [feature]"                            │
│                                                                             │
│  4. IMPLÉMENTER                                                            │
│     ├── Coder la fonctionnalité                                            │
│     ├── Respecter les limites de taille                                    │
│     ├── Commits fréquents et atomiques                                     │
│     └── Commit: "feat: implement [feature]"                                │
│                                                                             │
│  5. VALIDER                                                                │
│     ├── Lancer les tests: pnpm test                                        │
│     ├── Vérifier les types: pnpm type-check                                │
│     ├── Vérifier le lint: pnpm lint                                        │
│     └── Demander validation visuelle à l'utilisateur si UI                 │
│                                                                             │
│  6. DOCUMENTER                                                             │
│     ├── Ajouter commentaires si logique complexe                           │
│     ├── Mettre à jour la doc si nécessaire                                 │
│     └── Commit: "docs: update [doc]"                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Checklist Avant Chaque Session

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CHECKLIST DÉBUT DE SESSION                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  □ Lire le README pour rappel du contexte                                  │
│  □ Consulter les todos en cours (TodoWrite)                                │
│  □ Vérifier les derniers commits (git log)                                 │
│  □ Identifier les fichiers modifiés récemment                              │
│  □ Relire les fichiers concernés par la tâche                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Points de Validation Utilisateur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  QUAND DEMANDER À L'UTILISATEUR DE TESTER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TOUJOURS demander validation après :                                      │
│                                                                             │
│  ✓ Création d'un nouveau composant UI                                      │
│  ✓ Modification de styles/layout                                           │
│  ✓ Ajout d'animations ou transitions                                       │
│  ✓ Implémentation d'interactions (drag & drop, click...)                   │
│  ✓ Formulaires complexes                                                   │
│  ✓ Responsive design                                                       │
│  ✓ Intégration avec API (vérifier les données affichées)                   │
│                                                                             │
│  Format de demande :                                                       │
│  "Peux-tu lancer `pnpm dev` et vérifier [composant] sur [page] ?          │
│   Confirme que [comportement attendu]."                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Gestion des Erreurs et Debugging

### Stratégie de Logs

```typescript
// lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NODE_ENV === 'development'

export function log(level: LogLevel, message: string, data?: unknown) {
  if (!isDev && level === 'debug') return

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  switch (level) {
    case 'debug':
      console.log(`${prefix} ${message}`, data ?? '')
      break
    case 'info':
      console.info(`${prefix} ${message}`, data ?? '')
      break
    case 'warn':
      console.warn(`${prefix} ${message}`, data ?? '')
      break
    case 'error':
      console.error(`${prefix} ${message}`, data ?? '')
      break
  }
}

// Usage
log('debug', 'Calculating price', { length: 800, width: 400 })
log('error', 'Failed to fetch panels', error)
```

### Gestion d'Erreurs Standard

```typescript
// Toujours utiliser des try/catch explicites avec messages clairs

// ❌ MAUVAIS
try {
  await saveOrder(order)
} catch (e) {
  throw e
}

// ✅ BON
try {
  await saveOrder(order)
} catch (error) {
  log('error', 'Failed to save order', { orderId: order.id, error })
  throw new Error(`Impossible de sauvegarder la commande ${order.id}: ${error.message}`)
}
```

---

## Communication avec l'Utilisateur

### Quand Demander de l'Aide

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SITUATIONS OÙ JE DOIS DEMANDER À L'UTILISATEUR                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. VALIDATION VISUELLE                                                    │
│     "Peux-tu vérifier que le composant s'affiche correctement ?"           │
│                                                                             │
│  2. CHOIX DESIGN/UX                                                        │
│     "Je propose [option A] ou [option B], quelle préférence ?"             │
│                                                                             │
│  3. ERREUR INEXPLICABLE                                                    │
│     "J'obtiens cette erreur, peux-tu me donner le message exact ?"         │
│                                                                             │
│  4. DONNÉES RÉELLES                                                        │
│     "Peux-tu me fournir un exemple de [données] réelles ?"                 │
│                                                                             │
│  5. ACCÈS EXTERNE                                                          │
│     "Peux-tu vérifier [service externe] et me confirmer [info] ?"          │
│                                                                             │
│  6. AMBIGUÏTÉ SPECS                                                        │
│     "La spec n'est pas claire sur [point], que préfères-tu ?"              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Format de Rapport de Progression

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RAPPORT DE FIN DE TÂCHE                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ FAIT                                                                   │
│  ├── [liste des fichiers créés/modifiés]                                   │
│  └── [fonctionnalités implémentées]                                        │
│                                                                             │
│  🧪 À TESTER                                                               │
│  ├── [commande pour lancer l'app]                                          │
│  └── [ce qu'il faut vérifier]                                              │
│                                                                             │
│  ⏭️ PROCHAINE ÉTAPE                                                        │
│  └── [ce qui reste à faire]                                                │
│                                                                             │
│  ⚠️ POINTS D'ATTENTION (si applicable)                                    │
│  └── [problèmes potentiels, décisions prises]                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Récapitulatif des Règles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LES 10 COMMANDEMENTS DU DEV CLAUDE CODE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Tu garderas tes fichiers courts (< 150-200 lignes)                     │
│                                                                             │
│  2. Tu reliras TOUJOURS avant de modifier                                  │
│                                                                             │
│  3. Tu committeras fréquemment et atomiquement                             │
│                                                                             │
│  4. Tu écriras des tests pour tout code critique                           │
│                                                                             │
│  5. Tu nommeras tes variables/fonctions explicitement                      │
│                                                                             │
│  6. Tu demanderas validation visuelle à l'utilisateur                      │
│                                                                             │
│  7. Tu utiliseras TodoWrite pour tracker ta progression                    │
│                                                                             │
│  8. Tu documenteras la logique complexe                                    │
│                                                                             │
│  9. Tu géreras les erreurs avec des messages clairs                        │
│                                                                             │
│  10. Tu admettras tes limitations et demanderas de l'aide                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Métriques de Qualité

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Taille fichiers | < 200 lignes | `find . -name "*.ts*" -exec wc -l {} \;` |
| Couverture tests | > 80% services | `pnpm test:coverage` |
| Erreurs TypeScript | 0 | `pnpm type-check` |
| Erreurs ESLint | 0 | `pnpm lint` |
| Build success | 100% | `pnpm build` |
