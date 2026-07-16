import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProdutoService } from '../../core/services/produto.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ProdutoResponse } from '../../core/models/models';

const ESTOQUE_BAIXO_LIMITE = 5;

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css',
})
export class ProdutosComponent implements OnInit {

  private produtoService = inject(ProdutoService);
  private notificacao = inject(NotificacaoService);
  private router = inject(Router);

  produtos = signal<ProdutoResponse[]>([]);
  carregando = signal(true);
  termoBusca = signal('');
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  readonly tamanhoPagina = 10;

  private busca$ = new Subject<string>();

  constructor() {
    // Debounce de 300ms: só busca depois que o usuário parar de digitar
    this.busca$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((termo) => this.buscar(termo, 0));
  }

  ngOnInit() {
    this.buscar('', 0);
  }

  onBuscaChange(valor: string) {
    this.termoBusca.set(valor);
    this.busca$.next(valor);
  }

  private buscar(nome: string, pagina: number) {
    this.carregando.set(true);
    this.produtoService.findAll(nome, pagina, this.tamanhoPagina).subscribe({
      next: (resultado) => {
        this.produtos.set(resultado.content);
        this.totalPaginas.set(resultado.totalPages);
        this.paginaAtual.set(resultado.number);
        this.carregando.set(false);
      },
      error: (err) => {
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível carregar os produtos');
        this.carregando.set(false);
      },
    });
  }

  proximaPagina() {
    if (this.paginaAtual() + 1 < this.totalPaginas()) {
      this.buscar(this.termoBusca(), this.paginaAtual() + 1);
    }
  }

  paginaAnterior() {
    if (this.paginaAtual() > 0) {
      this.buscar(this.termoBusca(), this.paginaAtual() - 1);
    }
  }

  estoqueBaixo(produto: ProdutoResponse): boolean {
    return produto.quantidadeEstoque <= ESTOQUE_BAIXO_LIMITE;
  }

  abrirDetalhe(produto: ProdutoResponse) {
    this.router.navigate(['/produtos', produto.id]);
  }
}