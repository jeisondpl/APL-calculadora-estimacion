-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "requerimiento" VARCHAR(100) NOT NULL,
    "nombre_proyecto" VARCHAR(200) NOT NULL,
    "objetivo" TEXT,
    "fecha_estimacion" DATE,
    "fecha_ejecucion" DATE,
    "estimado_por" VARCHAR(200),
    "supervisado_por" VARCHAR(200),
    "total_base_min" INTEGER NOT NULL DEFAULT 0,
    "total_copilot_min" INTEGER NOT NULL DEFAULT 0,
    "total_tme_min" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(500) NOT NULL,
    "proceso" VARCHAR(100),
    "bloque" VARCHAR(100),
    "jornadas" DECIMAL(8,2),
    "fecha_inicio" DATE,
    "fecha_fin" DATE,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "total_base_min" INTEGER NOT NULL DEFAULT 0,
    "total_copilot_min" INTEGER NOT NULL DEFAULT 0,
    "total_tme_min" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "proyecto_id" INTEGER NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividad_componentes" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "reutilizar" BOOLEAN NOT NULL DEFAULT false,
    "tiempo_base_min" INTEGER NOT NULL DEFAULT 0,
    "tiempo_copilot_min" INTEGER NOT NULL DEFAULT 0,
    "tiempo_tme_min" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actividad_id" INTEGER NOT NULL,
    "componente_id" INTEGER NOT NULL,

    CONSTRAINT "actividad_componentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actividades_proyecto_id_idx" ON "actividades"("proyecto_id");

-- CreateIndex
CREATE INDEX "actividad_componentes_actividad_id_idx" ON "actividad_componentes"("actividad_id");

-- CreateIndex
CREATE INDEX "actividad_componentes_componente_id_idx" ON "actividad_componentes"("componente_id");

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_componentes" ADD CONSTRAINT "actividad_componentes_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_componentes" ADD CONSTRAINT "actividad_componentes_componente_id_fkey" FOREIGN KEY ("componente_id") REFERENCES "componentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
