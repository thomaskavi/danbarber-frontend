import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { empregador } from './core/guards/empregador.guard';
import { moduloGuard } from './core/guards/modulo.guard';

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
    canActivate: [authGuard, empregador],
    loadComponent: () =>
      import('./features/despesas/despesas.component').then(m => m.DespesasComponent),
  },
  {
    path: 'servicos',
    canActivate: [authGuard, empregador],
    loadComponent: () =>
      import('./features/servicos/servicos.component').then(m => m.ServicosComponent),
  },

  { 
    path: 'criar-conta',
    loadComponent: () =>
      import('./features/registrar/registrar.component').then(m => m.RegistrarComponent),
  },

  {
  path: 'produtos',
  canActivate: [authGuard, empregador, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/produtos/produtos.component').then(m => m.ProdutosComponent),
},
{
  path: 'nova-venda',
  canActivate: [authGuard, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/nova-venda/nova-venda.component').then(m => m.NovaVendaComponent),
},
];
