-- =============================================================
-- APL-Calculadora-estimacion — init.sql
-- PostgreSQL 15+ — Preparación del entorno base
-- Las tablas las genera Prisma con: pnpm prisma migrate dev
-- =============================================================

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- búsqueda full-text futura

-- Comentario de auditoría
COMMENT ON DATABASE apl_calculadora IS 'Base de datos de la calculadora de estimación de esfuerzo de desarrollo — APL INDRA';
