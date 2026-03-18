# 🧠 Planner App — Guía Paso a Paso (Next.js + Prisma + PostgreSQL)

## 🎯 Objetivo
Construir un planificador de vida con:
- Login
- Calendario semanal (lunes a domingo, 00:00–23:00, bloques de 30 min)
- Registro de compras

---

# 🚀 FASE 0 — Setup inicial

## 1. Crear proyecto
```bash
npx create-next-app@latest planner-app
```

Opciones:
- TypeScript
- App Router
- Tailwind
- ESLint

```bash
cd planner-app
npm run dev
```

---

# 🗄️ FASE 1 — Base de datos + Prisma

## 2. Instalar Prisma
```bash
npm install prisma @prisma/client
npx prisma init
```

---

## 3. Configurar PostgreSQL

En `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/planner"
```

---

## 4. Definir modelos

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  events   Event[]
  purchases Purchase[]
}

model Event {
  id        String   @id @default(cuid())
  title     String
  startTime DateTime
  endTime   DateTime
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model Purchase {
  id     String   @id @default(cuid())
  name   String
  price  Float
  date   DateTime @default(now())
  userId String
  user   User     @relation(fields: [userId], references: [id])
}
```

---

## 5. Migrar DB
```bash
npx prisma migrate dev --name init
```

---

## 6. Cliente Prisma

```ts
// /lib/db.ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

---

# 🔐 FASE 2 — Autenticación

## 7. Instalar auth
```bash
npm install next-auth
```

## 8. Crear API auth
Ruta:
```
/app/api/auth/[...nextauth]/route.ts
```

---

# 🧠 FASE 3 — Backend (API)

## 9. Endpoint eventos

```ts
// /app/api/events/route.ts
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany();
  return Response.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();

  const event = await db.event.create({
    data: {
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      userId: body.userId,
    },
  });

  return Response.json(event);
}
```

---

## 10. Endpoint compras

Crear:
```
/app/api/purchases/route.ts
```

(Mismo patrón que eventos)

---

# 🎨 FASE 4 — UI base

## 11. Dashboard

```tsx
// /app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Planner</div>;
}
```

---

# 📅 FASE 5 — Calendario

## 12. Instalar librería
```bash
npm install react-big-calendar date-fns
```

## 13. Render calendario

Import básico:
```tsx
import { Calendar } from "react-big-calendar";
```

Configurar:
- Vista semanal
- Bloques de 30 minutos
- Lunes a domingo

---

# 🧾 FASE 6 — Compras

## 14. Página compras

Ruta:
```
/app/shopping/page.tsx
```

Formulario:
- nombre
- precio

---

# 🔁 FASE 7 — Conexión frontend/backend

Ejemplo:
```ts
await fetch("/api/events", {
  method: "POST",
  body: JSON.stringify(data),
});
```

---

# ⚙️ FASE 8 — Organización PRO

Estructura:
```
/lib
  /services
    eventService.ts
    purchaseService.ts
```

Ejemplo:
```ts
export async function createEvent(data) {
  return db.event.create({ data });
}
```

---

# 🚀 FASE 9 — Deploy

- Frontend + API: Vercel
- DB: Neon / Supabase / AWS

---

# 🧠 Roadmap resumido

1. DB + Prisma
2. API básica
3. UI simple
4. Calendario
5. CRUD eventos
6. Compras
7. Auth

---

# ⚠️ Errores a evitar

- No separar lógica
- Hacer UI antes del backend
- No usar servicios
- No usar Git

---

# 🎯 Siguiente paso

Hoy:
1. Crear proyecto
2. Configurar Prisma
3. Modelo Event
4. Endpoint GET/POST

Si eso funciona → ya tienes backend real 🚀

