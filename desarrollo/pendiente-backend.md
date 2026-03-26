# Pendiente en el backend (tareas cortas)

Lista orientativa según el estado actual de `app/api` y el esquema Prisma. Marca lo que vayas cerrando.

## Autenticación y rutas

- [x] **Middleware Next.js**: el archivo se llama `proxy.ts`; Next espera `middleware.ts` en la raíz con export por defecto. Unificar nombre/export o reexportar para que las rutas API protegidas reciban el JWT como corresponde.
- [X] **Eventos sin sesión**: `GET /api/events` devuelve todos los eventos y `POST` usa `userId` del body. Añadir `requireAuth`, filtrar por usuario y asignar `userId` desde la sesión.

## Eventos (`/api/events`)

- [X] Añadir validación con Zod en POST (campos obligatorios, fechas coherentes).
- [x] Crear `GET/PATCH/DELETE /api/events/[id]` con comprobación de que el evento pertenece al usuario.
- [x] Unificar respuestas con `lib/api/response` (`api.ok`, errores, etc.) como en productos/compras.

## Productos (`/api/products/[id]`)

- [x] En `PUT` y `DELETE`, comprobar que el producto existe **y** `userId` coincide con el usuario autenticado (evitar modificar/borrar recursos de otro usuario).

## Compras (`/api/purchases`)

- [x] En `GET`, incluir `detailProducts` (y opcionalmente datos del producto) con `include` de Prisma para que el front no tenga que pedir compras “vacías”.
- [x] (Opcional) `GET/PATCH/DELETE /api/purchases/[id]` con las mismas reglas de propiedad.

## Calidad y consistencia

- [x] Revisar tipos de `register`: en Zod 4 `z.email()` es la API correcta (`z.string().email()` está deprecado); esquema en `lib/validations/auth.ts` alineado con el resto.
- [x] Añadir manejo explícito cuando `update`/`delete` de producto no encuentra fila o no es del usuario (404 vs 403).

---

*Actualiza este archivo cuando completes o cambies el alcance del backend.*
