# Arquitectura Frontend — APL-Livic PMS

Este documento describe el modelo arquitectónico del frontend del PMS de LIVIC. Es genérico y reutilizable como referencia para cualquier nuevo módulo o desarrollador que se integre al proyecto.

---

## Enfoque Combinado

La arquitectura combina tres estilos complementarios:

| Estilo | Aporte concreto |
|--------|----------------|
| **Clean Architecture / Hexagonal** | Separación estricta por capas; el dominio no depende de ninguna implementación concreta — solo de interfaces (puertos) |
| **Screaming Architecture** | La estructura de carpetas *grita* el dominio del negocio: `modules/reservas/`, `modules/apartamentos/`, etc. — no tecnologías |
| **Vertical Slice Architecture** | Cada módulo es autónomo y contiene todas sus capas; añadir o eliminar un módulo no afecta a los demás |

---

## Mapa de Capas

```
┌────────────────────────────────────────────────────────────────────┐
│  PRESENTACIÓN                                                      │
│  app/[ruta]/page.tsx  →  views/[Modulo]View.tsx                   │
│  (Next.js App Router)     (componente de página React)            │
├────────────────────────────────────────────────────────────────────┤
│  APLICACIÓN                                                        │
│  modules/[modulo]/aplications/controllers/[Modulo].controller.ts  │
│  modules/[modulo]/aplications/[accion]/[accion].ts  ← use cases   │
├────────────────────────────────────────────────────────────────────┤
│  DOMINIO  (núcleo — sin dependencias externas)                     │
│  modules/[modulo]/domain/entities/[Modulo].entities.ts            │
│  modules/[modulo]/domain/models/[Modulo]Repository.ts  ← puerto   │
│  modules/[modulo]/domain/validations/                             │
├────────────────────────────────────────────────────────────────────┤
│  INFRAESTRUCTURA  (adaptador)                                      │
│  modules/[modulo]/infrastructure/api[Modulo]Repository.ts         │
│  lib/api.ts  ←  axios client + interceptor JWT                    │
└────────────────────────────────────────────────────────────────────┘
                              ↕ HTTP
                        API REST (backend)
```

---

## Flujo de Datos

```
page.tsx
  └─► [Modulo]View.tsx
        └─► use[Modulo]Controller()          ← hook React (capa aplicación)
              └─► [accion]UseCase(repo, args) ← caso de uso puro
                    └─► repo.[metodo](args)   ← llamada al puerto (interfaz)
                          └─► Api[Modulo]Repository  ← implementación concreta
                                └─► apiClient.get/post/patch/delete
                                      └─► /api/[recurso]  (proxy Next.js → API)
```

### Respuesta interna unificada

Todas las capas comparten el tipo `HttpResponse<T>` definido en `lib/HttpResponse.ts`:

```typescript
interface HttpResponse<T> {
  error: boolean;
  response?: T;
  msg?: string;
  code?: number;
}
```

La infraestructura transforma la respuesta HTTP cruda a este formato antes de entregársela al caso de uso.

---

## Estructura de un Módulo

```
modules/[modulo]/
│
├── aplications/
│   ├── controllers/
│   │   └── [Modulo].controller.ts     # Hook React que orquesta estado + casos de uso
│   ├── list[Modulo]/
│   │   └── list[Modulo].ts            # Caso de uso: listar
│   ├── get[Modulo]/
│   │   └── get[Modulo].ts             # Caso de uso: obtener por ID
│   ├── create[Modulo]/
│   │   └── create[Modulo].ts          # Caso de uso: crear
│   ├── update[Modulo]/
│   │   └── update[Modulo].ts          # Caso de uso: actualizar
│   └── delete[Modulo]/
│       └── delete[Modulo].ts          # Caso de uso: eliminar
│
├── domain/
│   ├── entities/
│   │   └── [Modulo].entities.ts       # Interfaces de entrada/salida del dominio
│   ├── models/
│   │   └── [Modulo]Repository.ts      # Puerto (contrato) — solo TypeScript, sin lógica
│   └── validations/
│       └── [modulo].validations.ts    # Validaciones de negocio puras
│
└── infrastructure/
    └── api[Modulo]Repository.ts       # Adaptador HTTP — implementa el puerto con axios
```

---

## Responsabilidades por Capa

### `app/[ruta]/page.tsx`
- Punto de entrada Next.js App Router.
- Solo renderiza el View correspondiente.
- Sin lógica de negocio ni estado.

```typescript
// app/reservas/page.tsx
import { ReservasView } from '@/views/Reservas';
export default function Page() { return <ReservasView />; }
```

### `views/[Modulo]View.tsx`
- Componente React que representa la pantalla completa.
- Consume el controller hook para obtener estado y métodos.
- Responsable del layout, tablas, formularios y feedback visual.
- No llama directamente a `apiClient` ni a repositorios.

### `aplications/controllers/[Modulo].controller.ts`
- **Hook React** (`use[Modulo]Controller`).
- Gestiona el estado local: lista, item seleccionado, `loading`, `error`.
- Instancia el repositorio e invoca los casos de uso.
- Expone métodos con prefijo `_` por convención (`_list`, `_get`, `_create`, `_update`, `_delete`).

```typescript
export const useActividadesController = () => {
  const repository = ApiActividadesRepository();
  const [actividades, setActividades] = useState<IResponseActividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const _list = useCallback(async (args) => {
    setLoading(true);
    try {
      const result = await listActividadesUseCase(repository, args);
      if (result.error) throw new Error(result.msg);
      setActividades(result.response ?? []);
    } finally { setLoading(false); }
  }, []);

  return { actividades, loading, error, _list, ... };
};
```

