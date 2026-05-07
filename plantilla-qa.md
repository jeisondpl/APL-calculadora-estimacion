# Plantilla QA — Calculadora de Estimación INDRA

Plantilla para registrar **bugs**, **recomendaciones** y **observaciones** encontradas durante las pruebas funcionales de la aplicación. Copia este archivo o las secciones que necesites para cada sesión de pruebas.

---

## 1. Información de la sesión de pruebas

| Campo | Valor |
|-------|-------|
| **Tester (QA)** | _Nombre completo_ |
| **Fecha de prueba** | _DD/MM/AAAA_ |
| **Versión / Branch** | _ej. feature/proyectos-con-actividades_ |
| **Ambiente** | ☐ Local ☐ DEV ☐ QA ☐ STAGING ☐ PROD |
| **Navegador / SO** | _ej. Chrome 130 / Windows 11_ |
| **Resolución pantalla** | _ej. 1920x1080_ |
| **Usuario / Rol probado** | ☐ SUPERUSUARIO ☐ PRODUCT_OWNER ☐ DESARROLLADOR ☐ QA |
| **Duración de la sesión** | _ej. 2h_ |

---

## 2. Resumen ejecutivo de la sesión

> _Describe en 2–4 líneas el alcance de lo que se probó y la impresión general (todo OK, bloqueantes encontrados, etc.)._

**Módulos probados:**
- ☐ Login / Autenticación
- ☐ Calculadora de estimación
- ☐ Componentes / Catálogos
- ☐ Proyectos (creación, edición, planificación)
- ☐ Actividades (asignación, fechas, dependencias)
- ☐ Tab Progreso (gráficas, KPIs, donuts por desarrollador)
- ☐ Gantt
- ☐ Historial
- ☐ Asistente IA / ChatBox
- ☐ Carga de documentos (MAU)
- ☐ Generación de nota Jira
- ☐ Administración de usuarios
- ☐ Otros: __________

**Conteo de hallazgos:**

| Tipo | Cantidad |
|------|---------:|
| 🔴 Bloqueantes | 0 |
| 🟠 Críticos | 0 |
| 🟡 Mayores | 0 |
| 🔵 Menores | 0 |
| 💡 Recomendaciones / Mejoras | 0 |

---

## 3. Plantilla de BUG (copiar por cada incidencia)

### 🐛 BUG-XXX: _Título corto y descriptivo_

| Campo | Valor |
|-------|-------|
| **ID** | BUG-001 |
| **Título** | _Resumen claro del problema_ |
| **Módulo** | _ej. Proyectos > Tab Progreso_ |
| **Severidad** | ☐ 🔴 Bloqueante ☐ 🟠 Crítico ☐ 🟡 Mayor ☐ 🔵 Menor |
| **Prioridad** | ☐ Alta ☐ Media ☐ Baja |
| **Reproducible** | ☐ Siempre ☐ A veces (___% ) ☐ Una vez |
| **Estado** | ☐ Abierto ☐ En análisis ☐ En desarrollo ☐ Resuelto ☐ Cerrado ☐ No es bug |
| **Reportado por** | _Nombre QA_ |
| **Asignado a** | _Desarrollador / por asignar_ |
| **Fecha** | _DD/MM/AAAA_ |

#### 📋 Pasos para reproducir
1. _Paso 1: ej. Iniciar sesión con usuario PRODUCT_OWNER_
2. _Paso 2: ir a Proyectos > seleccionar proyecto X_
3. _Paso 3: clic en pestaña "Progreso"_
4. _Paso 4: ..._

#### ✅ Resultado esperado
> _Lo que debería ocurrir según el comportamiento correcto._

#### ❌ Resultado obtenido
> _Lo que efectivamente ocurre — incluir mensajes de error, comportamiento inesperado, etc._

#### 🖼️ Evidencias
- Captura de pantalla: `evidencias/BUG-001-pantalla.png`
- Video: _enlace o ruta_
- Console / Network log: _pegar errores relevantes en bloque de código_

```
[ej. error de consola]
TypeError: Cannot read property 'map' of undefined
    at ProgresoTab.tsx:142
```

