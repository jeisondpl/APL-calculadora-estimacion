'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/shared/components/ui'
import { ProyectoWizard } from '@/views/Proyectos/wizard/ProyectoWizard'
import { useWizardStore }  from '@/modules/proyectos'

export default function NuevoProyectoPage() {
  const reset = useWizardStore(s => s.reset)
  useEffect(() => { reset() }, [reset])

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Nuevo proyecto de estimación"
        subtitle="Completa los 3 pasos para registrar y calcular el esfuerzo"
      />
      <ProyectoWizard />
    </div>
  )
}
