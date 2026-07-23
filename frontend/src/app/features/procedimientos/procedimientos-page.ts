import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';
import { Procedimiento } from '../../core/models/procedimiento';
import { KpiCard } from '../../shared/kpi-card/kpi-card';
import { AppIcon } from '../../shared/icon/icon';
import { ProcedimientosFilters } from './procedimientos-filters';
import {
  ProcedimientosListado,
  VistaProcedimientos,
} from './procedimientos-listado';
import {
  FormModo,
  ProcedimientoFormModal,
} from './procedimiento-form-modal';
import { ProcedimientoDetalleModal } from './procedimiento-detalle-modal';
import {
  descargarProcedimiento,
  exportarProcedimientosCsv,
} from './procedimiento-files';

@Component({
  selector: 'app-procedimientos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    KpiCard,
    AppIcon,
    ProcedimientosFilters,
    ProcedimientosListado,
    ProcedimientoFormModal,
    ProcedimientoDetalleModal,
  ],
  host: { class: 'block p-6' },
  template: `
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-sm text-ink-muted">
          Cosecha y Operaciones
          <span class="text-ink-subtle">/</span>
          Procedimientos
        </p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">Procedimientos</h1>
        <p class="mt-1 text-sm text-ink-muted">
          Consulta y visualiza los procedimientos de la división de campo.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex rounded-lg border border-line bg-surface-raised p-0.5 shadow-card"
          role="group"
          aria-label="Tipo de vista"
        >
          <button
            type="button"
            class="ui-ease rounded-md px-3 py-1.5 text-sm font-medium"
            [class]="
              vista() === 'tabla'
                ? 'bg-brand text-ink-inverse'
                : 'text-ink-muted hover:bg-surface-sunken'
            "
            (click)="vista.set('tabla')"
          >
            Tabla
          </button>
          <button
            type="button"
            class="ui-ease rounded-md px-3 py-1.5 text-sm font-medium"
            [class]="
              vista() === 'tarjetas'
                ? 'bg-brand text-ink-inverse'
                : 'text-ink-muted hover:bg-surface-sunken'
            "
            (click)="vista.set('tarjetas')"
          >
            Tarjetas
          </button>
        </div>

        <button type="button" class="btn btn-ghost" (click)="exportar()">
          <app-icon name="export" class="text-base" />
          Exportar
        </button>

        <button type="button" class="btn btn-primary" (click)="abrirCarga()">
          <app-icon name="plus" class="text-base" />
          Cargar
        </button>
      </div>
    </div>

    <section class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen">
      <app-kpi-card
        label="Total de documentos"
        [value]="store.total()"
        hint="Repositorio de la división"
        tone="brand"
      >
        <app-icon name="folder" class="text-xl" />
      </app-kpi-card>

      <app-kpi-card
        label="Documentos vigentes"
        [value]="store.vigentes()"
        [hint]="store.pctVigentes() + '% del total'"
        [progress]="store.pctVigentes()"
        tone="success"
      >
        <app-icon name="check" class="text-xl" />
      </app-kpi-card>

      <app-kpi-card
        label="Pendientes de publicar"
        [value]="store.borradores()"
        hint="En estado borrador"
        tone="warning"
      >
        <app-icon name="draft" class="text-xl" />
      </app-kpi-card>

      <app-kpi-card
        label="Última actualización"
        [value]="store.ultimaActualizacion().fecha"
        [hint]="store.ultimaActualizacion().titulo"
        tone="brand"
      >
        <app-icon name="calendar" class="text-xl" />
      </app-kpi-card>
    </section>

    <div class="mb-4">
      <app-procedimientos-filters />
    </div>

    <app-procedimientos-listado
      [vista]="vista()"
      (ver)="ver($event)"
      (editar)="abrirEdicion($event)"
      (descargar)="descargar($event)"
    />

    <app-procedimiento-detalle-modal
      [open]="detalleAbierto()"
      [doc]="detalle()"
      (closeRequest)="cerrarDetalle()"
      (dismissed)="limpiarDetalle()"
      (descargar)="descargar($event)"
    />

    <app-procedimiento-form-modal
      [open]="formAbierto()"
      [modo]="formModo()"
      [doc]="formDoc()"
      (closeRequest)="cerrarForm()"
      (dismissed)="limpiarForm()"
    />
  `,
})
export class ProcedimientosPage {
  readonly store = inject(ProcedimientosStore);

  readonly vista = signal<VistaProcedimientos>('tabla');
  readonly detalle = signal<Procedimiento | null>(null);
  readonly detalleAbierto = signal(false);

  readonly formAbierto = signal(false);
  readonly formModo = signal<FormModo>('crear');
  readonly formDoc = signal<Procedimiento | null>(null);

  abrirCarga(): void {
    this.formModo.set('crear');
    this.formDoc.set(null);
    this.formAbierto.set(true);
  }

  abrirEdicion(doc: Procedimiento): void {
    this.formModo.set('editar');
    this.formDoc.set(doc);
    this.formAbierto.set(true);
  }

  cerrarForm(): void {
    this.formAbierto.set(false);
  }

  limpiarForm(): void {
    this.formModo.set('crear');
    this.formDoc.set(null);
  }

  ver(doc: Procedimiento): void {
    const archivo = this.store.archivoDe(doc.id);
    if (
      archivo &&
      (archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf'))
    ) {
      window.open(URL.createObjectURL(archivo), '_blank', 'noopener');
      return;
    }
    this.detalle.set(doc);
    this.detalleAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.detalleAbierto.set(false);
  }

  limpiarDetalle(): void {
    this.detalle.set(null);
  }

  descargar(doc: Procedimiento): void {
    descargarProcedimiento(this.store, doc);
  }

  exportar(): void {
    exportarProcedimientosCsv(this.store.items());
  }
}
