import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'procedimientos' },
      {
        path: 'procedimientos',
        loadComponent: () =>
          import('./features/procedimientos/procedimientos-page').then(
            (m) => m.ProcedimientosPage,
          ),
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./shared/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Inicio' },
      },
      {
        path: 'areas',
        loadComponent: () =>
          import('./shared/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Áreas' },
      },
      {
        path: 'recientes',
        loadComponent: () =>
          import('./shared/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Documentos Recientes' },
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./shared/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Solicitudes' },
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./shared/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Reportes' },
      },
      {
        path: 'papelera',
        loadComponent: () =>
          import('./shared/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Papelera' },
      },
    ],
  },
  { path: '**', redirectTo: 'procedimientos' },
];
