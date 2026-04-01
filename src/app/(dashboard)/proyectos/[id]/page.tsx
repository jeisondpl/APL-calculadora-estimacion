import { ProyectoDetalleView } from '@/views/Proyectos/ProyectoDetalleView'

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProyectoDetalleView id={parseInt(id)} />
}
