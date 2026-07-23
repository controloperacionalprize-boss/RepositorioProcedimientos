import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Procedimiento } from '../../core/models/procedimiento';
import { AppModal } from '../../shared/modal/modal';
import { AppIcon } from '../../shared/icon/icon';

@Component({
  selector: 'app-procedimiento-detalle-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppModal, AppIcon],
  template: `
    <app-modal
      [open]="open()"
      labelledBy="detalle-titulo"
      (closeRequest)="closeRequest.emit()"
      (dismissed)="dismissed.emit()"
    >
      @if (doc(); as d) {
        <h3 id="detalle-titulo" class="text-lg font-semibold text-ink">{{ d.titulo }}</h3>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">Código</dt>
            <dd class="font-mono text-ink">{{ d.codigo }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">Versión</dt>
            <dd class="text-ink">{{ d.version }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">Área</dt>
            <dd class="text-ink">{{ d.area }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">Estado</dt>
            <dd>
              <span
                class="badge-estado"
                [class.badge-vigente]="d.estado === 'vigente'"
                [class.badge-borrador]="d.estado === 'borrador'"
              >
                {{ d.estado }}
              </span>
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">Fecha</dt>
            <dd class="text-ink">{{ d.fecha }}</dd>
          </div>
          @if (d.archivoNombre) {
            <div class="flex justify-between gap-4">
              <dt class="text-ink-muted">Archivo</dt>
              <dd class="truncate text-ink">{{ d.archivoNombre }}</dd>
            </div>
          }
        </dl>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" (click)="closeRequest.emit()">
            Cerrar
          </button>
          <button type="button" class="btn btn-primary" (click)="onDescargar(d)">
            <app-icon name="download" class="text-base" />
            Descargar
          </button>
        </div>
      }
    </app-modal>
  `,
})
export class ProcedimientoDetalleModal {
  readonly open = input(false);
  readonly doc = input<Procedimiento | null>(null);

  readonly closeRequest = output<void>();
  readonly dismissed = output<void>();
  readonly descargar = output<Procedimiento>();

  onDescargar(doc: Procedimiento): void {
    this.descargar.emit(doc);
    this.closeRequest.emit();
  }
}
