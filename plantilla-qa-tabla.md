# Plantilla QA — Registro en Tabla (Calculadora de Estimación)

Formato tabular para registrar bugs y recomendaciones encontradas durante las pruebas funcionales. Cada fila = un hallazgo.

---

## 📊 Tabla de hallazgos

| No. | Tester | Fecha de prueba | Módulo / Caso probado | Tipo | Severidad | Prioridad | Descripción | Pasos para reproducir | Resultado esperado | Resultado obtenido | Evidencia | Estado | Asignado a | Fecha resuelto | Comentarios |
|----:|--------|-----------------|----------------------|------|-----------|-----------|-------------|----------------------|--------------------|--------------------|-----------|--------|------------|----------------|-------------|
| 001 | Jeison Díaz | 06/05/2026 | Proyectos > Tab Progreso | 🐛 Bug | 🟠 Crítico | Alta | El donut por desarrollador no muestra datos cuando la actividad no tiene fechas asignadas | 1. Login PO<br>2. Ir a proyecto X<br>3. Tab Progreso | El donut debe mostrar la actividad como "Pendiente" | El donut queda vacío y no aparece el desarrollador | `evidencias/001.png` | Abierto | Dev pendiente | — | Reproducible siempre |
| 002 | Jeison Díaz | 06/05/2026 | Calculadora > Componentes | 💡 Recomendación | 🔵 Menor | Media | Sería útil mostrar el subtotal en tiempo real al cambiar la cantidad | — | — | — | `evidencias/002.png` | Propuesto | — | — | Mejora UX |
| 003 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 004 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 005 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

---

## 📑 Descripción de columnas

| Columna | Descripción | Valores aceptados / Ejemplo |
|---------|-------------|----------------------------|
| **No.** | Numeración correlativa del hallazgo | `001`, `002`, `003`... |
| **Tester** | Nombre completo del QA que reporta | `Jeison Díaz` |
| **Fecha de prueba** | Fecha en que se detectó | `DD/MM/AAAA` |
| **Módulo / Caso probado** | Sección o caso de uso donde se encontró | `Proyectos > Tab Progreso`, `Calculadora`, `Gantt`, `Login` |
| **Tipo** | Naturaleza del hallazgo | 🐛 `Bug` &nbsp;\|&nbsp; 💡 `Recomendación` &nbsp;\|&nbsp; ❓ `Duda funcional` |
| **Severidad** | Impacto técnico del bug | 🔴 `Bloqueante` \| 🟠 `Crítico` \| 🟡 `Mayor` \| 🔵 `Menor` |
| **Prioridad** | Urgencia para resolver | `Alta` \| `Media` \| `Baja` |
| **Descripción** | Resumen claro del problema o mejora | Frase corta y descriptiva |
| **Pasos para reproducir** | Secuencia para reproducir el bug | `1. ... 2. ... 3. ...` |
| **Resultado esperado** | Qué debería ocurrir | Comportamiento correcto esperado |
| **Resultado obtenido** | Qué realmente ocurre | Comportamiento incorrecto observado |
| **Evidencia** | Ruta o link a captura/video | `evidencias/001.png` |
| **Estado** | Status actual del hallazgo | `Abierto` \| `En análisis` \| `En desarrollo` \| `Resuelto` \| `Cerrado` \| `No es bug` \| `Propuesto` |
| **Asignado a** | Desarrollador responsable | Nombre o `—` si no asignado |
| **Fecha resuelto** | Cuándo se cerró | `DD/MM/AAAA` o `—` |
| **Comentarios** | Notas adicionales | Workaround, observaciones, contexto |

---

## 🎨 Leyenda visual rápida

### Tipo
| Icono | Tipo | Significado |
|-------|------|-------------|
| 🐛 | Bug | Comportamiento incorrecto |
| 💡 | Recomendación | Propuesta de mejora |
| ❓ | Duda funcional | Comportamiento ambiguo, requiere aclaración |

### Severidad
| Color | Nivel | Cuándo usar |
|-------|-------|-------------|
| 🔴 | Bloqueante | Impide totalmente usar el módulo |
| 🟠 | Crítico | Pérdida de datos o cálculo erróneo |
| 🟡 | Mayor | Funcionalidad secundaria rota |
| 🔵 | Menor | Cosmético, texto, pulido |

### Estado
| Estado | Significado |
|--------|-------------|
| `Abierto` | Recién reportado, sin revisar |
| `En análisis` | En revisión por el equipo dev |
| `En desarrollo` | Se está corrigiendo |
| `Resuelto` | Corregido, pendiente de validar |
| `Cerrado` | Validado por QA, OK |
| `No es bug` | Comportamiento correcto, descartado |
| `Propuesto` | Recomendación en backlog |

---

## 💡 Buenas prácticas al llenar la tabla

- ✅ Una fila = un hallazgo (no agrupar varios bugs en una sola fila)
- ✅ Usar **No.** correlativo y único en toda la sesión / sprint
- ✅ Adjuntar siempre **evidencia** (captura mínimo, video si es flujo complejo)
- ✅ Ser **específico** en pasos para reproducir (cualquier dev debe poder repetirlo)
- ✅ Diferenciar claramente **resultado esperado** vs **obtenido**
- ✅ Si el hallazgo es **recomendación**, pasos/esperado/obtenido pueden ir como `—`
- ✅ Mantener **estado actualizado** durante el ciclo de vida del bug

---

## 📥 Versión CSV (para importar a Excel / Google Sheets)

Copia este bloque y pégalo en Excel — se separará automáticamente en columnas:

```csv
No.,Tester,Fecha de prueba,Módulo / Caso probado,Tipo,Severidad,Prioridad,Descripción,Pasos para reproducir,Resultado esperado,Resultado obtenido,Evidencia,Estado,Asignado a,Fecha resuelto,Comentarios
001,Jeison Díaz,06/05/2026,Proyectos > Tab Progreso,Bug,Crítico,Alta,Donut no muestra datos sin fechas,"1. Login PO; 2. Ir a proyecto; 3. Tab Progreso",Donut debe mostrar Pendiente,Donut queda vacío,evidencias/001.png,Abierto,Por asignar,,Reproducible siempre
002,Jeison Díaz,06/05/2026,Calculadora > Componentes,Recomendación,Menor,Media,Mostrar subtotal en tiempo real al cambiar cantidad,—,—,—,evidencias/002.png,Propuesto,—,,Mejora UX
```

---

## 📌 Identificación rápida de la sesión

Antes de la tabla, registrar:

| Campo | Valor |
|-------|-------|
| **Sprint / Versión** | _ej. Sprint 12 / v1.4.0_ |
| **Branch probado** | _ej. feature/proyectos-con-actividades_ |
| **Ambiente** | DEV / QA / STAGING |
| **Periodo de pruebas** | _DD/MM/AAAA al DD/MM/AAAA_ |
| **Equipo QA** | _Lista de testers_ |
| **Total hallazgos** | Bugs: _N_ &nbsp;&nbsp; Recomendaciones: _N_ |

---

**Nota:** Esta plantilla en formato tabla es ideal para reportes consolidados. Si necesitas detalle profundo por bug (con secciones extensas, múltiples capturas, logs largos), usa `plantilla-qa.md` que tiene formato por ficha individual.
