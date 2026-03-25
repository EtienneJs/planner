# Cómo hacer un commit en Git

## 1. Ver qué cambió

```bash
git status
git diff
```

## 2. Añadir archivos al área de preparación (staging)

Todo lo modificado:

```bash
git add .
```

Solo archivos concretos:

```bash
git add ruta/al/archivo.ts
```

## 3. Crear el commit

```bash
git commit -m "Descripción breve del cambio"
```

El mensaje debe explicar **qué** hiciste y, si hace falta, **por qué** (en una línea o varias).

### Mensajes útiles (convención común)

Prefijo opcional + descripción en imperativo:

| Prefijo   | Uso |
|-----------|-----|
| `feat:`   | Nueva funcionalidad |
| `fix:`    | Corrección de un error |
| `docs:`   | Solo documentación |
| `refactor:` | Cambio de código sin cambiar comportamiento |
| `chore:`  | Tareas de mantenimiento (deps, config) |

Ejemplos:

- `feat: añadir filtro por fecha en la lista de tareas`
- `fix: corregir cálculo del total en el carrito`
- `docs: actualizar guía de commits`

## 4. Subir al remoto (si aplica)

```bash
git push
```

La primera vez en una rama nueva:

```bash
git push -u origin nombre-de-la-rama
```

## Buenas prácticas

- Commits pequeños y lógicos: un cambio coherente por commit cuando sea posible.
- No subas secretos (`.env`, claves API); suele estar en `.gitignore`.
- Si te equivocaste en el último mensaje: `git commit --amend -m "Nuevo mensaje"` (solo si aún no has hecho push o sabes reescribir historia).
