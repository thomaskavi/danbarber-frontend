import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../core/services/produto.service';
import { VendaService } from '../../core/services/venda.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ProdutoResponse, ItemVendaRequest, FormaPagamento } from '../../core/models/models';

interface ItemCarrinho {
  produto: ProdutoResponse;
  quantidade: number;
}

@Component({
  selector: 'app-nova-venda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nova-venda.component.html',
})
export class NovaVendaComponent implements OnInit {

  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private vendaService = inject(VendaService);
  private notificacao = inject(NotificacaoService);

  produtos = signal<ProdutoResponse[]>([]);
  carrinho = signal<ItemCarrinho[]>([]);
  enviando = signal(false);

  valorTotal = computed(() =>
    this.carrinho().reduce((total, item) => total + item.produto.preco * item.quantidade, 0)
  );

  form = this.fb.group({
    nomeCliente: [''],
    formaPagamento: ['' as FormaPagamento, Validators.required],
    produtoSelecionadoId: [null as number | null],
    quantidadeSelecionada: [1, [Validators.min(1)]],
  });

  ngOnInit() {
    this.produtoService.listarAtivos().subscribe({
      next: (produtos) => this.produtos.set(produtos),
      error: (err) => this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível carregar os produtos'),
    });
  }

  adicionarAoCarrinho() {
    const produtoId = this.form.value.produtoSelecionadoId;
    const quantidade = this.form.value.quantidadeSelecionada ?? 1;

    if (!produtoId || quantidade < 1) return;

    const produto = this.produtos().find(p => p.id === produtoId);
    if (!produto) return;

    if (quantidade > produto.quantidadeEstoque) {
      this.notificacao.erro(`Estoque insuficiente. Disponível: ${produto.quantidadeEstoque}`);
      return;
    }

    const carrinhoAtual = this.carrinho();
    const existente = carrinhoAtual.find(i => i.produto.id === produto.id);

    if (existente) {
      const novaQuantidade = existente.quantidade + quantidade;
      if (novaQuantidade > produto.quantidadeEstoque) {
        this.notificacao.erro(`Estoque insuficiente. Disponível: ${produto.quantidadeEstoque}`);
        return;
      }
      existente.quantidade = novaQuantidade;
      this.carrinho.set([...carrinhoAtual]);
    } else {
      this.carrinho.set([...carrinhoAtual, { produto, quantidade }]);
    }

    this.form.patchValue({ produtoSelecionadoId: null, quantidadeSelecionada: 1 });
  }

  removerDoCarrinho(produtoId: number) {
    this.carrinho.set(this.carrinho().filter(i => i.produto.id !== produtoId));
  }

  finalizarVenda() {
    if (this.carrinho().length === 0) {
      this.notificacao.erro('Adicione ao menos um produto à venda');
      return;
    }

    if (!this.form.value.formaPagamento) {
      this.notificacao.erro('Selecione a forma de pagamento');
      return;
    }

    this.enviando.set(true);

    const itens: ItemVendaRequest[] = this.carrinho().map(i => ({
      produtoId: i.produto.id,
      quantidade: i.quantidade,
    }));

    this.vendaService.registrar({
      nomeCliente: this.form.value.nomeCliente || undefined,
      formaPagamento: this.form.value.formaPagamento!,
      itens,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacao.sucesso('Venda registrada com sucesso!');
        this.carrinho.set([]);
        this.form.reset({ formaPagamento: '' as FormaPagamento, produtoSelecionadoId: null, quantidadeSelecionada: 1 });
        // Recarrega produtos pra refletir o estoque atualizado
        this.produtoService.listarAtivos().subscribe(p => this.produtos.set(p));
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível registrar a venda');
      },
    });
  }
}