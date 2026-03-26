/** Inicio del día calendario en la zona horaria local (medianoche). */
export function startOfLocalDay(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Inicio del día en UTC (medianoche UTC). Útil en validación de API. */
export function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}
