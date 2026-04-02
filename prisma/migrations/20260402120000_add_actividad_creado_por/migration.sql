-- AlterTable: add creado_por_id to actividades
ALTER TABLE "actividades" ADD COLUMN IF NOT EXISTS "creado_por_id" INTEGER NULL;

ALTER TABLE "actividades"
  ADD CONSTRAINT "actividades_creado_por_id_fkey"
  FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
