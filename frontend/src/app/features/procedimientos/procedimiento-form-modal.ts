import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';
import {
  AreaProcedimiento,
  EstadoProcedimiento,
  Procedimiento,
} from '../../core/models/procedimiento';
import { AppModal } from '../../shared/modal/modal';

export type FormModo = 'crear' | 'editar';

@Component({
  selector: 'app-procedimiento-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppModal],
  template: `
    <app-modal
      [open]="open()"
      labelledBy="carga-titulo"
      (closeRequest)="closeRequest.emit()"
      (dismissed)="onDismissed()"
    >
      <form (submit)="guardar($event)">
        <h3 id="carga-titulo" class="text-lg font-semibold text-ink">
          {{ modo() === 'editar' ? 'Editar procedimiento' : 'Cargar procedimiento' }}
        </h3>
        <p class="mt-1 text-sm text-ink-muted">
          @if (modo() === 'editar') {
            Al guardar sube la versión. El código no cambia.
          } @else {
            Demo en memoria: se pierde al recargar la página.
          }
        </p>

        <div class="mt-5 space-y-4">
          <label class="block">
            <span class="mb-1.5 block text-sm font-medium text-ink">Título</span>
            <input
              type="text"
              required
              class="w-full rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
              [value]="titulo()"
              (input)="onTitulo($event)"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-sm font-medium text-ink">Área</span>
            <select
              class="w-full rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
              [value]="area()"
              (change)="onArea($event)"
            >
              <option value="COSECHA">Cosecha</option>
              <option value="OPERACIONES">Operaciones</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1.5 block text-sm font-medium text-ink">Estado</span>
            <select
              class="w-full rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
              [value]="estado()"
              (change)="onEstado($event)"
            >
              <option value="borrador">Borrador</option>
              <option value="vigente">Vigente</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1.5 block text-sm font-medium text-ink">
              Archivo
              @if (modo() === 'editar') {
                <span class="font-normal text-ink-muted"> (opcional)</span>
              }
            </span>
            @if (modo() === 'editar' && archivoActual()) {
              <p class="mb-1.5 text-xs text-ink-subtle">Actual: {{ archivoActual() }}</p>
            }
            <input
              type="file"
              [required]="modo() === 'crear'"
              accept=".pdf,.doc,.docx,.txt,application/pdf"
              class="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand"
              (change)="onArchivo($event)"
            />
          </label>

          @if (error()) {
            <p class="text-sm text-danger" role="alert">{{ error() }}</p>
          }
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" (click)="closeRequest.emit()">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ProcedimientoFormModal {
  private readonly store = inject(ProcedimientosStore);
  private estabaAbierto = false;

  readonly open = input(false);
  readonly modo = input<FormModo>('crear');
  readonly doc = input<Procedimiento | null>(null);

  readonly closeRequest = output<void>();
  readonly dismissed = output<void>();
  /** Emitido tras guardar con éxito (útil para auto-seleccionar al crear). */
  readonly saved = output<Procedimiento>();

  readonly titulo = signal('');
  readonly area = signal<AreaProcedimiento>('COSECHA');
  readonly estado = signal<EstadoProcedimiento>('borrador');
  readonly archivo = signal<File | null>(null);
  readonly archivoActual = signal('');
  readonly error = signal('');

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
    this.error.set('');
    this.archivo.set(null);
    const doc = this.doc();
    if (this.modo() === 'editar' && doc) {
      this.titulo.set(doc.titulo);
      this.area.set(doc.area);
      this.estado.set(doc.estado);
      this.archivoActual.set(doc.archivoNombre ?? '');
      return;
    }
    this.titulo.set('');
    this.area.set('COSECHA');
    this.estado.set('borrador');
    this.archivoActual.set('');
  }

  onTitulo(event: Event): void {
    this.titulo.set((event.target as HTMLInputElement).value);
  }

  onArea(event: Event): void {
    this.area.set((event.target as HTMLSelectElement).value as AreaProcedimiento);
  }

  onEstado(event: Event): void {
    this.estado.set((event.target as HTMLSelectElement).value as EstadoProcedimiento);
  }

  onArchivo(event: Event): void {
    this.archivo.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  onDismissed(): void {
    this.error.set('');
    this.archivoActual.set('');
    this.dismissed.emit();
  }

  guardar(event: Event): void {
    event.preventDefault();
    const titulo = this.titulo().trim();
    const archivo = this.archivo();

    if (!titulo) {
      this.error.set('Escribe un título.');
      return;
    }

    if (this.modo() === 'crear') {
      if (!archivo) {
        this.error.set('Selecciona un archivo.');
        return;
      }
      const creado = this.store.agregar({
        titulo,
        area: this.area(),
        estado: this.estado(),
        archivo,
      });
      this.saved.emit(creado);
    } else {
      const id = this.doc()?.id;
      if (!id) {
        return;
      }
      const actualizado = this.store.actualizar(id, {
        titulo,
        area: this.area(),
        estado: this.estado(),
        archivo,
      });
      if (actualizado) {
        this.saved.emit(actualizado);
      }
    }

    this.closeRequest.emit();
  }
}
