import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';
import {
  AreaProcedimiento,
  EstadoProcedimiento,
} from '../../core/models/procedimiento';

@Component({
  selector: 'app-procedimientos-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="flex flex-wrap items-center gap-3 rounded-xl border border-line-subtle bg-surface-raised px-4 py-3 shadow-card"
      role="search"
      aria-label="Filtros del listado"
    >
      <label class="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[14rem]">
        <span class="text-xs font-medium text-ink-muted">Área</span>
        <select
          class="ui-ease rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
          [value]="store.filtroArea() ?? ''"
          (change)="onArea($event)"
        >
          <option value="">Todas</option>
          <option value="COSECHA">Cosecha</option>
          <option value="OPERACIONES">Operaciones</option>
        </select>
      </label>

      <label class="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[14rem]">
        <span class="text-xs font-medium text-ink-muted">Estado</span>
        <select
          class="ui-ease rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
          [value]="store.filtroEstado() ?? ''"
          (change)="onEstado($event)"
        >
          <option value="">Todos</option>
          <option value="vigente">Vigente</option>
          <option value="borrador">Borrador</option>
        </select>
      </label>

      @if (store.filtrosActivos()) {
        <button
          type="button"
          class="btn btn-ghost mt-auto text-xs sm:ml-auto"
          (click)="store.limpiarFiltros()"
        >
          Limpiar filtros
        </button>
      }
    </div>
  `,
})
export class ProcedimientosFilters {
  readonly store = inject(ProcedimientosStore);

  onArea(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.setFiltroArea(value ? (value as AreaProcedimiento) : null);
  }

  onEstado(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.setFiltroEstado(value ? (value as EstadoProcedimiento) : null);
  }
}
