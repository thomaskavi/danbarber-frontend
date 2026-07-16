import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';

@Component({
  selector: 'app-novo-produto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './novo-produto.component.html',
})
export class NovoProdutoComponent {

  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private notificacao = inject(NotificacaoService);
  private router = inject(Router);

  enviando = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
  });

  salvar() {
    if (this.form.invalid) return;

    this.enviando.set(true);
    this.produtoService.registrar({
      nome: this.form.value.nome!,
      preco: this.form.value.preco!,
      quantidadeEstoque: this.form.value.quantidadeEstoque!,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacao.sucesso('Produto cadastrado com sucesso');
        this.router.navigate(['/produtos']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível cadastrar o produto');
      },
    });
  }
}