import { computed, Injectable, signal } from '@angular/core';
import { PROCEDIMIENTOS_DEMO } from '../data/procedimientos.demo';
import {
  AreaGrupo,
  AreaProcedimiento,
  EdicionProcedimiento,
  EstadoProcedimiento,
  NuevoProcedimiento,
  Procedimiento,
} from '../models/procedimiento';
import { THEME } from '../theme/tokens';

const AREA_ORDER: AreaProcedimiento[] = ['COSECHA', 'OPERACIONES'];

const AREA_CODE: Record<AreaProcedimiento, string> = {
  COSECHA: 'CS',
  OPERACIONES: 'OP',
};

const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Oct',
  'Nov',
  'Dic',
];

@Injectable({ providedIn: 'root' })
export class ProcedimientosStore {
  private readonly all = signal<Procedimiento[]>([...PROCEDIMIENTOS_DEMO]);
  /** Archivos en memoria (demo, se pierden al recargar). */
  private readonly archivos = new Map<string, File>();

  readonly query = signal('');
  /** `null` = todas */
  readonly filtroArea = signal<AreaProcedimiento | null>(null);
  /** `null` = todos */
  readonly filtroEstado = signal<EstadoProcedimiento | null>(null);

  readonly filtrosActivos = computed(
    () =>
      this.filtroArea() !== null ||
      this.filtroEstado() !== null ||
      this.query().trim().length > 0,
  );

  readonly items = computed(() => {
    const q = this.query().trim().toLowerCase();
    const area = this.filtroArea();
    const estado = this.filtroEstado();

    return this.all().filter((p) => {
      if (area && p.area !== area) {
        return false;
      }
      if (estado && p.estado !== estado) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        p.codigo.toLowerCase().includes(q) || p.titulo.toLowerCase().includes(q)
      );
    });
  });

  readonly grupos = computed<AreaGrupo[]>(() => {
    const byArea = new Map<AreaProcedimiento, Procedimiento[]>();
    for (const item of this.items()) {
      const bucket = byArea.get(item.area) ?? [];
      bucket.push(item);
      byArea.set(item.area, bucket);
    }
    return AREA_ORDER.filter((a) => byArea.has(a)).map((a) => ({
      area: a,
      color: THEME.area[a],
      items: byArea.get(a) ?? [],
    }));
  });

  readonly total = computed(() => this.all().length);
  readonly vigentes = computed(
    () => this.all().filter((p) => p.estado === 'vigente').length,
  );
  readonly borradores = computed(
    () => this.all().filter((p) => p.estado === 'borrador').length,
  );
  readonly pctVigentes = computed(() => {
    const t = this.total();
    return t === 0 ? 0 : Math.round((this.vigentes() / t) * 100);
  });
  readonly ultimaActualizacion = computed(() => {
    const [first] = this.all();
    return first
      ? { fecha: first.fecha, titulo: first.titulo }
      : { fecha: '—', titulo: 'Sin documentos' };
  });

  setQuery(value: string): void {
    this.query.set(value);
  }

  setFiltroArea(value: AreaProcedimiento | null): void {
    this.filtroArea.set(value);
  }

  setFiltroEstado(value: EstadoProcedimiento | null): void {
    this.filtroEstado.set(value);
  }

  limpiarFiltros(): void {
    this.filtroArea.set(null);
    this.filtroEstado.set(null);
    this.query.set('');
  }

  archivoDe(id: string): File | undefined {
    return this.archivos.get(id);
  }

  porIds(ids: Iterable<string>): Procedimiento[] {
    const map = new Map(this.all().map((p) => [p.id, p]));
    const out: Procedimiento[] = [];
    for (const id of ids) {
      const doc = map.get(id);
      if (doc) {
        out.push(doc);
      }
    }
    return out;
  }

  agregar(input: NuevoProcedimiento): Procedimiento {
    const id = crypto.randomUUID();
    const doc: Procedimiento = {
      id,
      codigo: this.siguienteCodigo(input.area),
      titulo: input.titulo.trim(),
      version: 0,
      fecha: this.fechaHoy(),
      area: input.area,
      estado: input.estado,
      archivoNombre: input.archivo.name,
    };

    this.archivos.set(id, input.archivo);
    this.all.update((list) => [doc, ...list]);
    return doc;
  }

  actualizar(id: string, input: EdicionProcedimiento): Procedimiento | null {
    const actual = this.all().find((p) => p.id === id);
    if (!actual) {
      return null;
    }

    const archivo = input.archivo ?? null;
    const next: Procedimiento = {
      ...actual,
      titulo: input.titulo.trim(),
      area: input.area,
      estado: input.estado,
      version: actual.version + 1,
      fecha: this.fechaHoy(),
      archivoNombre: archivo?.name ?? actual.archivoNombre,
    };

    if (archivo) {
      this.archivos.set(id, archivo);
    }

    this.all.update((list) => [next, ...list.filter((p) => p.id !== id)]);
    return next;
  }

  private siguienteCodigo(area: AreaProcedimiento): string {
    const prefijo = `PAQ-${AREA_CODE[area]}-PD-`;
    let max = 0;
    for (const p of this.all()) {
      if (!p.codigo.startsWith(prefijo)) {
        continue;
      }
      const n = Number(p.codigo.slice(prefijo.length));
      if (!Number.isNaN(n) && n > max) {
        max = n;
      }
    }
    return `${prefijo}${String(max + 1).padStart(3, '0')}`;
  }

  private fechaHoy(): string {
    const d = new Date();
    return `${MESES[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
