import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
  { path: 'results', loadComponent: () => import('./pages/results.component').then((m) => m.ResultsComponent) },
  { path: 'flight/:id', loadComponent: () => import('./pages/flight-detail.component').then((m) => m.FlightDetailPageComponent) },
  { path: '**', redirectTo: '' },
];
