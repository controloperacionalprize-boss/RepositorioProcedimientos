import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';
import { AppModal } from '../../shared/modal/modal';
import { AppIcon } from '../../shared/icon/icon';
import { exportarProcedimientosPaquete } from './procedimiento-files';

@Component({
  selector: 'app-procedimiento-export-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppModal, AppIcon],
  template: `
    <app-modal
      [open]="open()"
      labelledBy="export-titulo"
      (closeRequest)="closeRequest.emit()"
      (dismissed)="onDismissed()"
    >
      <h3 id="export-titulo" class="text-lg font-semibold text-ink">Exportar paquete</h3>
      <p class="mt-1 text-sm text-ink-muted">
        Elige qué documentos van en el ZIP. Parte de la vista filtrada actual.
      </p>

      @if (candidatos().length === 0) {
        <p class="mt-5 text-sm text-ink-muted">No hay documentos en la vista actual.</p>
      } @else {
        <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-ink-muted">
            {{ selectedCount() }} de {{ candidatos().length }}
            {{ candidatos().length === 1 ? 'documento' : 'documentos' }}
          </p>
          <div class="flex gap-2">
            <button type="button" class="btn btn-ghost text-xs" (click)="marcarTodos()">
              Todos
            </button>
            <button type="button" class="btn btn-ghost text-xs" (click)="limpiar()">
              Ninguno
            </button>
          </div>
        </div>

        @if (avisoRecientes()) {
          <p class="mt-2 text-xs text-ink-subtle">
            Se marcaron los cargados recientemente. Puedes ajustar la selección.
          </p>
        }

        <ul
          class="mt-3 max-h-72 space-y-1 overflow-y-auto rounded-lg border border-line-subtle p-2"
          role="listbox"
          aria-multiselectable="true"
          aria-label="Documentos a exportar"
        >
          @for (doc of candidatos(); track doc.id) {
            <li>
              <label
                class="ui-ease flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-surface-sunken"
                [class.bg-brand-muted]="estaSeleccionado(doc.id)"
              >
                <input
                  type="checkbox"
                  class="mt-0.5 size-4 accent-brand"
                  [checked]="estaSeleccionado(doc.id)"
                  (change)="toggle(doc.id)"
                />
                <span class="min-w-0 flex-1">
                  <span class="block font-mono text-xs text-ink-muted">{{ doc.codigo }}</span>
                  <span class="block truncate text-sm font-medium text-ink">{{ doc.titulo }}</span>
                  <span class="block text-xs text-ink-subtle">
                    {{ doc.area }} · {{ doc.estado }} · v{{ doc.version }}
                  </span>
                </span>
              </label>
            </li>
          }
        </ul>
      }

      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" (click)="closeRequest.emit()">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          [disabled]="selectedCount() === 0 || exportando()"
          (click)="confirmar()"
        >
          <app-icon name="export" class="text-base" />
          {{
            exportando()
              ? 'Exportando…'
              : selectedCount() > 0
                ? 'Exportar ' + selectedCount()
                : 'Exportar'
          }}
        </button>
      </div>
    </app-modal>
  `,
})
export class ProcedimientoExportModal {
  private readonly store = inject(ProcedimientosStore);
  private estabaAbierto = false;

  readonly open = input(false);
  /** Ids recién cargados en la sesión; si hay overlap con la vista, se premarcan. */
  readonly recientesIds = input<ReadonlySet<string>>(new Set());

  readonly closeRequest = output<void>();
  readonly dismissed = output<void>();
  readonly exported = output<void>();

  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly exportando = signal(false);
  readonly avisoRecientes = signal(false);

  readonly candidatos = computed(() => this.store.items());
  readonly selectedCount = computed(() => this.selectedIds().size);

  constructor() {
    effect(() => {
      const abierto = this.open();
      if (abierto && !this.estabaAbierto) {
        this.hidratar();
      }
      this.estabaAbierto = abierto;
    });
  }

  private hidratar(): void {
    const candidatos = this.candidatos();
    const recientes = this.recientesIds();
    const overlap = candidatos.filter((d) => recientes.has(d.id));

    if (overlap.length > 0) {
      this.selectedIds.set(new Set(overlap.map((d) => d.id)));
      this.avisoRecientes.set(true);
      return;
    }

    this.selectedIds.set(new Set(candidatos.map((d) => d.id)));
    this.avisoRecientes.set(false);
  }

  estaSeleccionado(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggle(id: string): void {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  marcarTodos(): void {
    this.selectedIds.set(new Set(this.candidatos().map((d) => d.id)));
    this.avisoRecientes.set(false);
  }

  limpiar(): void {
    this.selectedIds.set(new Set());
  }

  async confirmar(): Promise<void> {
    if (this.exportando() || this.selectedCount() === 0) {
      return;
    }
    const items = this.store.porIds(this.selectedIds());
    if (items.length === 0) {
      return;
    }

    this.exportando.set(true);
    try {
      await exportarProcedimientosPaquete(this.store, items);
      this.exported.emit();
      this.closeRequest.emit();
    } finally {
      this.exportando.set(false);
    }
  }

  onDismissed(): void {
    this.selectedIds.set(new Set());
    this.avisoRecientes.set(false);
    this.exportando.set(false);
    this.dismissed.emit();
  }
}
