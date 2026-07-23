import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

const MODAL_MS = 180;

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mounted()) {
      <div
        class="modal-backdrop"
        [class.is-open]="active()"
        (click)="onBackdrop()"
      >
        <div
          class="modal-panel"
          [class.is-open]="active()"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="labelledBy() || null"
          [attr.aria-label]="ariaLabel() || null"
          (click)="$event.stopPropagation()"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class AppModal {
  private readonly destroyRef = inject(DestroyRef);

  /** Control externo: true abre, false cierra con animación. */
  readonly open = input(false);
  readonly labelledBy = input('');
  readonly ariaLabel = input('');

  /** Click en fondo o Escape — el padre debe poner `open` en false. */
  readonly closeRequest = output<void>();
  /** Termina la salida; útil para limpiar datos del modal. */
  readonly dismissed = output<void>();

  readonly mounted = signal(false);
  readonly active = signal(false);

  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private enterRaf = 0;

  constructor() {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.active()) {
        this.closeRequest.emit();
      }
    };
    document.addEventListener('keydown', onKey);
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(this.leaveTimer);
      cancelAnimationFrame(this.enterRaf);
    });

    effect(() => {
      if (this.open()) {
        this.enter();
      } else {
        this.leave();
      }
    });
  }

  onBackdrop(): void {
    this.closeRequest.emit();
  }

  private enter(): void {
    clearTimeout(this.leaveTimer);
    cancelAnimationFrame(this.enterRaf);
    this.mounted.set(true);
    this.enterRaf = requestAnimationFrame(() => {
      this.enterRaf = requestAnimationFrame(() => this.active.set(true));
    });
  }

  private leave(): void {
    if (!this.mounted()) {
      return;
    }
    cancelAnimationFrame(this.enterRaf);
    this.active.set(false);
    const ms = this.reduceMotion() ? 0 : MODAL_MS;
    clearTimeout(this.leaveTimer);
    this.leaveTimer = setTimeout(() => {
      this.mounted.set(false);
      this.dismissed.emit();
    }, ms);
  }

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
