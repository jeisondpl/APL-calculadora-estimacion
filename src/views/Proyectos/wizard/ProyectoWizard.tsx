'use client'

import { useRouter } from 'next/navigation'
import { useState }  from 'react'
import { WizardStepper }       from './WizardStepper'
import { Step1DatosGenerales } from './Step1DatosGenerales'
import { Step2Actividades }    from './Step2Actividades'
import { Step3Construccion }   from './Step3Construccion'
import { Card }                from '@/shared/components/ui'
import { useWizardStore }      from '@/modules/proyectos'
import { useProyectosController } from '@/modules/proyectos'

export function ProyectoWizard({ editingId }: { editingId?: number }) {
  const router  = useRouter()
  const { step } = useWizardStore()
  const { _create, _update, error } = useProyectosController()
  const [saving, setSaving] = useState(false)

  const { datosGenerales, actividades, reset } = useWizardStore()

  const handleSave = async () => {
    setSaving(true)
    const { noPrefas } = datosGenerales
    const payload = {
      ...datosGenerales,
      actividades: actividades.map(a => {
        // Para actividades base: calcular jornadas = (noPrefas × Σ horas) / 8
        let jornadas = a.jornadas
        if (a.isDefault && noPrefas > 0) {
          const suma = (a.tiemposEstimador ?? []).reduce((s, t) => s + t.horas, 0)
          jornadas = suma > 0 ? +((noPrefas * suma) / 8.8).toFixed(2) : 0
        }
        return {
          ...a,
          jornadas,
          componentes: a.componentes.map(c => ({
            componenteId: c.componenteId,
            cantidad:     c.cantidad,
            reutilizar:   c.reutilizar,
          })),
        }
      }),
    }

    const result = editingId
      ? await _update({ ...payload, id: editingId })
      : await _create(payload)

    setSaving(false)
    if (result) {
      reset()
      router.push(`/proyectos/${result.id}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <WizardStepper current={step} />

      <Card>
        {step === 1 && <Step1DatosGenerales />}
        {step === 2 && <Step2Actividades />}
        {step === 3 && <Step3Construccion onSave={handleSave} saving={saving} />}
      </Card>

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg mt-3"
          style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
          {error}
        </p>
      )}
    </div>
  )
}
