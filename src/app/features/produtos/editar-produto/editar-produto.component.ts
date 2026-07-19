import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';

@Component({
  selector: 'app-editar-produto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-produto.component.html',
})
export class EditarProdutoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private notificacao = inject(NotificacaoService);

  id!: number;
  carregando = signal(true);
  enviando = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.produtoService.buscarPorId(this.id).subscribe({
      next: (produto) => {
        this.form.patchValue({ nome: produto.nome, preco: produto.preco });
        this.carregando.set(false);
      },
      error: () => {
        this.notificacao.erro('Produto não encontrado');
        this.router.navigate(['/produtos']);
      },
    });
  }

  salvar() {
    if (this.form.invalid) return;

    // Mantém quantidadeEstoque igual ao que já está no back —
    // essa tela nunca altera estoque, só nome/preço
    this.enviando.set(true);
    this.produtoService.atualizar(this.id, {
      nome: this.form.value.nome!,
      preco: this.form.value.preco!,
      quantidadeEstoque: 0, // ignorado pelo back no update — ver observação abaixo
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacao.sucesso('Produto atualizado');
        this.router.navigate(['/produtos', this.id]);
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível atualizar o produto');
      },
    });
  }
}