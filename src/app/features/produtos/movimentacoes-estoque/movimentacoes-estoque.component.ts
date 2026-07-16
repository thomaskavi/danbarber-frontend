import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-movimentacoes-estoque',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movimentacoes-estoque.component.html',
})
export class MovimentacoesEstoqueComponent implements OnInit {

  private route = inject(ActivatedRoute);
  produtoId!: number;

  ngOnInit() {
    this.produtoId = Number(this.route.snapshot.paramMap.get('id'));
    // TODO: quando o back tiver endpoint de histórico de movimentações,
    // buscar aqui por this.produtoId e popular uma lista de MovimentacaoResponse
  }
}