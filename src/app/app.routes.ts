import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
      { path: 'sliders', loadComponent: () => import('./components/sliders/sliders.component').then(m => m.SlidersComponent) },
      { path: 'services', loadComponent: () => import('./components/services/services.component').then(m => m.ServicesComponent) },
      { path: 'service-images', loadComponent: () => import('./components/service-images/service-images.component').then(m => m.ServiceImagesComponent) }
    ]
  }
];
