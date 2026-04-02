-- CreateTable
CREATE TABLE "proyecto_estimadores" (
    "proyecto_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "proyecto_estimadores_pkey" PRIMARY KEY ("proyecto_id","usuario_id")
);

-- AddForeignKey
ALTER TABLE "proyecto_estimadores" ADD CONSTRAINT "proyecto_estimadores_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_estimadores" ADD CONSTRAINT "proyecto_estimadores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
