import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TONE, ToneKey } from '../../core/theme/tokens';

@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <article
      class="flex h-full items-start justify-between rounded-xl border border-line-subtle bg-surface-raised p-5 shadow-card"
    >
      <div class="min-w-0">
        <p class="text-sm text-ink-muted">{{ label() }}</p>
        <p class="mt-1 text-3xl font-semibold tracking-tight text-ink">
          {{ value() }}
        </p>
        @if (hint()) {
          <p class="mt-1 truncate text-sm text-ink-muted">{{ hint() }}</p>
        }
        @if (progress() !== null) {
          <div class="mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-surface">
            <div
              class="h-full rounded-full bg-success"
              [style.width.%]="progress()"
            ></div>
          </div>
        }
      </div>
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-full"
        [class]="tones[tone()]"
        aria-hidden="true"
      >
        <ng-content />
      </div>
    </article>
  `,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
  /** `null` oculta la barra; 0–100 la rellena. */
  readonly progress = input<number | null>(null);
  readonly tone = input<ToneKey>('brand');

  protected readonly tones = TONE;
}
