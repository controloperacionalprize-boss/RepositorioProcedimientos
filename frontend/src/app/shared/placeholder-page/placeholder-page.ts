import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block p-6' },
  template: `
    <h1 class="text-2xl font-semibold text-ink">{{ title() }}</h1>
    <p class="mt-2 text-sm text-ink-muted">
      Módulo pendiente — visible en el menú para la demo de navegación.
    </p>
  `,
})
export class PlaceholderPage {
  /** `data.title` de la ruta. */
  readonly title = input('Módulo');
}
