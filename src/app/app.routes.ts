import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { donoGuard } from './core/guards/dono.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'novo-atendimento',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/novo-atendimento/novo-atendimento.component').then(m => m.NovoAtendimentoComponent),
  },
  {
    path: 'historico',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/historico/historico.component').then(m => m.HistoricoComponent),
  },
  {
    path: 'despesas',
    canActivate: [authGuard, donoGuard],
    loadComponent: () =>
      import('./features/despesas/despesas.component').then(m => m.DespesasComponent),
  },
  {
    path: 'servicos',
    canActivate: [authGuard, donoGuard],
    loadComponent: () =>
      import('./features/servicos/servicos.component').then(m => m.ServicosComponent),
  },
];
