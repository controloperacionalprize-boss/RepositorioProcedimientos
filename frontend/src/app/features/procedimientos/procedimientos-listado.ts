import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';
import { Procedimiento } from '../../core/models/procedimiento';
import { AppIcon } from '../../shared/icon/icon';

export type VistaProcedimientos = 'tabla' | 'tarjetas';

@Component({
  selector: 'app-procedimientos-listado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppIcon],
  host: { class: 'block' },
  template: `
    <section class="rounded-xl border border-line-subtle bg-surface-raised shadow-card">
      <div class="flex items-center justify-between border-b border-line-subtle px-5 py-4">
        <h2 class="text-xs font-semibold tracking-wider text-ink-muted uppercase">
          Listado de procedimientos
        </h2>
        <p class="text-sm text-ink-muted">
          {{ store.items().length }}
          {{ store.items().length === 1 ? 'documento' : 'documentos' }}
          @if (store.filtrosActivos()) {
            <span class="text-ink-subtle"> filtrados</span>
          }
        </p>
      </div>

      @if (vista() === 'tabla') {
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-line-subtle text-xs tracking-wide text-ink-subtle uppercase">
              <tr>
                <th class="px-5 py-3 font-medium">Código</th>
                <th class="px-5 py-3 font-medium">Título del documento</th>
                <th class="px-5 py-3 font-medium">Versión</th>
                <th class="px-5 py-3 font-medium">Estado</th>
                <th class="px-5 py-3 font-medium">Fecha</th>
                <th class="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (grupo of store.grupos(); track grupo.area) {
                <tr class="bg-surface-sunken/80">
                  <td colspan="6" class="px-5 py-2.5">
                    <div class="flex items-center gap-2">
                      <span class="size-2 rounded-full" [style.background]="grupo.color"></span>
                      <span class="text-xs font-semibold tracking-wide text-ink uppercase">
                        {{ grupo.area }}
                      </span>
                      <span class="rounded-pill bg-line px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                        {{ grupo.items.length }}
                      </span>
                    </div>
                  </td>
                </tr>
                @for (doc of grupo.items; track doc.id) {
                  <tr class="ui-ease border-b border-line-subtle hover:bg-surface-sunken/60">
                    <td class="px-5 py-3">
                      <span class="rounded-md bg-surface px-2 py-1 font-mono text-xs text-ink">
                        {{ doc.codigo }}
                      </span>
                    </td>
                    <td class="px-5 py-3 font-medium text-ink">
                      {{ doc.titulo }}
                      @if (doc.archivoNombre) {
                        <span class="mt-0.5 block text-xs font-normal text-ink-subtle">
                          {{ doc.archivoNombre }}
                        </span>
                      }
                    </td>
                    <td class="px-5 py-3 text-ink-muted">{{ doc.version }}</td>
                    <td class="px-5 py-3">
                      <span
                        class="badge-estado"
                        [class.badge-vigente]="doc.estado === 'vigente'"
                        [class.badge-borrador]="doc.estado === 'borrador'"
                      >
                        {{ doc.estado }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-ink-muted">{{ doc.fecha }}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          class="ui-ease rounded-md p-1.5 text-brand/65 hover:bg-brand-muted hover:text-brand"
                          [attr.aria-label]="'Ver ' + doc.titulo"
                          (click)="ver.emit(doc)"
                        >
                          <app-icon name="eye" class="text-base" />
                        </button>
                        <button
                          type="button"
                          class="ui-ease rounded-md p-1.5 text-brand/65 hover:bg-brand-muted hover:text-brand"
                          [attr.aria-label]="'Editar ' + doc.titulo"
                          (click)="editar.emit(doc)"
                        >
                          <app-icon name="edit" class="text-base" />
                        </button>
                        <button
                          type="button"
                          class="ui-ease rounded-md p-1.5 text-brand/65 hover:bg-brand-muted hover:text-brand"
                          [attr.aria-label]="'Descargar ' + doc.titulo"
                          (click)="descargar.emit(doc)"
                        >
                          <app-icon name="download" class="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              } @empty {
                <tr>
                  <td colspan="6" class="px-5 py-10 text-center text-ink-muted">
                    No hay procedimientos que coincidan con la búsqueda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (doc of store.items(); track doc.id) {
            <article
              class="ui-ease rounded-xl border border-line-subtle p-4 shadow-card hover:border-line hover:bg-surface-sunken/40"
            >
              <div class="mb-3 flex items-start justify-between gap-2">
                <span class="rounded-md bg-surface px-2 py-1 font-mono text-xs text-ink">
                  {{ doc.codigo }}
                </span>
                <span
                  class="badge-estado"
                  [class.badge-vigente]="doc.estado === 'vigente'"
                  [class.badge-borrador]="doc.estado === 'borrador'"
                >
                  {{ doc.estado }}
                </span>
              </div>
              <h3 class="text-sm font-semibold text-ink">{{ doc.titulo }}</h3>
              <p class="mt-2 text-xs text-ink-muted">
                {{ doc.area }} · {{ doc.fecha }} · v{{ doc.version }}
              </p>
              <div class="mt-4 flex gap-2">
                <button type="button" class="btn btn-ghost flex-1 text-xs" (click)="ver.emit(doc)">
                  <app-icon name="eye" />
                  Ver
                </button>
                <button type="button" class="btn btn-ghost flex-1 text-xs" (click)="editar.emit(doc)">
                  <app-icon name="edit" />
                  Editar
                </button>
                <button
                  type="button"
                  class="btn btn-ghost flex-1 text-xs"
                  (click)="descargar.emit(doc)"
                >
                  <app-icon name="download" />
                  Descargar
                </button>
              </div>
            </article>
          } @empty {
            <p class="col-span-full py-8 text-center text-ink-muted">
              No hay procedimientos que coincidan con la búsqueda.
            </p>
          }
        </div>
      }
    </section>
  `,
})
export class ProcedimientosListado {
  readonly store = inject(ProcedimientosStore);
  readonly vista = input.required<VistaProcedimientos>();
  readonly ver = output<Procedimiento>();
  readonly editar = output<Procedimiento>();
  readonly descargar = output<Procedimiento>();
}
