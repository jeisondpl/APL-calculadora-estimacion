-- AlterTable proyectos: campos para prefas/sesiones
ALTER TABLE "proyectos" ADD COLUMN IF NOT EXISTS "no_prefas"          INTEGER        NULL DEFAULT 0;
ALTER TABLE "proyectos" ADD COLUMN IF NOT EXISTS "tiempo_sesion_horas" DECIMAL(8,2)   NULL DEFAULT 0;

-- AlterTable actividades: datos_extra para tiempos por estimador
ALTER TABLE "actividades" ADD COLUMN IF NOT EXISTS "datos_extra" JSONB NULL;
