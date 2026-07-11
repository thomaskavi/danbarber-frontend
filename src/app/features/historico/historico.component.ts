import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AtendimentoService } from '../../core/services/atendimento.service';
import { AtendimentoResponse } from '../../models/models';
import { dataParaDateTimeRange, hojeComoDate, dataMenosDias } from '../../core/utils/date-utils';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historico.component.html',
})
export class HistoricoComponent implements OnInit {

  private authService = inject(AuthService);
  private atendimentoService = inject(AtendimentoService);

  readonly isDono = this.authService.isDono;

  atendimentos = signal<AtendimentoResponse[]>([]);
  carregando = signal(false);
  erro = signal<string | null>(null);
  jaFiltrou = signal(false);

  // Padrão: últimos 7 dias
  filtroInicio = signal(dataMenosDias(7));
  filtroFim = signal(hojeComoDate());

  valorTotalPeriodo = computed(() =>
    this.atendimentos().reduce((soma, a) => soma + a.valorTotal, 0)
  );

  comissaoTotalPeriodo = computed(() =>
    this.atendimentos().reduce((soma, a) => soma + a.valorComissao, 0)
  );

  ngOnInit() {
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

    const busca = this.isDono()
      ? this.atendimentoService.listarPorPeriodo(inicio, fim)
      : this.atendimentoService.listarMeus(inicio, fim);

    busca.subscribe({
      next: (atendimentos) => {
        this.atendimentos.set(
          [...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
        );
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o histórico');
        this.carregando.set(false);
      },
    });
  }
}
