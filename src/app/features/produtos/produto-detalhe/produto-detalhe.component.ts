import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { ProdutoResponse } from '../../../core/models/models';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produto-detalhe.component.html',
})
export class ProdutoDetalheComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private notificacao = inject(NotificacaoService);

  produto = signal<ProdutoResponse | null>(null);
  carregando = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.produtoService.buscarPorId(id).subscribe({
      next: (produto) => {
        this.produto.set(produto);
        this.carregando.set(false);
      },
      error: (err) => {
        this.notificacao.erro(err?.error?.mensagem ?? 'Produto não encontrado');
        this.router.navigate(['/produtos']);
      },
    });
  }

  desativar() {
    const produto = this.produto();
    if (!produto) return;

    const confirmar = confirm(`Desativar "${produto.nome}"? Ele deixará de aparecer na listagem.`);
    if (!confirmar) return;

    this.produtoService.desativar(produto.id).subscribe({
      next: () => {
        this.notificacao.sucesso('Produto desativado');
        this.router.navigate(['/produtos']);
      },
      error: (err) => this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível desativar o produto'),
    });
  }
}