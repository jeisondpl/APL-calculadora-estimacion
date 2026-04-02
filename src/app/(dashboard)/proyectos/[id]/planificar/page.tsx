import { PlanificarView } from '@/views/Proyectos/PlanificarView'

export default async function PlanificarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PlanificarView id={parseInt(id)} />
}
