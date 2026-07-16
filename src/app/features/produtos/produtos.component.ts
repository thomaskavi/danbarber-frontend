import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../core/services/produto.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ProdutoResponse, TipoAjusteEstoque } from '../../core/models/models';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './produtos.component.html',

})
export class ProdutosComponent implements OnInit {

  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private notificacao = inject(NotificacaoService);

  produtos = signal<ProdutoResponse[]>([]);
  produtosInativos = signal<ProdutoResponse[]>([]);
  mostrarInativos = signal(false);

  carregando = signal(true);
  enviando = signal(false);

  produtoEmEdicao = signal<ProdutoResponse | null>(null);
  produtoAjustandoEstoque = signal<ProdutoResponse | null>(null);

  form = this.fb.group({
    nome: ['', Validators.required],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
  });

  formEstoque = this.fb.group({
    tipo: ['ENTRADA' as TipoAjusteEstoque, Validators.required],
    quantidade: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.produtoService.listarAtivos().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      },
      error: (err) => {
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível carregar os produtos');
        this.carregando.set(false);
      },
    });
  }

  alternarInativos() {
    const abrindo = !this.mostrarInativos();
    this.mostrarInativos.set(abrindo);

    if (abrindo) {
      this.produtoService.listarInativos().subscribe({
        next: (produtos) => this.produtosInativos.set(produtos),
        error: (err) => this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível carregar os produtos desativados'),
      });
    }
  }

  reativar(produto: ProdutoResponse) {
    this.produtoService.reativar(produto.id).subscribe({
      next: () => {
        this.produtosInativos.set(this.produtosInativos().filter(p => p.id !== produto.id));
        this.notificacao.sucesso('Produto reativado');
        this.carregar();
      },
      error: (err) => this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível reativar o produto'),
    });
  }

  editar(produto: ProdutoResponse) {
    this.produtoEmEdicao.set(produto);
    this.form.patchValue({
      nome: produto.nome,
      preco: produto.preco,
      quantidadeEstoque: produto.quantidadeEstoque,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.produtoEmEdicao.set(null);
    this.form.reset({ nome: '', preco: null, quantidadeEstoque: 0 });
  }

  salvar() {
    if (this.form.invalid) {
      return;
    }

    this.enviando.set(true);
    const emEdicao = this.produtoEmEdicao();

    // Na edição, o back não altera estoque por aqui (só nome/preço) —
    // ajuste de estoque é sempre via ajustarEstoque, separado
    const dto = {
      nome: this.form.value.nome!,
      preco: this.form.value.preco!,
      quantidadeEstoque: this.form.value.quantidadeEstoque!,
    };

    const operacao = emEdicao
      ? this.produtoService.atualizar(emEdicao.id, dto)
      : this.produtoService.registrar(dto);

    operacao.subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacao.sucesso(emEdicao ? 'Produto atualizado' : 'Produto cadastrado');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível salvar o produto');
      },
    });
  }

  desativar(produto: ProdutoResponse) {
    const confirmar = confirm(`Desativar "${produto.nome}"?`);
    if (!confirmar) return;

    this.produtoService.desativar(produto.id).subscribe({
      next: () => {
        this.notificacao.sucesso('Produto desativado');
        this.carregar();
      },
      error: (err) => this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível desativar o produto'),
    });
  }

  abrirAjusteEstoque(produto: ProdutoResponse) {
    this.produtoAjustandoEstoque.set(produto);
    this.formEstoque.reset({ tipo: 'ENTRADA', quantidade: null });
  }

  cancelarAjusteEstoque() {
    this.produtoAjustandoEstoque.set(null);
  }

  confirmarAjusteEstoque() {
    const produto = this.produtoAjustandoEstoque();
    if (!produto || this.formEstoque.invalid) return;

    const dto = {
      tipo: this.formEstoque.value.tipo!,
      quantidade: this.formEstoque.value.quantidade!,
    };

    this.produtoService.ajustarEstoque(produto.id, dto).subscribe({
      next: () => {
        this.notificacao.sucesso('Estoque ajustado');
        this.cancelarAjusteEstoque();
        this.carregar();
      },
      error: (err) => this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível ajustar o estoque'),
    });
  }
}