import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AtendimentoService } from '../../core/services/atendimento.service';
import { FechamentoService, FechamentoMensal } from '../../core/services/fechamento.service';
import { AtendimentoResponse } from '../../models/models';
import { mesAtualComoDateTime, mesAtualComoDate } from '../../core/utils/date-utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  private authService = inject(AuthService);
  private atendimentoService = inject(AtendimentoService);
  private fechamentoService = inject(FechamentoService);

  readonly nome = this.authService.nome;
  readonly isDono = this.authService.isDono;

  carregando = signal(true);
  erro = signal<string | null>(null);

  // Usado pelo BARBEIRO
  meusAtendimentos = signal<AtendimentoResponse[]>([]);
  minhaComissaoTotal = computed(() =>
    this.meusAtendimentos().reduce((soma, a) => soma + a.valorComissao, 0)
  );

  // Usado pelo DONO
  fechamento = signal<FechamentoMensal | null>(null);
  ultimosAtendimentos = signal<AtendimentoResponse[]>([]);

  ngOnInit() {
    if (this.isDono()) {
      this.carregarVisaoDono();
    } else {
      this.carregarVisaoBarbeiro();
    }
  }

  private carregarVisaoBarbeiro() {
    const { inicio, fim } = mesAtualComoDateTime();

    this.atendimentoService.listarMeus(inicio, fim).subscribe({
      next: (atendimentos) => {
        // Mais recentes primeiro
        this.meusAtendimentos.set(
          [...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
        );
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar seus atendimentos');
        this.carregando.set(false);
      },
    });
  }

  private carregarVisaoDono() {
    const { inicio: inicioData, fim: fimData } = mesAtualComoDate();
    const { inicio: inicioDateTime, fim: fimDateTime } = mesAtualComoDateTime();

    this.fechamentoService.gerarFechamento(inicioData, fimData).subscribe({
      next: (resultado) => this.fechamento.set(resultado),
      error: () => this.erro.set('Não foi possível carregar o fechamento'),
    });

    this.atendimentoService.listarPorPeriodo(inicioDateTime, fimDateTime).subscribe({
      next: (atendimentos) => {
        const recentes = [...atendimentos]
          .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
          .slice(0, 10);
        this.ultimosAtendimentos.set(recentes);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os atendimentos recentes');
        this.carregando.set(false);
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
