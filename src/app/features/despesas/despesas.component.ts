import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DespesaService } from '../../core/services/despesa.service';
import { DespesaResponse } from '../../models/despesa.models';
import { mesAtualComoDate, hojeComoDate, dataMenosDias } from '../../core/utils/date-utils';

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './despesas.component.html',
})
export class DespesasComponent implements OnInit {

  private fb = inject(FormBuilder);
  private despesaService = inject(DespesaService);

  despesas = signal<DespesaResponse[]>([]);
  carregando = signal(true);
  enviando = signal(false);
  erro = signal<string | null>(null);

  // Guarda a despesa que está sendo editada
  despesaEmEdicao = signal<DespesaResponse | null>(null);

  // Padrão: mês atual (igual ao fechamento, faz sentido pro dono bater os dois)
  filtroInicio = signal(mesAtualComoDate().inicio);
  filtroFim = signal(mesAtualComoDate().fim);

  totalDespesas = computed(() =>
    this.despesas().reduce((soma, d) => soma + d.valor, 0)
  );

  form = this.fb.group({
    descricao: ['', Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    data: [hojeComoDate(), Validators.required],
    categoria: [''],
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);

    this.despesaService
      .listarPorPeriodo(this.filtroInicio(), this.filtroFim())
      .subscribe({
        next: (despesas) => {
          this.despesas.set(
            despesas.sort((a, b) => b.data.localeCompare(a.data))
          );
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set('Não foi possível carregar as despesas');
          this.carregando.set(false);
        },
      });
  }

  atualizarFiltroInicio(valor: string) {
    this.filtroInicio.set(valor);
  }

  atualizarFiltroFim(valor: string) {
    this.filtroFim.set(valor);
  }

  // Mesmo padrão de atalhos do histórico de atendimentos
  aplicarAtalho(dias: number) {
    this.filtroInicio.set(dataMenosDias(dias));
    this.filtroFim.set(hojeComoDate());
    this.carregar();
  }

  aplicarAtalhoMesAtual() {
    const { inicio, fim } = mesAtualComoDate();
    this.filtroInicio.set(inicio);
    this.filtroFim.set(fim);
    this.carregar();
  }

  editar(despesa: DespesaResponse) {
    this.despesaEmEdicao.set(despesa);

    this.form.patchValue({
      descricao: despesa.descricao,
      valor: despesa.valor,
      data: despesa.data,
      categoria: despesa.categoria ?? '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.despesaEmEdicao.set(null);

    this.form.reset({
      descricao: '',
      valor: null,
      data: hojeComoDate(),
      categoria: '',
    });

    this.erro.set(null);
  }

  salvar() {
    if (this.form.invalid) {
      return;
    }

    this.erro.set(null);
    this.enviando.set(true);

    const dto = {
      descricao: this.form.value.descricao!,
      valor: this.form.value.valor!,
      data: this.form.value.data!,
      categoria: this.form.value.categoria || undefined,
    };

    if (this.despesaEmEdicao()) {
      this.despesaService
        .atualizar(this.despesaEmEdicao()!.id, dto)
        .subscribe({
          next: () => {
            this.enviando.set(false);
            this.cancelarEdicao();
            this.carregar();
          },
          error: () => {
            this.enviando.set(false);
            this.erro.set('Não foi possível atualizar a despesa');
          },
        });
      return;
    }

    this.despesaService.registrar(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.cancelarEdicao();
        this.carregar();
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set('Não foi possível registrar a despesa');
      },
    });
  }

  excluir(id: number) {
    const confirmar = confirm('Deseja realmente excluir esta despesa?');

    if (!confirmar) {
      return;
    }

    this.despesaService.excluir(id).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Não foi possível excluir a despesa'),
    });
  }
}
