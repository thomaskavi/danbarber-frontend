import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { ProdutoResponse, TipoAjusteEstoque } from '../../../core/models/models';

@Component({
  selector: 'app-ajuste-estoque',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ajuste-estoque.component.html',
})
export class AjusteEstoqueComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private notificacao = inject(NotificacaoService);

  produto = signal<ProdutoResponse | null>(null);
  carregando = signal(true);
  enviando = signal(false);

  form = this.fb.group({
    tipo: ['ENTRADA' as TipoAjusteEstoque, Validators.required],
    quantidade: [null as number | null, [Validators.required, Validators.min(1)]],
    // Campo preparado para auditoria futura — o back ainda não persiste isso
    observacao: [''],
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.produtoService.buscarPorId(id).subscribe({
      next: (produto) => {
        this.produto.set(produto);
        this.carregando.set(false);
      },
      error: () => {
        this.notificacao.erro('Produto não encontrado');
        this.router.navigate(['/produtos']);
      },
    });
  }

  salvar() {
    const produto = this.produto();
    if (!produto || this.form.invalid) return;

    this.enviando.set(true);

    // Observação não é enviada ao back ainda — campo já existe na tela
    // para quando o backend for preparado para armazenar o histórico
    this.produtoService.ajustarEstoque(produto.id, {
      tipo: this.form.value.tipo!,
      quantidade: this.form.value.quantidade!,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacao.sucesso('Estoque ajustado com sucesso');
        this.router.navigate(['/produtos', produto.id]);
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível ajustar o estoque');
      },
    });
  }
}