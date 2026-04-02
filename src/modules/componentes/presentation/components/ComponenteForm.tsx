'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createComponenteSchema, type CreateComponenteFormData } from '../schemas/componente.schema'
import { Input, Select, Button } from '@/shared/components/ui'
import { calcTiempoReducido, calcTiempoIncrementado } from '@/shared/lib/utils'
import type { IResponseComponente } from '../../domain/entities/Componentes.entities'

interface Props {
  initial?: IResponseComponente
  options: {
    grupos:      { value: number; label: string }[]
    tipos:       { value: number; label: string }[]
    lenguajes:   { value: number; label: string }[]
    tecnologias: { value: number; label: string }[]
  }
  onSubmit:  (data: CreateComponenteFormData) => Promise<void>
  onCancel:  () => void
  loading:   boolean
}

export function ComponenteForm({ initial, options, onSubmit, onCancel, loading }: Props) {
  const toStr = (v: number) => ({ value: String(v), label: String(v) })

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateComponenteFormData>({
    resolver: zodResolver(createComponenteSchema),
    defaultValues: initial
      ? {
          nombreComponente: initial.nombreComponente,
          grupoId:          initial.grupoId,
          tipoId:           initial.tipoId,
          lenguajeId:       initial.lenguajeId,
          tecnologiaId:     initial.tecnologiaId,
          publicar:         initial.publicar,
          variables: initial.variables.map(v => ({
            nombreVariable: v.nombreVariable,
            tiempoBaseMin:  v.tiempoBaseMin,
            pctCopilot:     v.pctCopilot,
            pctTme:         v.pctTme,
          })),
        }
      : {
          publicar:  true,
          variables: [{ nombreVariable: '', tiempoBaseMin: 30, pctCopilot: 20, pctTme: 30 }],
        },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variables' })
  const vars = watch('variables')

  const strOptions = (arr: { value: number; label: string }[]) =>
    arr.map(o => ({ value: String(o.value), label: o.label }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Datos del componente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Nombre del componente"
            placeholder="ej: Input text"
            error={errors.nombreComponente?.message}
            {...register('nombreComponente')}
          />
        </div>
        <Select
          label="Grupo"
          options={strOptions(options.grupos)}
          placeholder="Selecciona grupo"
          error={errors.grupoId?.message}
          {...register('grupoId')}
        />
        <Select
          label="Tipo"
          options={strOptions(options.tipos)}
          placeholder="Selecciona tipo"
          error={errors.tipoId?.message}
          {...register('tipoId')}
        />
        <Select
          label="Lenguaje"
          options={strOptions(options.lenguajes)}
          placeholder="Selecciona lenguaje"
          error={errors.lenguajeId?.message}
          {...register('lenguajeId')}
        />
        <Select
          label="Tecnología"
          options={strOptions(options.tecnologias)}
          placeholder="Selecciona tecnología"
          error={errors.tecnologiaId?.message}
          {...register('tecnologiaId')}
        />
      </div>

      {/* Variables */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-soft)' }}>
            Variables de estimación
          </p>
          <Button
            type="button" size="sm" variant="secondary"
            onClick={() => append({ nombreVariable: '', tiempoBaseMin: 30, pctCopilot: 20, pctTme: 30 })}
          >
            + Variable
          </Button>
        </div>

        {errors.variables?.root && (
          <p className="text-xs mb-2" style={{ color: '#C0392B' }}>
            {errors.variables.root.message}
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, idx) => {
            const base      = vars[idx]?.tiempoBaseMin ?? 0
            const pctCop    = vars[idx]?.pctCopilot ?? 0
            const pctTme    = vars[idx]?.pctTme ?? 0
            const copilot   = calcTiempoReducido(base, pctCop)
            const tme       = calcTiempoIncrementado(base, pctTme)

            return (
              <div
                key={field.id}
                className="rounded-lg border p-4 space-y-3"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(227,226,218,0.3)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <Input
                    placeholder="Nombre de la variable (ej: html/maquetacion)"
                    error={errors.variables?.[idx]?.nombreVariable?.message}
                    {...register(`variables.${idx}.nombreVariable`)}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="shrink-0 text-sm hover:opacity-70 transition-opacity mt-1"
                      style={{ color: '#C0392B' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Tiempo base (min)"
                    type="number" min={1}
                    error={errors.variables?.[idx]?.tiempoBaseMin?.message}
                    {...register(`variables.${idx}.tiempoBaseMin`)}
                  />
                  <Input
                    label="% Copilot"
                    type="number" min={0} max={100}
                    {...register(`variables.${idx}.pctCopilot`)}
                  />
                  <Input
                    label="% TIGO"
                    type="number" min={0} max={100}
                    {...register(`variables.${idx}.pctTme`)}
                  />
                </div>

                {/* Preview de tiempos calculados */}
                {base > 0 && (
                  <div className="flex gap-4 text-xs pt-1">
                    <span style={{ color: 'var(--color-text-soft)' }}>
                      Base: <strong style={{ color: 'var(--color-text)' }}>{base} min</strong>
                    </span>
                    <span style={{ color: 'var(--color-text-soft)' }}>
                      Copilot: <strong style={{ color: 'var(--color-accent-purple)' }}>{copilot} min</strong>
                    </span>
                    <span style={{ color: 'var(--color-text-soft)' }}>
                      TME: <strong style={{ color: 'var(--color-accent-orange)' }}>{tme} min</strong>
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initial ? 'Guardar cambios' : 'Crear componente'}
        </Button>
      </div>
    </form>
  )
}
