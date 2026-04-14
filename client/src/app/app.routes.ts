import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
  { path: 'results', loadComponent: () => import('./pages/results.component').then((m) => m.ResultsComponent) },
  { path: '**', redirectTo: '' },
];
