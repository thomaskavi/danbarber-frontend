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
  path: 'produtos/novo',
  canActivate: [authGuard, empregador, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/produtos/novo-produto/novo-produto.component').then(m => m.NovoProdutoComponent),
},
{
  path: 'produtos/:id',
  canActivate: [authGuard, empregador, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/produtos/produto-detalhe/produto-detalhe.component').then(m => m.ProdutoDetalheComponent),
},
{
  path: 'produtos/:id/editar',
  canActivate: [authGuard, empregador, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/produtos/editar-produto/editar-produto.component').then(m => m.EditarProdutoComponent),
},
{
  path: 'produtos/:id/ajuste-estoque',
  canActivate: [authGuard, empregador, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/produtos/ajuste-estoque/ajuste-estoque.component').then(m => m.AjusteEstoqueComponent),
},
{
  path: 'produtos/:id/movimentacoes',
  canActivate: [authGuard, empregador, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/produtos/movimentacoes-estoque/movimentacoes-estoque.component').then(m => m.MovimentacoesEstoqueComponent),
},

{
  path: 'nova-venda',
  canActivate: [authGuard, moduloGuard('ESTOQUE_VENDAS')],
  loadComponent: () =>
    import('./features/nova-venda/nova-venda.component').then(m => m.NovaVendaComponent),
},

{
  path: 'funcionarios/novo',
  canActivate: [authGuard, empregador],
  loadComponent: () =>
    import('./features/novo-funcionario/novo-funcionario.component').then(m => m.NovoFuncionarioComponent),
},
];
