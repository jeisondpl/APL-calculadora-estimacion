/**
 * Validación post-seed: verifica integridad de datos cargados.
 * Ejecutar: pnpm db:validate
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validate() {
  console.log('🔍 Validando datos cargados...\n')

  const totalComponentes   = await prisma.componente.count()
  const totalVariables     = await prisma.variableComponente.count()
  const sinVariables       = await prisma.componente.count({ where: { variables: { none: {} } } })
  const tiemposCero        = await prisma.variableComponente.count({ where: { tiempoBaseMin: 0 } })
  const totalEstimaciones  = await prisma.estimacion.count()

  // Conteo por tecnología
  const porTecnologia = await prisma.tecnologia.findMany({
    include: { _count: { select: { componentes: true } } },
    orderBy: { componentes: { _count: 'desc' } },
  })

  // Conteo por grupo
  const porGrupo = await prisma.grupo.findMany({
    include: { _count: { select: { componentes: true } } },
    orderBy: { componentes: { _count: 'desc' } },
  })

  console.log('─── Resumen general ───────────────────────────────')
  console.log(`  Componentes:         ${totalComponentes}`)
  console.log(`  Variables:           ${totalVariables}`)
  console.log(`  Estimaciones:        ${totalEstimaciones}`)
  console.log(`  Sin variables:       ${sinVariables}  ${sinVariables > 0 ? '⚠️' : '✓'}`)
  console.log(`  Variables tiempo=0:  ${tiemposCero}  ${tiemposCero > 0 ? '⚠️ (revisar #REF! en CSV)' : '✓'}`)

  console.log('\n─── Por tecnología ────────────────────────────────')
  for (const t of porTecnologia) {
    console.log(`  ${t.nombre.padEnd(20)} → ${t._count.componentes} componentes`)
  }

  console.log('\n─── Por grupo ─────────────────────────────────────')
  for (const g of porGrupo) {
    console.log(`  ${g.nombre.padEnd(20)} → ${g._count.componentes} componentes`)
  }

  if (sinVariables > 0 || tiemposCero > 0) {
    console.log('\n⚠️  Hay registros a revisar. Ver detalle arriba.')
  } else {
    console.log('\n✅ Datos válidos — todo correcto.')
  }

  await prisma.$disconnect()
}

validate().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
