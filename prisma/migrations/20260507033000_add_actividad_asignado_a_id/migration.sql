-- AlterTable actividades: agregar relación con usuario asignado
ALTER TABLE "actividades" ADD COLUMN IF NOT EXISTS "asignado_a_id" INTEGER NULL;

-- Foreign key con SET NULL (si se borra el usuario, queda sin asignar)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'actividades_asignado_a_id_fkey'
  ) THEN
    ALTER TABLE "actividades"
      ADD CONSTRAINT "actividades_asignado_a_id_fkey"
      FOREIGN KEY ("asignado_a_id") REFERENCES "usuarios"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Índice para búsquedas por usuario asignado
CREATE INDEX IF NOT EXISTS "actividades_asignado_a_id_idx" ON "actividades"("asignado_a_id");
