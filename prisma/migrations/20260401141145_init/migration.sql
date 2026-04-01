-- CreateTable
CREATE TABLE "lenguajes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lenguajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tecnologias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tecnologias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_componente" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "componentes" (
    "id" SERIAL NOT NULL,
    "id_csv" INTEGER NOT NULL,
    "nombre_componente" VARCHAR(200) NOT NULL,
    "publicar" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "tipo_id" INTEGER NOT NULL,
    "lenguaje_id" INTEGER NOT NULL,
    "tecnologia_id" INTEGER NOT NULL,

    CONSTRAINT "componentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variables_componente" (
    "id" SERIAL NOT NULL,
    "nombre_variable" VARCHAR(200) NOT NULL,
    "tiempo_base_min" INTEGER NOT NULL,
    "pct_copilot" INTEGER NOT NULL DEFAULT 0,
    "tiempo_copilot_min" INTEGER NOT NULL,
    "pct_tme" INTEGER NOT NULL DEFAULT 0,
    "tiempo_tme_min" INTEGER NOT NULL,
    "raw_original" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "componente_id" INTEGER NOT NULL,

    CONSTRAINT "variables_componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimaciones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200),
    "descripcion" TEXT,
    "total_base_min" INTEGER NOT NULL DEFAULT 0,
    "total_copilot_min" INTEGER NOT NULL DEFAULT 0,
    "total_tme_min" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimacion_items" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "tiempo_base_min" INTEGER NOT NULL,
    "tiempo_copilot_min" INTEGER NOT NULL,
    "tiempo_tme_min" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimacion_id" INTEGER NOT NULL,
    "componente_id" INTEGER NOT NULL,

    CONSTRAINT "estimacion_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lenguajes_nombre_key" ON "lenguajes"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tecnologias_nombre_key" ON "tecnologias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_nombre_key" ON "grupos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_componente_nombre_key" ON "tipos_componente"("nombre");

-- CreateIndex
CREATE INDEX "componentes_grupo_id_idx" ON "componentes"("grupo_id");

-- CreateIndex
CREATE INDEX "componentes_tipo_id_idx" ON "componentes"("tipo_id");

-- CreateIndex
CREATE INDEX "componentes_lenguaje_id_idx" ON "componentes"("lenguaje_id");

-- CreateIndex
CREATE INDEX "componentes_tecnologia_id_idx" ON "componentes"("tecnologia_id");

-- CreateIndex
CREATE UNIQUE INDEX "componentes_id_csv_nombre_componente_lenguaje_id_tecnologia_key" ON "componentes"("id_csv", "nombre_componente", "lenguaje_id", "tecnologia_id");

-- CreateIndex
CREATE INDEX "variables_componente_componente_id_idx" ON "variables_componente"("componente_id");

-- CreateIndex
CREATE INDEX "estimacion_items_estimacion_id_idx" ON "estimacion_items"("estimacion_id");

-- CreateIndex
CREATE INDEX "estimacion_items_componente_id_idx" ON "estimacion_items"("componente_id");

-- AddForeignKey
ALTER TABLE "componentes" ADD CONSTRAINT "componentes_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "componentes" ADD CONSTRAINT "componentes_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_componente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "componentes" ADD CONSTRAINT "componentes_lenguaje_id_fkey" FOREIGN KEY ("lenguaje_id") REFERENCES "lenguajes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "componentes" ADD CONSTRAINT "componentes_tecnologia_id_fkey" FOREIGN KEY ("tecnologia_id") REFERENCES "tecnologias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variables_componente" ADD CONSTRAINT "variables_componente_componente_id_fkey" FOREIGN KEY ("componente_id") REFERENCES "componentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimacion_items" ADD CONSTRAINT "estimacion_items_estimacion_id_fkey" FOREIGN KEY ("estimacion_id") REFERENCES "estimaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimacion_items" ADD CONSTRAINT "estimacion_items_componente_id_fkey" FOREIGN KEY ("componente_id") REFERENCES "componentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
