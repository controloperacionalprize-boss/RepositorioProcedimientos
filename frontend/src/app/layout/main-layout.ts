import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProcedimientosStore } from '../core/services/procedimientos.store';
import { AppIcon, AppIconName } from '../shared/icon/icon';

interface NavItem {
  label: string;
  path: string;
  icon: AppIconName;
}

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIcon],
  host: { class: 'flex h-dvh overflow-hidden bg-surface' },
  template: `
    <aside
      class="flex w-sidebar shrink-0 flex-col bg-brand text-ink-inverse"
      aria-label="Navegación principal"
    >
      <div class="flex items-center gap-3 px-5 py-5">
        <span class="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-xl">
          <app-icon name="book" />
        </span>
        <div class="min-w-0 leading-tight">
          <p class="text-sm font-semibold tracking-tight">Repositorio de</p>
          <p class="text-sm font-semibold tracking-tight">Procedimientos</p>
        </div>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div>
          <p class="px-3 pb-2 text-[11px] font-semibold tracking-wider text-ink-inverse/45">
            GENERAL
          </p>
          <ul class="space-y-1">
            @for (item of general; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-brand-soft text-ink-inverse"
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-inverse/80 transition hover:bg-ink-inverse/10 hover:text-ink-inverse"
                >
                  <app-icon [name]="item.icon" class="text-[1.15rem]" />
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </div>

        <div>
          <p class="px-3 pb-2 text-[11px] font-semibold tracking-wider text-ink-inverse/45">
            GESTIÓN
          </p>
          <ul class="space-y-1">
            @for (item of gestion; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-brand-soft text-ink-inverse"
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-inverse/80 transition hover:bg-ink-inverse/10 hover:text-ink-inverse"
                >
                  <app-icon [name]="item.icon" class="text-[1.15rem]" />
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </div>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex h-header shrink-0 items-center gap-4 border-b border-line bg-surface-raised px-6"
      >
        <label class="relative min-w-0 flex-1" for="global-search">
          <span class="sr-only">Buscar procedimientos</span>
          <app-icon
            name="search"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand/55"
          />
          <input
            id="global-search"
            type="search"
            class="w-full max-w-xl rounded-pill border border-line bg-surface-sunken py-2 pr-4 pl-10 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-brand/30 focus:bg-surface-raised focus:ring-2 focus:ring-brand/15"
            placeholder="Buscar por código, título o palabra clave..."
            [value]="store.query()"
            (input)="onSearch($event)"
          />
        </label>

        <div class="ml-auto flex items-center gap-3">
          <button
            type="button"
            class="rounded-full p-2 text-brand/70 hover:bg-brand-muted hover:text-brand"
            aria-label="Ayuda"
          >
            <app-icon name="help" class="text-xl" />
          </button>

          <button
            type="button"
            class="relative rounded-full p-2 text-brand/70 hover:bg-brand-muted hover:text-brand"
            aria-label="Notificaciones, 3 sin leer"
          >
            <app-icon name="bell" class="text-xl" />
            <span
              class="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-ink-inverse"
            >
              3
            </span>
          </button>

          <div class="flex items-center gap-2 border-l border-line pl-3">
            <span
              class="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-ink-inverse"
              aria-hidden="true"
            >
              JG
            </span>
            <div class="leading-tight">
              <p class="text-sm font-medium text-ink">Juan García</p>
              <p class="text-xs text-ink-muted">Administrador</p>
            </div>
          </div>
        </div>
      </header>

      <main class="min-h-0 flex-1 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class MainLayout {
  readonly store = inject(ProcedimientosStore);

  readonly general: NavItem[] = [
    { label: 'Inicio', path: '/inicio', icon: 'home' },
    { label: 'Procedimientos', path: '/procedimientos', icon: 'docs' },
    { label: 'Áreas', path: '/areas', icon: 'areas' },
  ];

  readonly gestion: NavItem[] = [
    { label: 'Documentos Recientes', path: '/recientes', icon: 'clock' },
    { label: 'Solicitudes', path: '/solicitudes', icon: 'inbox' },
    { label: 'Reportes', path: '/reportes', icon: 'chart' },
    { label: 'Papelera', path: '/papelera', icon: 'trash' },
  ];

  onSearch(event: Event): void {
    this.store.setQuery((event.target as HTMLInputElement).value);
  }
}
