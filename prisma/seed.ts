import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const PASS   = 'Indra2025!'

async function main() {
  // ── Roles ──────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.rol.upsert({ where: { nombre: 'SUPERUSUARIO'  }, update: {}, create: { nombre: 'SUPERUSUARIO'  } }),
    prisma.rol.upsert({ where: { nombre: 'PRODUCT_OWNER' }, update: {}, create: { nombre: 'PRODUCT_OWNER' } }),
    prisma.rol.upsert({ where: { nombre: 'DESARROLLADOR' }, update: {}, create: { nombre: 'DESARROLLADOR' } }),
    prisma.rol.upsert({ where: { nombre: 'QA'            }, update: {}, create: { nombre: 'QA'            } }),
  ])

  const [superusuario, productOwner, desarrollador, qa] = roles
  const hash = await bcrypt.hash(PASS, 12)

  const usuarios = [
    // 1 Super Admin
    { nombre: 'Administrador Sistema',       email: 'admin@indra.com',  rolId: superusuario.id  },
    // 1 Product Owner
    { nombre: 'Rodriguez Martinez, John Eder', email: 'po@indra.com',   rolId: productOwner.id  },
    // 5 Desarrolladores
    { nombre: 'Fernando Andrés Herdoíza Vivar',  email: 'dev1@indra.com', rolId: desarrollador.id },
    { nombre: 'Duvan Camilo García Panqueva',     email: 'dev2@indra.com', rolId: desarrollador.id },
    { nombre: 'Henry Antonio Cabarcas Granados',  email: 'dev3@indra.com', rolId: desarrollador.id },
    { nombre: 'Jeison Antonio Díaz Palmera',      email: 'dev4@indra.com', rolId: desarrollador.id },
    { nombre: 'Lopez Moreno, Juan Sebastian',     email: 'dev5@indra.com', rolId: desarrollador.id },
    // 3 QA
    { nombre: 'Velasco Lizarazo, Diana Marcela',  email: 'qa1@indra.com',  rolId: qa.id            },
    { nombre: 'QA Analista 2',                    email: 'qa2@indra.com',  rolId: qa.id            },
    { nombre: 'QA Analista 3',                    email: 'qa3@indra.com',  rolId: qa.id            },
  ]

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where:  { email: u.email },
      update: { nombre: u.nombre, rolId: u.rolId, passwordHash: hash },
      create: { ...u, passwordHash: hash },
    })
    console.log(`✓ ${u.email}  [${roles.find(r => r.id === u.rolId)?.nombre}]`)
  }

  console.log('\n✅ Seed completado — 4 roles, 10 usuarios')
  console.log(`   Contraseña de todos: ${PASS}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
