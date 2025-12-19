# UX Design - Configurateur Débit Panneaux

## Principes Fondamentaux

### 1. Progression Guidée
L'utilisateur est accompagné étape par étape à travers un **wizard de configuration** clair et intuitif. Chaque étape a un objectif unique et bien défini.

### 2. Prix Temps Réel
Le prix est **constamment visible** et se met à jour instantanément à chaque modification. L'utilisateur comprend immédiatement l'impact de ses choix.

### 3. Visualisation Interactive
Le panneau est représenté **graphiquement** avec des zones cliquables. L'utilisateur voit ce qu'il configure.

### 4. Tolérance à l'Erreur
L'utilisateur peut **revenir en arrière**, modifier ses choix, et ne perdre jamais son travail.

---

## Personas

### Persona 1 : L'Agenceur Professionnel

| Attribut | Description |
|----------|-------------|
| **Nom** | Marc, 45 ans |
| **Métier** | Responsable technique chez un agenceur |
| **Objectif** | Commander rapidement des pièces pour ses chantiers |
| **Frustrations** | Erreurs de communication, devis tardifs |
| **Besoins** | Interface rapide, export PDF, historique commandes |

### Persona 2 : L'Ébéniste Indépendant

| Attribut | Description |
|----------|-------------|
| **Nom** | Sophie, 35 ans |
| **Métier** | Ébéniste à son compte |
| **Objectif** | Configurer des pièces complexes avec précision |
| **Frustrations** | Interfaces trop simplistes, manque d'options |
| **Besoins** | Configuration détaillée, visualisation précise |

### Persona 3 : L'Architecte d'Intérieur

| Attribut | Description |
|----------|-------------|
| **Nom** | Thomas, 30 ans |
| **Métier** | Architecte d'intérieur en agence |
| **Objectif** | Obtenir des devis rapides pour ses clients |
| **Frustrations** | Processus de commande trop technique |
| **Besoins** | Interface visuelle, devis pro PDF |

---

## Parcours Utilisateur Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PARCOURS CONFIGURATEUR                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ LOGIN   │───▶│ TABLEAU │───▶│ NOUVELLE│───▶│ WIZARD  │
    │         │    │ DE BORD │    │COMMANDE │    │ CONFIG  │
    └─────────┘    └─────────┘    └─────────┘    └────┬────┘
                                                      │
    ┌─────────────────────────────────────────────────┼─────────────────────┐
    │                     8 ÉTAPES DU WIZARD                                │
    │  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐             │
    │  │ 1 │─▶│ 2 │─▶│ 3 │─▶│ 4 │─▶│ 5 │─▶│ 6 │─▶│ 7 │─▶│ 8 │             │
    │  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘             │
    │  Ident. Panneau Dimens. Chants Perçage Quinc. Usinage Finition      │
    └─────────────────────────────────────────────────┼─────────────────────┘
                                                      │
                                                      ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ AJOUTER │───▶│ PANIER  │───▶│VALIDATION│───▶│CONFIRMA-│
    │AU PANIER│    │         │    │COMMANDE  │    │  TION   │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## Détail des 8 Étapes du Wizard

### Étape 1 : Identification de la Pièce

**Objectif** : Nommer et quantifier la pièce

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| Référence | Texte | Oui | Nom unique de la pièce (ex: MEUBLE-01-COTE-G) |
| Quantité | Nombre | Oui | Nombre de pièces identiques (min: 1) |
| Notes | Texte long | Non | Instructions spéciales |

**UX Notes** :
- Suggestion automatique de référence basée sur le projet
- Bouton "Dupliquer une pièce existante" pour gagner du temps
- Aide contextuelle expliquant les conventions de nommage

---

### Étape 2 : Sélection du Panneau

**Objectif** : Choisir le panneau source dans le catalogue

