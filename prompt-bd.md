# MODO THINKING — Análisis de bd.csv para diseño de base de datos PostgreSQL en Docker

## Rol
Eres un arquitecto de datos senior, experto en modelado relacional, normalización, PostgreSQL, Docker y análisis semántico de datasets CSV con datos inconsistentes.

## Objetivo
Analizar un archivo llamado `bd.csv` que contiene una base inicial de componentes, tareas, tecnologías, tiempos y porcentajes usados para estimar esfuerzo de desarrollo de software.

Debes:
1. Reconocer entidades de negocio.
2. Detectar relaciones entre entidades.
3. Identificar problemas de calidad de datos.
4. Diseñar una base de datos PostgreSQL normalizada.
5. Proponer scripts SQL de creación.
6. Proponer estructura Docker para levantar PostgreSQL localmente.
7. Preparar el modelo para que sirva como núcleo de una futura calculadora de estimación de desarrollo de software.

## Instrucción crítica de razonamiento
Trabaja en **modo thinking interno**:
- Razona profundamente antes de responder.
- No muestres tu cadena de pensamiento completa.
- Entrega solo conclusiones, decisiones, supuestos, validaciones y resultados finales bien estructurados.
- Si detectas ambigüedades, documenta los supuestos de forma explícita.

## Contexto del negocio
El CSV representa una base de conocimiento para estimar tiempos de desarrollo de software según:
- componente o artefacto
- grupo funcional
- tipo
- subtarea o variable
- lenguaje
- tecnología
- tiempo base en minutos
- si se publica o no
- porcentaje de reducción con Copilot
- tiempo ajustado con Copilot
- porcentaje TME
- tiempo TME sobre el valor base

El sistema final debe permitir:
- consultar componentes por tecnología, lenguaje, grupo o tipo
- calcular estimaciones por selección de componentes
- comparar tiempo base vs tiempo con Copilot vs tiempo TME
- extender el catálogo con nuevos componentes, tecnologías y reglas futuras

## Entrada esperada
Recibirás los datos de `bd.csv` con separador `;`.

Columnas esperadas:
- id
- Nombre
- Grupo
- Tipo
- Nombre Variables
- Lenguaje
- Tecnologia
- Valor Nuevo/min
- Publicar
- % con copilot
- copilot
- % TME
- TME sobre el valor de la base

## Tareas
Realiza estas tareas en orden:

### 1) Perfilado semántico del CSV
- Identifica qué representa cada columna.
- Distingue atributos descriptivos, métricas, banderas, catálogos y posibles dimensiones.
- Detecta si `id` representa una entidad única o una familia de registros repetidos.
- Detecta duplicados lógicos y variaciones ortográficas.
- Detecta valores corruptos o inconsistentes:
  - errores de codificación
  - typos
  - IDs repetidos con distinto significado
  - porcentajes mal formateados
  - tiempos en texto como "20 min"
  - valores inválidos como `#REF!`
  - espacios extra
  - diferencias como `String_Boot`, `Spring_Boot`, `JAVA`, `Java`, etc.

### 2) Reconocimiento de entidades
Infere las entidades principales del dominio. Evalúa si existen entidades como:
- componente
- subtarea o variable técnica
- grupo funcional
- tipo de componente
- lenguaje
- tecnología
- plataforma
- regla de estimación
- métrica temporal
- categoría documental
- proveedor/integración

No asumas el diseño final sin justificarlo. Primero evalúa alternativas y luego elige la mejor estructura.

### 3) Modelado conceptual
Propón un modelo conceptual con:
- entidades
- atributos
- relaciones
- cardinalidades
- claves primarias
- claves foráneas

Justifica por qué el modelo soporta una calculadora de estimación y no solo un catálogo plano.

### 4) Normalización
Lleva el modelo al menos hasta 3FN.
- Separa catálogos reutilizables.
- Evita duplicidad de texto.
- Evita guardar métricas derivadas si pueden calcularse, salvo que deban persistirse por trazabilidad.
- Explica qué campos conviene almacenar y cuáles podrían recalcularse.

### 5) Reglas de limpieza y transformación
Define reglas ETL para importar el CSV:
- convertir tiempos tipo `"20 min"` a entero en minutos
- convertir porcentajes tipo `"30%"` a decimal o entero
- mapear `Publicar` a boolean o smallint
- tratar nulos y errores como `#REF!`
- normalizar mayúsculas/minúsculas
- corregir tildes/codificación defectuosa
- unificar tecnologías y lenguajes equivalentes
- documentar registros sospechosos

### 6) Diseño lógico en PostgreSQL
Genera el esquema relacional final con:
- nombres de tablas en snake_case
- nombres de columnas consistentes
- tipos de datos adecuados
- constraints
- unique constraints
- foreign keys
- checks útiles
- índices recomendados

Incluye tablas de catálogo y tabla principal de estimaciones.

### 7) SQL DDL
Genera el script SQL completo para PostgreSQL:
- `CREATE TABLE`
- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `CHECK`
- índices
- comentarios opcionales con `COMMENT ON`

### 8) Docker
Genera un entorno mínimo con Docker para correr PostgreSQL:
- `docker-compose.yml`
- variables de entorno
- volumen persistente
- puerto expuesto
- archivo `init.sql` o carpeta de inicialización

### 9) Carga inicial
Propón una estrategia para importar el CSV:
- tabla staging
- tabla limpia
- transformación intermedia
- inserts o scripts ejemplo
- validaciones posteriores a la carga

### 10) Preparación para la calculadora
Asegúrate de que el esquema permita calcular:
- tiempo base total por selección de componentes
- tiempo total con Copilot
- tiempo total TME
- filtros por tecnología/lenguaje/grupo/tipo
- futura agregación por proyecto, módulo, pantalla, servicio o documento

### 11) Datos problemáticos
Crea una sección especial llamada `Hallazgos de calidad de datos` donde listes:
- inconsistencias detectadas
- posibles correcciones
- campos ambiguos
- decisiones tomadas
- riesgos de modelado

## Criterios de decisión
Prioriza:
1. escalabilidad
2. claridad del modelo
3. normalización razonable
4. facilidad de consulta
5. facilidad de carga desde CSV
6. compatibilidad con una futura API backend

## Restricciones
- No simplifiques el dataset a una sola tabla.
- No pierdas trazabilidad del dato original.
- No inventes columnas de negocio sin justificarlas.
- Si un valor es ambiguo, propón una regla explícita.
- Si encuentras que una columna mezcla dos conceptos, sepárala en el modelo si es necesario.
- Diseña pensando en PostgreSQL 15+.

## Formato de salida
Responde exactamente con esta estructura:

### 1. Resumen ejecutivo
### 2. Entidades reconocidas
### 3. Relaciones y cardinalidades
### 4. Problemas de calidad de datos detectados
### 5. Propuesta de modelo relacional
### 6. Diccionario de datos
### 7. SQL PostgreSQL completo
### 8. Docker Compose
### 9. Estrategia de importación del CSV
### 10. Reglas para la calculadora de estimación
### 11. Supuestos y decisiones de diseño
### 12. Mejoras futuras

## Resultado esperado
El resultado debe dejar lista la primera versión de la base de datos para un proyecto de estimación de desarrollo de software, donde `bd.csv` actúa como semilla inicial del conocimiento del dominio.