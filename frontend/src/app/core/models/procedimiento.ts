export type AreaProcedimiento = 'COSECHA' | 'OPERACIONES';

export type EstadoProcedimiento = 'vigente' | 'borrador';

export interface Procedimiento {
  id: string;
  codigo: string;
  titulo: string;
  version: number;
  fecha: string;
  area: AreaProcedimiento;
  estado: EstadoProcedimiento;
  /** Nombre del archivo si se subió en la demo. */
  archivoNombre?: string;
}

export interface NuevoProcedimiento {
  titulo: string;
  area: AreaProcedimiento;
  estado: EstadoProcedimiento;
  archivo: File;
}

export interface EdicionProcedimiento {
  titulo: string;
  area: AreaProcedimiento;
  estado: EstadoProcedimiento;
  archivo?: File | null;
}

export interface AreaGrupo {
  area: AreaProcedimiento;
  color: string;
  items: Procedimiento[];
}