**Fonctionnalités** :
- Recherche textuelle (nom, référence, fournisseur)
- Filtres combinables :
  - Matière (mélaminé, MDF, stratifié, plaqué)
  - Épaisseur (3mm → 40mm)
  - Fournisseur
  - Prix (fourchette)
- Affichage grille ou liste
- Aperçu visuel du décor
- Indicateur de stock

**UX Notes** :
- Panneaux récemment utilisés en premier
- Favoris personnels
- Comparaison de panneaux (jusqu'à 3)

---

### Étape 3 : Dimensions de Découpe

**Objectif** : Définir les dimensions finies de la pièce

| Champ | Type | Validation |
|-------|------|------------|
| Longueur | Nombre (mm) | 10 - dimension max panneau |
| Largeur | Nombre (mm) | 10 - dimension max panneau |
| Sens du fil | Radio | Longueur / Largeur / Sans importance |

**Validations automatiques** :
- Dimensions dans les limites du panneau source
- Avertissement si proche des limites
- Calcul automatique de la surface

**UX Notes** :
- Visualisation du panneau avec la pièce positionnée
- Indication du taux de chute
- Suggestion d'optimisation si plusieurs pièces similaires

---

### Étape 4 : Configuration des Chants

**Objectif** : Définir le placage de chaque chant

**Interface** :
```
         ┌─────── HAUT ───────┐
         │                    │
         │                    │
    G    │                    │    D
    A    │     PANNEAU        │    R
    U    │     (Vue dessus)   │    O
    C    │                    │    I
    H    │                    │    T
    E    │                    │    E
         │                    │
         └─────── BAS ────────┘
```

**Pour chaque chant (clic pour activer)** :
- Matière : ABS, mélamine, bois massif, alu
- Épaisseur : 0.4mm, 1mm, 2mm, 3mm
- Décor : Catalogue avec correspondance panneau

**UX Notes** :
- Code couleur visuel sur le schéma
- Option "Appliquer à tous" pour uniformiser
- Suggestion automatique du chant assorti au panneau
- Affichage du prix chant par chant

---

### Étape 5 : Perçages d'Assemblage

**Objectif** : Définir les perçages pour l'assemblage entre pièces

**Types disponibles** :

| Type | Diamètre | Position | Profondeur |
|------|----------|----------|------------|
| Tourillon face | Ø8mm | Face dessus/dessous | 12-15mm |
| Tourillon chant | Ø8mm | Chant | 30-35mm |
| Clamex P | Ø20mm | Face + fraisage | Selon modèle |
| Cabineo | Spécifique | Face/Chant | Selon modèle |
| Lamello | Rainure | Chant | 4mm |
| Vissage face | Ø4mm | Face | Traversant |
| Avant-trou chant | Ø3mm | Chant | 25-30mm |

**Interface** :
- Glisser-déposer les perçages sur le panneau
- OU saisie des coordonnées X/Y
- Grille magnétique optionnelle (32mm standard)
- Cotation automatique

**UX Notes** :
- Modèles prédéfinis (assemblage étagère, caisson, etc.)
- Détection de collision entre perçages
- Copie symétrique pour pièces miroir

---

### Étape 6 : Quincaillerie

**Objectif** : Configurer les perçages pour la quincaillerie de meubles

**Marques supportées** :
- **BLUM** : Clip Top, TANDEM, MOVENTO, AVENTOS
- **HETTICH** : Sensys, ArciTech, InnoTech
- **GRASS** : Tiomos, Dynapro

**Workflow** :
1. Sélection de la marque
2. Choix de la catégorie (charnière, coulisse, relevable)
3. Sélection du modèle précis
4. Positionnement sur le panneau (zones prédéfinies ou libre)

**UX Notes** :
- Schémas de perçage automatiques selon le modèle
- Vérification épaisseur panneau compatible
- Assistant de positionnement (cotes standards)

---

### Étape 7 : Usinages Spéciaux

**Objectif** : Ajouter des usinages complexes

**Types disponibles** :

| Type | Description | Paramètres |
|------|-------------|------------|
| Défonçage | Rainures, feuillures, embrèvements | Largeur, profondeur, position |
| Profil | Poignée intégrée, gorges | Type profil, longueur, position |
| Découpes | Encoches, arrondis, formes | Dimensions, rayon, position |
| Perçages spéciaux | Passage câbles, aérations | Diamètre, position |

**Interface** :
- Dessin sur le panneau avec outils géométriques
- Saisie paramétrique
- Bibliothèque d'usinages prédéfinis

**UX Notes** :
- Option "Pas d'usinage" pour passer rapidement
- Avertissement si usinage proche des bords
- Aperçu en coupe pour les rainures/feuillures

---

### Étape 8 : Finition

**Objectif** : Définir les traitements de surface (panneaux bruts uniquement)

**Applicable si** : Panneau = MDF ou plaqué bois

**Options** :

| Type | Sous-options |
|------|--------------|
| Laquage | Teinte RAL/NCS + Finition (mat/satiné/brillant) |
| Vernissage | Incolore + Finition (mat/satiné/brillant) |
| Teinte + Vernis | Teinte bois + Protection |

**Faces à traiter** :
- Une face
- Deux faces
- Deux faces + chants

**UX Notes** :
- Aperçu visuel de la teinte sélectionnée
- Nuancier RAL/NCS avec recherche
- Calcul automatique de la surface à traiter
- Option "Pas de finition" toujours disponible

---

## États et Feedback

### Indicateurs de Progression

```
┌─────────────────────────────────────────────────────────────────┐
│  ● ● ● ○ ○ ○ ○ ○                                                │
│  Étape 3/8 : Dimensions                              Prix: 45€  │
└─────────────────────────────────────────────────────────────────┘
```

### Validations en Temps Réel

| État | Couleur | Action |
|------|---------|--------|
| Valide | Vert | Passage à l'étape suivante autorisé |
| Avertissement | Orange | Passage possible avec confirmation |
| Erreur | Rouge | Correction obligatoire |

### Messages d'Aide Contextuels

- **Info** : Explication du champ survolé
- **Conseil** : Suggestion d'optimisation
- **Alerte** : Problème potentiel à vérifier

---

## Accessibilité

### Standards WCAG 2.1 AA

- Navigation clavier complète
- Labels ARIA sur tous les contrôles
- Contraste minimum 4.5:1
- Focus visible sur tous les éléments interactifs
- Messages d'erreur liés aux champs

### Responsive Design

| Breakpoint | Adaptation |
|------------|------------|
| Desktop (>1024px) | Interface complète, visualiseur large |
| Tablette (768-1024px) | Visualiseur en haut, formulaire en bas |
| Mobile (<768px) | Wizard vertical, visualiseur simplifié |

---

## Gestion des Erreurs

### Prévention

- Validation en temps réel des champs
- Désactivation des options incompatibles
- Avertissements avant actions destructives

### Récupération

- Sauvegarde automatique à chaque étape
- Brouillons récupérables
- Historique des modifications (undo/redo)

### Communication

- Messages d'erreur clairs et actionnables
- Suggestion de correction quand possible
- Contact support accessible

---

## Micro-interactions

| Action | Feedback |
|--------|----------|
| Ajout au panier | Animation de confirmation + mise à jour compteur |
| Calcul prix | Loader subtil puis mise à jour fluide |
| Sélection chant | Highlight visuel + son optionnel |
| Erreur validation | Shake du champ + message |
| Sauvegarde | Toast de confirmation discret |

---

## Métriques UX à Suivre

| Métrique | Objectif |
|----------|----------|
| Temps moyen configuration pièce | < 3 minutes |
| Taux d'abandon wizard | < 20% |
| Taux de retour en arrière | < 30% |
| NPS (Net Promoter Score) | > 40 |
| Tickets support configuration | < 5% des commandes |
