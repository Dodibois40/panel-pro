/**
 * Seed de la base de données
 * Exécuter avec: pnpm db:seed
 */
import { hash } from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILISATEURS
  // ═══════════════════════════════════════════════════════════════════════════

  const adminPassword = await hash('admin123', 12)
  const clientPassword = await hash('client123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@panelpro.fr' },
    update: {},
    create: {
      email: 'admin@panelpro.fr',
      passwordHash: adminPassword,
      name: 'Admin Panel Pro',
      role: 'ADMIN',
      company: 'Panel Pro',
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@test.fr' },
    update: {},
    create: {
      email: 'client@test.fr',
      passwordHash: clientPassword,
      name: 'Client Test',
      role: 'CLIENT',
      company: 'Menuiserie Test',
    },
  })

  console.log('✅ Utilisateurs créés:', { admin: admin.email, client: client.email })

  // ═══════════════════════════════════════════════════════════════════════════
  // PANNEAUX
  // ═══════════════════════════════════════════════════════════════════════════

  const panels = await Promise.all([
    prisma.supplierPanel.upsert({
      where: { reference: 'MEL-BLANC-18' },
      update: {},
      create: {
        reference: 'MEL-BLANC-18',
        name: 'Mélaminé Blanc 18mm',
        supplier: 'Egger',
        material: 'MELAMINE',
        thickness: 18,
        length: 2800,
        width: 2070,
        pricePerM2: 25.5,
        grainDirection: false,
        colorCode: '#FFFFFF',
      },
    }),
    prisma.supplierPanel.upsert({
      where: { reference: 'MEL-CHENE-18' },
      update: {},
      create: {
        reference: 'MEL-CHENE-18',
        name: 'Mélaminé Chêne Naturel 18mm',
        supplier: 'Egger',
        material: 'MELAMINE',
        thickness: 18,
        length: 2800,
        width: 2070,
        pricePerM2: 32.0,
        grainDirection: true,
        colorCode: '#C4A77D',
      },
    }),
    prisma.supplierPanel.upsert({
      where: { reference: 'MDF-19' },
      update: {},
      create: {
        reference: 'MDF-19',
        name: 'MDF Standard 19mm',
        supplier: 'Finsa',
        material: 'MDF',
        thickness: 19,
        length: 2800,
        width: 2070,
        pricePerM2: 18.0,
        grainDirection: false,
      },
    }),
    prisma.supplierPanel.upsert({
      where: { reference: 'STRAT-BLANC-19' },
      update: {},
      create: {
        reference: 'STRAT-BLANC-19',
        name: 'Stratifié Blanc Brillant 19mm',
        supplier: 'Polyrey',
        material: 'STRATIFIE',
        thickness: 19,
        length: 2800,
        width: 1300,
        pricePerM2: 45.0,
        grainDirection: false,
        colorCode: '#FAFAFA',
      },
    }),
  ])

  console.log('✅ Panneaux créés:', panels.length)

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANTS
  // ═══════════════════════════════════════════════════════════════════════════

  const edges = await Promise.all([
    prisma.edgeBanding.upsert({
      where: { reference: 'ABS-BLANC-23' },
      update: {},
      create: {
        reference: 'ABS-BLANC-23',
        name: 'Chant ABS Blanc 23mm',
        material: 'ABS',
        thickness: 1,
        width: 23,
        pricePerMeter: 0.85,
        colorCode: '#FFFFFF',
      },
    }),
    prisma.edgeBanding.upsert({
      where: { reference: 'ABS-CHENE-23' },
      update: {},
      create: {
        reference: 'ABS-CHENE-23',
        name: 'Chant ABS Chêne Naturel 23mm',
        material: 'ABS',
        thickness: 1,
        width: 23,
        pricePerMeter: 1.2,
        colorCode: '#C4A77D',
      },
    }),
    prisma.edgeBanding.upsert({
      where: { reference: 'ABS-LASER-BLANC-23' },
      update: {},
      create: {
        reference: 'ABS-LASER-BLANC-23',
        name: 'Chant ABS Laser Blanc 23mm',
        material: 'ABS_LASER',
        thickness: 0.8,
        width: 23,
        pricePerMeter: 1.5,
        colorCode: '#FFFFFF',
      },
    }),
  ])

  console.log('✅ Chants créés:', edges.length)

  // ═══════════════════════════════════════════════════════════════════════════
  // LIAISON PANNEAUX-CHANTS
  // ═══════════════════════════════════════════════════════════════════════════

  await prisma.supplierPanelEdge.upsert({
    where: {
      panelId_edgeId: {
        panelId: panels[0].id,
        edgeId: edges[0].id,
      },
    },
    update: {},
    create: {
      panelId: panels[0].id,
      edgeId: edges[0].id,
      isDefault: true,
    },
  })

  await prisma.supplierPanelEdge.upsert({
    where: {
      panelId_edgeId: {
        panelId: panels[1].id,
        edgeId: edges[1].id,
      },
    },
    update: {},
    create: {
      panelId: panels[1].id,
      edgeId: edges[1].id,
      isDefault: true,
    },
  })

  console.log('✅ Liaisons panneaux-chants créées')

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION TARIFS
  // ═══════════════════════════════════════════════════════════════════════════

  const pricingConfigs = [
    { key: 'COUPE_PANNEAU', value: 1.5, unit: '€/coupe', category: 'DECOUPE', description: 'Prix par coupe de panneau' },
    { key: 'COUPE_MINIMUM', value: 5, unit: '€', category: 'DECOUPE', description: 'Minimum facturation découpe' },
    { key: 'POSE_CHANT_ML', value: 2.0, unit: '€/ml', category: 'CHANT', description: 'Pose chant au mètre linéaire' },
    { key: 'POSE_CHANT_LASER_ML', value: 3.5, unit: '€/ml', category: 'CHANT', description: 'Pose chant laser au mètre linéaire' },
    { key: 'PERCAGE_UNITAIRE', value: 0.15, unit: '€/trou', category: 'PERCAGE', description: 'Perçage unitaire' },
    { key: 'PERCAGE_LIGNE_32', value: 2.0, unit: '€/ligne', category: 'PERCAGE', description: 'Perçage ligne système 32' },
    { key: 'RAINURE_ML', value: 3.0, unit: '€/ml', category: 'USINAGE', description: 'Rainure au mètre linéaire' },
    { key: 'FEUILLURE_ML', value: 4.0, unit: '€/ml', category: 'USINAGE', description: 'Feuillure au mètre linéaire' },
    { key: 'LIVRAISON_BASE', value: 35, unit: '€', category: 'LIVRAISON', description: 'Frais de livraison base' },
    { key: 'LIVRAISON_KM', value: 1.2, unit: '€/km', category: 'LIVRAISON', description: 'Supplément par km' },
  ]

  for (const config of pricingConfigs) {
    await prisma.pricingConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    })
  }

  console.log('✅ Configuration tarifs créée:', pricingConfigs.length)
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