#### 🧠 Información adicional
- **Datos usados**: _ej. proyecto ID 42, actividad sin fechas asignadas_
- **Workaround** (si aplica): _qué hacer mientras se corrige_
- **Impacto en usuario final**: _cuántos usuarios / qué tan visible_

---

## 4. Plantilla de RECOMENDACIÓN / MEJORA

### 💡 REC-XXX: _Título corto_

| Campo | Valor |
|-------|-------|
| **ID** | REC-001 |
| **Título** | _Resumen claro de la mejora_ |
| **Módulo** | _ej. Calculadora > Formulario de componentes_ |
| **Categoría** | ☐ UX/UI ☐ Performance ☐ Accesibilidad ☐ Funcionalidad ☐ Visual ☐ Texto/Copy ☐ Validación ☐ Mobile/Responsive |
| **Impacto estimado** | ☐ Alto ☐ Medio ☐ Bajo |
| **Esfuerzo estimado** | ☐ Bajo (S) ☐ Medio (M) ☐ Alto (L) |
| **Reportado por** | _Nombre QA_ |
| **Fecha** | _DD/MM/AAAA_ |

#### 📝 Descripción / Situación actual
> _Cómo funciona hoy y por qué genera fricción / qué se podría mejorar._

#### 💭 Propuesta sugerida
> _Cómo podría comportarse / verse para mejorar la experiencia._

#### 🎯 Beneficio esperado
- _ej. Reducir clics necesarios para completar la tarea_
- _ej. Mejorar la legibilidad en pantallas pequeñas_
- _ej. Prevenir errores frecuentes del usuario_

#### 🖼️ Referencia visual (si aplica)
- _Captura, mockup o referencia externa_

---

## 5. Niveles de severidad (referencia)

| Nivel | Definición | Ejemplo |
|-------|------------|---------|
| 🔴 **Bloqueante** | Impide totalmente el uso del módulo o funcionalidad principal. No hay workaround. | No se puede iniciar sesión. La calculadora no calcula. |
| 🟠 **Crítico** | Afecta funcionalidad principal con pérdida de datos o cálculos incorrectos. Hay workaround complejo. | Estimación guarda valores erróneos. Asignación de desarrollador no persiste. |
| 🟡 **Mayor** | Funcionalidad secundaria fallida o flujo alternativo roto. Workaround sencillo. | Filtro de tabla no funciona. Gráfica no refleja un estado correctamente. |
| 🔵 **Menor** | Issue cosmético, de texto, o usabilidad sin impacto en datos. | Padding incorrecto. Tipo en label. Botón con icono desalineado. |

### Niveles de prioridad

| Prioridad | Cuándo |
|-----------|--------|
| **Alta** | Debe corregirse antes del próximo release / sprint |
| **Media** | Puede entrar en backlog del sprint actual o siguiente |
| **Baja** | Mejora deseable sin urgencia |

---

## 6. Casos de prueba sugeridos (checklist)

### 6.1 Autenticación y roles
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas (mensaje claro)
- [ ] Cierre de sesión
- [ ] Acceso a rutas protegidas sin sesión (debe redirigir)
- [ ] Cada rol ve solo lo que debe ver (SUPERUSUARIO vs PRODUCT_OWNER vs DESARROLLADOR vs QA)

### 6.2 Calculadora de estimación
- [ ] Crear estimación con un componente
- [ ] Crear estimación con múltiples componentes (varios grupos/lenguajes/tecnologías)
- [ ] Marcar componente como reutilizable y validar tiempos
- [ ] Validar cálculos: tiempoBaseMin, tiempoCopilotMin, tiempoTmeMin
- [ ] Cambiar cantidad y verificar recálculo automático
- [ ] Eliminar componentes
- [ ] Guardar estimación parcial / borrador
- [ ] Validaciones de campos obligatorios (mensajes claros)

