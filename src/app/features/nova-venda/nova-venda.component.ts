import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  styleUrl: './nova-venda.component.css',
})
export class NovaVendaComponent implements OnInit {

  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private vendaService = inject(VendaService);
  private notificacao = inject(NotificacaoService);

  termoBusca = signal('');
  resultadosBusca = signal<ProdutoResponse[]>([]);
  buscando = signal(false);

  carrinho = signal<ItemCarrinho[]>([]);
  enviando = signal(false);

  valorTotal = computed(() =>
    this.carrinho().reduce((total, item) => total + item.produto.preco * item.quantidade, 0)
  );

  form = this.fb.group({
    nomeCliente: [''],
    formaPagamento: ['' as FormaPagamento, Validators.required],
  });

  private busca$ = new Subject<string>();

  constructor() {
    this.busca$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((termo) => this.buscarProdutos(termo));
  }

  ngOnInit() {}

  onBuscaChange(valor: string) {
    this.termoBusca.set(valor);

    if (!valor.trim()) {
      this.resultadosBusca.set([]);
      return;
    }

    this.busca$.next(valor);
  }

  private buscarProdutos(termo: string) {
    this.buscando.set(true);
    this.produtoService.findAll(termo, 0, 8).subscribe({
      next: (resultado) => {
        this.resultadosBusca.set(resultado.content);
        this.buscando.set(false);
      },
      error: (err) => {
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível buscar produtos');
        this.buscando.set(false);
      },
    });
  }

  selecionarProduto(produto: ProdutoResponse) {
    if (produto.quantidadeEstoque < 1) {
      this.notificacao.erro(`"${produto.nome}" está sem estoque`);
      return;
    }

    const carrinhoAtual = this.carrinho();
    const existente = carrinhoAtual.find(i => i.produto.id === produto.id);

    if (existente) {
      if (existente.quantidade + 1 > produto.quantidadeEstoque) {
        this.notificacao.erro(`Estoque insuficiente. Disponível: ${produto.quantidadeEstoque}`);
        return;
      }
      existente.quantidade += 1;
      this.carrinho.set([...carrinhoAtual]);
    } else {
      this.carrinho.set([...carrinhoAtual, { produto, quantidade: 1 }]);
    }

    // Limpa a busca depois de adicionar, pronto pra próxima
    this.termoBusca.set('');
    this.resultadosBusca.set([]);
  }

  aumentarQuantidade(item: ItemCarrinho) {
    if (item.quantidade + 1 > item.produto.quantidadeEstoque) {
      this.notificacao.erro(`Estoque insuficiente. Disponível: ${item.produto.quantidadeEstoque}`);
      return;
    }
    item.quantidade += 1;
    this.carrinho.set([...this.carrinho()]);
  }

  diminuirQuantidade(item: ItemCarrinho) {
    if (item.quantidade <= 1) {
      this.removerDoCarrinho(item.produto.id);
      return;
    }
    item.quantidade -= 1;
    this.carrinho.set([...this.carrinho()]);
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
        this.form.reset({ nomeCliente: '', formaPagamento: '' as FormaPagamento });
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível registrar a venda');
      },
    });
  }
}