import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AtendimentoService } from '../../core/services/atendimento.service';
import { VendaService } from '../../core/services/venda.service';
import { AtendimentoResponse, VendaResponse } from '../../core/models/models';
import { dataParaDateTimeRange, hojeComoDate, dataMenosDias } from '../../core/utils/date-utils';

type AbaHistorico = 'ATENDIMENTOS' | 'VENDAS';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css',
})
export class HistoricoComponent implements OnInit {

  private authService = inject(AuthService);
  private atendimentoService = inject(AtendimentoService);
  private vendaService = inject(VendaService);

  readonly isEmpregador = this.authService.isEmpregador;
  readonly temAtendimentos = this.authService.temModulo('ATENDIMENTOS');
  readonly temVendas = this.authService.temModulo('ESTOQUE_VENDAS');

  // Se a empresa tiver os dois módulos, começa mostrando o de atendimentos;
  // se só tiver um dos dois, já entra direto nele
  aba = signal<AbaHistorico>(this.temAtendimentos ? 'ATENDIMENTOS' : 'VENDAS');

  atendimentos = signal<AtendimentoResponse[]>([]);
  vendas = signal<VendaResponse[]>([]);

  carregando = signal(false);
  erro = signal<string | null>(null);
  jaFiltrou = signal(false);

  filtroInicio = signal(dataMenosDias(7));
  filtroFim = signal(hojeComoDate());

  valorTotalPeriodo = computed(() => {
    if (this.aba() === 'ATENDIMENTOS') {
      return this.atendimentos().reduce((soma, a) => soma + a.valorTotal, 0);
    }
    return this.vendas().reduce((soma, v) => soma + v.valorTotal, 0);
  });

  comissaoTotalPeriodo = computed(() =>
    this.atendimentos().reduce((soma, a) => soma + a.valorComissao, 0)
  );

  ngOnInit() {
    this.filtrar();
  }

  trocarAba(aba: AbaHistorico) {
    if (this.aba() === aba) return;
    this.aba.set(aba);
    this.filtrar();
  }

  atualizarFiltroInicio(valor: string) {
    this.filtroInicio.set(valor);
  }

  atualizarFiltroFim(valor: string) {
    this.filtroFim.set(valor);
  }

  aplicarAtalho(dias: number) {
    this.filtroInicio.set(dataMenosDias(dias));
    this.filtroFim.set(hojeComoDate());
    this.filtrar();
  }

  filtrar() {
    this.carregando.set(true);
    this.erro.set(null);
    this.jaFiltrou.set(true);

    const { inicio, fim } = dataParaDateTimeRange(this.filtroInicio(), this.filtroFim());

    if (this.aba() === 'ATENDIMENTOS') {
      const busca = this.isEmpregador()
        ? this.atendimentoService.listarPorPeriodo(inicio, fim)
        : this.atendimentoService.listarMeus(inicio, fim);

      busca.subscribe({
        next: (atendimentos) => {
          this.atendimentos.set([...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora)));
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set('Não foi possível carregar o histórico de atendimentos');
          this.carregando.set(false);
        },
      });
    } else {
      this.vendaService.listarPorPeriodo(inicio, fim).subscribe({
        next: (vendas) => {
          this.vendas.set([...vendas].sort((a, b) => b.dataHora.localeCompare(a.dataHora)));
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set('Não foi possível carregar o histórico de vendas');
          this.carregando.set(false);
        },
      });
    }
  }
}