### 6.3 Proyectos y actividades
- [ ] Crear proyecto desde estimación existente
- [ ] Editar nombre, objetivo, fechas del proyecto
- [ ] Agregar actividad manualmente
- [ ] Asignar desarrollador a una actividad
- [ ] Asignar fechas (inicio / fin) — validar inicio < fin
- [ ] Definir dependencias entre actividades
- [ ] Eliminar actividad
- [ ] Reordenar actividades (drag & drop)
- [ ] Persistencia tras refrescar la página

### 6.4 Tab Progreso
- [ ] Gráfica radial muestra avance global correcto
- [ ] KPIs (Completadas, En curso, Planificadas, Pendientes) coinciden con tabla
- [ ] Gráfica de barras horizontal por desarrollador es coherente con datos
- [ ] Donuts por desarrollador muestran datos correctos
- [ ] Tooltip de cada gráfica muestra info correcta
- [ ] Estado de actividad se calcula correctamente según fechas (hoy vs inicio/fin)
- [ ] "Sin asignar" aparece si hay actividades sin desarrollador

### 6.5 Gantt
- [ ] Línea de tiempo refleja correctamente fechas de actividades
- [ ] Colores por bloque (Front, Magento, Backend) son consistentes
- [ ] Jornadas se muestran en cada barra
- [ ] Comportamiento responsive (zoom, scroll horizontal)

### 6.6 Asistente IA / ChatBox
- [ ] Quick prompts funcionan (Generar nota Jira, ¿Cuántas completadas?, etc.)
- [ ] Respuestas son coherentes con datos del proyecto
- [ ] Carga de documento MAU (PDF, DOCX, TXT, MD)
- [ ] Modal de preview Markdown funciona
- [ ] Manejo de errores cuando documento no se puede procesar

### 6.7 UX / UI general
- [ ] Responsive en mobile (≤640px)
- [ ] Responsive en tablet (640–1024px)
- [ ] Estados de carga (loading) visibles en operaciones largas
- [ ] Estados vacíos ("Sin datos") con mensaje claro
- [ ] Mensajes de error legibles y útiles
- [ ] Feedback tras acciones (guardado, eliminado, etc.)
- [ ] Accesibilidad: navegación con teclado, foco visible
- [ ] Contraste de texto suficiente (WCAG AA)
- [ ] Coherencia visual con paleta de colores INDRA

### 6.8 Performance
- [ ] Tiempo de carga inicial razonable (<3s)
- [ ] Listado de proyectos / actividades fluido con muchos registros
- [ ] Sin congelamientos en formularios largos
- [ ] Console sin errores ni warnings críticos

---

## 7. Hallazgos de la sesión

> _Pega aquí los bugs y recomendaciones encontradas usando las plantillas de las secciones 3 y 4._

### Bugs encontrados

<!-- BUG-001, BUG-002, ... -->

### Recomendaciones / Mejoras

<!-- REC-001, REC-002, ... -->

---

## 8. Notas finales del tester

> _Comentarios libres, observaciones generales, riesgos identificados, dudas para el equipo de desarrollo, etc._

---

## 9. Firma / Cierre de sesión

| Campo | Valor |
|-------|-------|
| **Resultado general** | ☐ ✅ Aprobado ☐ ⚠️ Aprobado con observaciones ☐ ❌ Rechazado |
| **Bugs reportados** | _N°_ |
| **Recomendaciones reportadas** | _N°_ |
| **Próxima revisión** | _Fecha_ |
| **Firma QA** | _Nombre / fecha_ |

---

### 📌 Convenciones de nomenclatura para IDs

- **BUG-XXX**: numeración correlativa por proyecto (BUG-001, BUG-002, ...)
- **REC-XXX**: numeración correlativa para recomendaciones (REC-001, REC-002, ...)
- Si se trabaja con múltiples sprints, prefijar con sprint: `SPR03-BUG-001`

### 📁 Estructura sugerida de evidencias

```
qa/
├── sesion-2026-05-06-jeison/
│   ├── plantilla-qa.md       (este archivo completado)
│   └── evidencias/
│       ├── BUG-001-error-consola.png
│       ├── BUG-002-flujo-roto.mp4
│       └── REC-001-mockup.png
```

---

**¡Gracias por contribuir a la calidad del producto!** 🚀
