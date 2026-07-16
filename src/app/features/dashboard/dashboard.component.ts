import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AtendimentoService } from '../../core/services/atendimento.service';
import { FechamentoService, FechamentoMensal } from '../../core/services/fechamento.service';
import { AtendimentoResponse } from '../../core/models/models';
import { mesAtualComoDateTime, mesAtualComoDate, hojeComoDateTime } from '../../core/utils/date-utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {

  private authService = inject(AuthService);
  private atendimentoService = inject(AtendimentoService);
  private fechamentoService = inject(FechamentoService);

  readonly nome = this.authService.nome;
  readonly isEmpregador = this.authService.isEmpregador;
  readonly temModulo = this.authService.temModulo.bind(this.authService);

  carregando = signal(true);
  erro = signal<string | null>(null);

  // Total do MÊS (não aparece como lista, só o valor agregado)
  minhaComissaoTotal = signal(0);

  // Lista do DIA — isso que aparece no dashboard agora
  atendimentosHoje = signal<AtendimentoResponse[]>([]);

  // Usado pelo EMPREGADOR
  fechamento = signal<FechamentoMensal | null>(null);

  ngOnInit() {
    if (this.isEmpregador()) {
      this.carregarVisaoEmpregador();
    } else {
      this.carregarVisaoFuncionario();
    }
  }

  private carregarVisaoFuncionario() {
    const mes = mesAtualComoDateTime();
    const hoje = hojeComoDateTime();

    // Chamada 1: total de comissão do MÊS (só usamos a soma, não exibimos a lista)
    this.atendimentoService.listarMeus(mes.inicio, mes.fim).subscribe({
      next: (atendimentos) => {
        const total = atendimentos.reduce((soma, a) => soma + a.valorComissao, 0);
        this.minhaComissaoTotal.set(total);
      },
      error: () => this.erro.set('Não foi possível carregar a comissão do mês'),
    });

    // Chamada 2: atendimentos de HOJE, pra exibir na lista
    this.atendimentoService.listarMeus(hoje.inicio, hoje.fim).subscribe({
      next: (atendimentos) => {
        this.atendimentosHoje.set(
          [...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
        );
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os atendimentos de hoje');
        this.carregando.set(false);
      },
    });
  }

  private carregarVisaoEmpregador() {
    const { inicio: inicioData, fim: fimData } = mesAtualComoDate();
    const hoje = hojeComoDateTime();

    // Fechamento continua sendo do MÊS (faturamento, comissões, saldo)
    this.fechamentoService.gerarFechamento(inicioData, fimData).subscribe({
      next: (resultado) => this.fechamento.set(resultado),
      error: () => this.erro.set('Não foi possível carregar o fechamento'),
    });

    // Lista de atendimentos: só os de HOJE, de todos os Funcionarios
    this.atendimentoService.listarPorPeriodo(hoje.inicio, hoje.fim).subscribe({
      next: (atendimentos) => {
        this.atendimentosHoje.set(
          [...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
        );
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os atendimentos de hoje');
        this.carregando.set(false);
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
