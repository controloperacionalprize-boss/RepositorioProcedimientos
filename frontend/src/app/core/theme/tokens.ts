/** Colores de área para uso en TS (puntos del listado). El resto vive en styles.css. */
export const THEME = {
  area: {
    COSECHA: '#22c55e',
    OPERACIONES: '#3d6f9c',
  },
} as const;

/** Clases de tono para KPI / badges. */
export const TONE = {
  brand: 'bg-brand-muted text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const;

export type ToneKey = keyof typeof TONE;
