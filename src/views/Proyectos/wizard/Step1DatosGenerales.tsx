'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button } from '@/shared/components/ui'
import { useWizardStore } from '@/modules/proyectos'
import type { DatosGenerales } from '@/modules/proyectos'

const SUPERVISORES = [
  'Rodriguez Martinez, John Eder',
  'Lopez Moreno, Juan Sebastian',
  'Velasco Lizarazo, Diana Marcela',
] as const

const ESTIMADORES = [
  'Fernando Andrés Herdoíza Vivar',
  'Duvan Camilo García Panqueva',
  'Henry Antonio Cabarcas Granados',
  'Jeison Antonio Díaz Palmera',
  'Rodriguez Martinez, John Eder',
] as const

const schema = z.object({
  requerimiento:   z.string().min(1, 'Requerido'),
  nombreProyecto:  z.string().min(1, 'Requerido'),
  objetivo:        z.string().optional().default(''),
  fechaEstimacion: z.string().optional().default(''),
  fechaEjecucion:  z.string().optional().default(''),
  estimadoPor:     z.string().optional().default(''),
  supervisadoPor:  z.string().optional().default(''),
})

type FormData = z.infer<typeof schema>

export function Step1DatosGenerales() {
  const { datosGenerales, setDatosGenerales, goToStep } = useWizardStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: datosGenerales,
  })

  const onSubmit = (data: FormData) => {
    setDatosGenerales(data as DatosGenerales)
    goToStep(2)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="Requerimiento *"
          placeholder="ej: ODTT-30915"
          error={errors.requerimiento?.message}
          {...register('requerimiento')}
        />
        <Input
          label="Nombre del proyecto *"
          placeholder="ej: Línea Base"
          error={errors.nombreProyecto?.message}
          {...register('nombreProyecto')}
        />

        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>
            Objetivo
          </label>
          <textarea
            rows={3}
            placeholder="Describe el objetivo del requerimiento..."
            className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
            {...register('objetivo')}
          />
        </div>

        <Input
          label="Fecha estimación"
          type="date"
          {...register('fechaEstimacion')}
        />
        <Input
          label="Fecha ejecución"
          type="date"
          {...register('fechaEjecucion')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>
            Estimado por
          </label>
          <select
            {...register('estimadoPor')}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <option value="">— Seleccionar —</option>
            {ESTIMADORES.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>
            Supervisado por
          </label>
          <select
            {...register('supervisadoPor')}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <option value="">— Seleccionar —</option>
            {SUPERVISORES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button type="submit" variant="primary">
          Siguiente: Actividades →
        </Button>
      </div>
    </form>
  )
}
