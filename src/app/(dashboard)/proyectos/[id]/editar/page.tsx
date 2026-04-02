'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { PageHeader } from '@/shared/components/ui'
import { ProyectoWizard }        from '@/views/Proyectos/wizard/ProyectoWizard'
import { useWizardStore }         from '@/modules/proyectos'
import { useProyectosController } from '@/modules/proyectos'

export default function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const numId  = parseInt(id)

  const { _getById }                    = useProyectosController()
  const { loadFromProyecto, setEditingId } = useWizardStore()

  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
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
          estimadorIds:      (p.estimadores ?? []).map((e: { id: number }) => e.id),
          supervisadoPor:    p.supervisadoPor    ?? '',
          noPrefas:          (p as unknown as { noPrefas?: number }).noPrefas          ?? 0,
          tiempoSesionHoras: (p as unknown as { tiempoSesionHoras?: number }).tiempoSesionHoras ?? 0,
        },
        p.actividades.map(a => ({
          nombre:      a.nombre,
          proceso:     a.proceso     ?? undefined,
          bloque:      a.bloque      ?? undefined,
          jornadas:    a.jornadas    ?? undefined,
          fechaInicio: a.fechaInicio ? a.fechaInicio.slice(0, 10) : undefined,
          fechaFin:    a.fechaFin    ? a.fechaFin.slice(0, 10)    : undefined,
          orden:       a.orden,
          creadoPorId:      a.creadoPorId       ?? null,
          creadoPorNombre:  a.creadoPorNombre   ?? null,
          tiemposEstimador: (a as unknown as { tiemposEstimador?: { userId: number; nombre: string; horas: number }[] }).tiemposEstimador ?? [],
          dependencias:     (a as unknown as { dependencias?: string[] }).dependencias ?? [],
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
      setReady(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numId])

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Editar proyecto"
        subtitle="Modifica los datos, actividades y componentes"
      />
      {ready ? (
        <ProyectoWizard editingId={numId} />
      ) : (
        <div className="flex justify-center py-20">
          <span className="w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