### `aplications/[accion]/[accion].ts` — Casos de Uso
- Funciones puras que reciben el repositorio (inyección de dependencias) y los argumentos.
- No conocen ni React ni HTTP — solo el contrato del dominio.
- Permiten testear la lógica de negocio sin infraestructura.

```typescript
export const listActividadesUseCase = async (
  repository: ActividadesRepository,
  args: IArgsListActividades
): Promise<HttpResponse<IResponseActividad[]>> => {
  return await repository.list(args);
};
```

### `domain/entities/[Modulo].entities.ts`
- Interfaces TypeScript que definen la forma de los datos.
- Separa inputs (`IArgsCreate`, `IArgsUpdate`, `IArgsList`) de outputs (`IResponse`).
- Sin lógica, sin imports externos.

```typescript
export interface IArgsCreateActividad {
  titulo: string;
  tipo: string;
  apartamentoId: string;
  // ...
}

export interface IResponseActividad {
  id: string;
  titulo: string;
  estado: EstadoActividad;
  // ...
}
```

### `domain/models/[Modulo]Repository.ts` — Puerto
- Interfaz TypeScript que define **qué** puede hacer el repositorio.
- El dominio depende de esta interfaz, nunca de la implementación.
- Principio de Inversión de Dependencias (DIP).

```typescript
export type ActividadesRepository = {
  list(args: IArgsListActividades): Promise<HttpResponse<IResponseActividad[]>>;
  get(args: IArgsGetActividad): Promise<HttpResponse<IResponseActividad>>;
  create(args: IArgsCreateActividad): Promise<HttpResponse<IResponseActividad>>;
  update(args: IArgsUpdateActividad): Promise<HttpResponse<IResponseActividad>>;
  delete(args: IArgsDeleteActividad): Promise<HttpResponse<IResponseActividad>>;
};
```

### `infrastructure/api[Modulo]Repository.ts` — Adaptador
- Implementación concreta del puerto usando `apiClient` (Axios).
- Toda la lógica HTTP vive aquí: rutas, params, transformación de respuesta.
- Transforma el response de la API al formato `HttpResponse<T>`.
- Captura errores y los normaliza.

```typescript
export function ApiActividadesRepository(): ActividadesRepository {
  async function list(args): Promise<HttpResponse<IResponseActividad[]>> {
    try {
      const { data } = await apiClient.get('/api/actividades', { params: args });
      return { error: false, response: data.data };
    } catch (err) {
      return { error: true, msg: err instanceof Error ? err.message : 'Error' };
    }
  }
  // ...
  return { list, get, create, update, delete: remove };
}
```

---

## Reglas de Dependencia

```
app/views  →  aplications  →  domain  ←  infrastructure
                                ↑
                          Solo interfaces
```

- Las capas externas dependen de las internas, **nunca al revés**.
- `domain` no importa nada de `infrastructure`, `aplications` ni `views`.
- `infrastructure` implementa las interfaces de `domain`.
- Los casos de uso reciben el repositorio por parámetro — nunca lo instancian.

---

## Convenciones

| Convención | Descripción |
|------------|-------------|
| Prefijo `_` en métodos del controller | `_list`, `_create`, etc. — distingue métodos del hook de propiedades de estado |
| `IArgs*` para inputs | `IArgsCreateActividad`, `IArgsListReservas` |
| `IResponse*` para outputs | `IResponseActividad`, `IResponseReserva` |
| `Api*Repository` para adaptadores | `ApiActividadesRepository`, `ApiReservasRepository` |
| `use*Controller` para hooks | `useActividadesController`, `useReservasController` |
| `*UseCase` para casos de uso | `listActividadesUseCase`, `createReservaUseCase` |

---

## Cómo Agregar un Nuevo Módulo

1. **Crear la estructura de carpetas** en `modules/[nuevoModulo]/`
2. **Definir entidades** en `domain/entities/` — interfaces de input y output
3. **Definir el puerto** en `domain/models/[NuevoModulo]Repository.ts`
4. **Implementar el adaptador** en `infrastructure/api[NuevoModulo]Repository.ts`
5. **Escribir casos de uso** en `aplications/[accion]/[accion].ts` — uno por operación
6. **Crear el controller hook** en `aplications/controllers/[NuevoModulo].controller.ts`
7. **Crear la vista** en `views/[NuevoModulo]View.tsx`
8. **Registrar la ruta** en `app/[nuevo-modulo]/page.tsx`
9. **Agregar el ítem de navegación** en `components/Layout.tsx` → `NAV_ITEMS`

---

## Infraestructura Compartida

| Archivo | Rol |
|---------|-----|
| `lib/api.ts` | Instancia Axios con `baseURL` + interceptor que adjunta `Bearer <token>` en cada request y maneja 401 → logout |
| `lib/auth.ts` | Lee/escribe/elimina el JWT en `localStorage` + cookie `livic_token` |
| `lib/HttpResponse.ts` | Tipo `HttpResponse<T>` compartido entre todas las capas |
| `lib/utils.ts` | `formatDate`, `formatCurrency`, `cn` (classnames) |
| `components/Shared.tsx` | `StatsCard`, `PageHeader`, `StatusBadge` — UI genérica de negocio |
| `components/ui.tsx` | `Button`, `Card`, `Badge` — primitivos de UI sin lógica de negocio |
