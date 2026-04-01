'use client'

import { useEffect } from 'react'
import { use } from 'react'
import { PageHeader } from '@/shared/components/ui'
import { ProyectoWizard }         from '@/views/Proyectos/wizard/ProyectoWizard'
import { useWizardStore }          from '@/modules/proyectos'
import { useProyectosController }  from '@/modules/proyectos'

export default function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const numId  = parseInt(id)

  const { _getById } = useProyectosController()
  const { loadFromProyecto, setEditingId } = useWizardStore()

  useEffect(() => {
    _getById(numId).then(p => {
      if (!p) return
      setEditingId(numId)
      loadFromProyecto(
        {
          requerimiento:   p.requerimiento,
          nombreProyecto:  p.nombreProyecto,
          objetivo:        p.objetivo        ?? '',
          fechaEstimacion: p.fechaEstimacion ? p.fechaEstimacion.slice(0, 10) : '',
          fechaEjecucion:  p.fechaEjecucion  ? p.fechaEjecucion.slice(0, 10)  : '',
          estimadoPor:     p.estimadoPor     ?? '',
          supervisadoPor:  p.supervisadoPor  ?? '',
        },
        p.actividades.map(a => ({
          nombre:      a.nombre,
          proceso:     a.proceso     ?? undefined,
          bloque:      a.bloque      ?? undefined,
          jornadas:    a.jornadas    ?? undefined,
          fechaInicio: a.fechaInicio ? a.fechaInicio.slice(0, 10) : undefined,
          fechaFin:    a.fechaFin    ? a.fechaFin.slice(0, 10)    : undefined,
          orden:       a.orden,
          componentes: a.componentes.map(c => ({
            componenteId:     c.componenteId,
            nombreComponente: c.nombreComponente,
            grupoNombre:      c.grupoNombre,
            lenguajeNombre:   c.lenguajeNombre,
            tecnologiaNombre: c.tecnologiaNombre,
            cantidad:         c.cantidad,
            reutilizar:       c.reutilizar,
            tiempoBaseMin:    c.tiempoBaseMin,
            tiempoCopilotMin: c.tiempoCopilotMin,
            tiempoTmeMin:     c.tiempoTmeMin,
          })),
        }))
      )
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numId])

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Editar proyecto"
        subtitle="Modifica los datos, actividades y componentes"
      />
      <ProyectoWizard editingId={numId} />
    </div>
  )
}
