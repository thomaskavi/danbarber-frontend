import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AtendimentoService } from '../../core/services/atendimento.service';
import { VendaService } from '../../core/services/venda.service';
import { FechamentoService, FechamentoMensal } from '../../core/services/fechamento.service';
import { AtendimentoResponse, VendaResponse } from '../../core/models/models';
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
  private vendaService = inject(VendaService);
  private fechamentoService = inject(FechamentoService);

  readonly nome = this.authService.nome;
  readonly isEmpregador = this.authService.isEmpregador;
  readonly temModulo = this.authService.temModulo.bind(this.authService);

  carregando = signal(true);
  erro = signal<string | null>(null);

  private chamadasPendentes = 0;

  // Total do MÊS — soma comissão de atendimento + venda, dependendo dos módulos ativos
  minhaComissaoTotal = signal(0);

  // Listas do DIA
  atendimentosHoje = signal<AtendimentoResponse[]>([]);
  vendasHoje = signal<VendaResponse[]>([]);

  // Usado pelo EMPREGADOR
  fechamento = signal<FechamentoMensal | null>(null);

  ngOnInit() {
    if (this.isEmpregador()) {
      this.carregarVisaoEmpregador();
    } else {
      this.carregarVisaoFuncionario();
    }
  }

  private iniciarChamada() {
    this.chamadasPendentes++;
  }

  private finalizarChamada() {
    this.chamadasPendentes--;
    if (this.chamadasPendentes <= 0) {
      this.carregando.set(false);
    }
  }

  private carregarVisaoFuncionario() {
    const mes = mesAtualComoDateTime();
    const hoje = hojeComoDateTime();

    // Acumula comissão de atendimento + venda no mesmo total,
    // mesmo que as duas chamadas terminem em momentos diferentes
    let comissaoAtendimentos = 0;
    let comissaoVendas = 0;
    const atualizarTotal = () => this.minhaComissaoTotal.set(comissaoAtendimentos + comissaoVendas);

    if (this.temModulo('ATENDIMENTOS')) {
      this.iniciarChamada();
      this.atendimentoService.listarMeus(mes.inicio, mes.fim).subscribe({
        next: (atendimentos) => {
          comissaoAtendimentos = atendimentos.reduce((soma, a) => soma + a.valorComissao, 0);
          atualizarTotal();
          this.finalizarChamada();
        },
        error: () => {
          this.erro.set('Não foi possível carregar a comissão do mês');
          this.finalizarChamada();
        },
      });

      this.iniciarChamada();
      this.atendimentoService.listarMeus(hoje.inicio, hoje.fim).subscribe({
        next: (atendimentos) => {
          this.atendimentosHoje.set(
            [...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
          );
          this.finalizarChamada();
        },
        error: () => {
          this.erro.set('Não foi possível carregar os atendimentos de hoje');
          this.finalizarChamada();
        },
      });
    }

    if (this.temModulo('ESTOQUE_VENDAS')) {
      this.iniciarChamada();
      this.vendaService.listarPorPeriodo(mes.inicio, mes.fim).subscribe({
        next: (vendas) => {
          comissaoVendas = vendas.reduce((soma, v) => soma + v.valorComissao, 0);
          atualizarTotal();
          this.finalizarChamada();
        },
        error: () => {
          this.erro.set('Não foi possível carregar a comissão de vendas do mês');
          this.finalizarChamada();
        },
      });

      this.iniciarChamada();
      this.vendaService.listarPorPeriodo(hoje.inicio, hoje.fim).subscribe({
        next: (vendas) => {
          this.vendasHoje.set(
            [...vendas].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
          );
          this.finalizarChamada();
        },
        error: () => {
          this.erro.set('Não foi possível carregar as vendas de hoje');
          this.finalizarChamada();
        },
      });
    }

    if (this.chamadasPendentes === 0) {
      this.carregando.set(false);
    }
  }

  private carregarVisaoEmpregador() {
    const { inicio: inicioData, fim: fimData } = mesAtualComoDate();
    const hoje = hojeComoDateTime();

    this.iniciarChamada();
    this.fechamentoService.gerarFechamento(inicioData, fimData).subscribe({
      next: (resultado) => {
        this.fechamento.set(resultado);
        this.finalizarChamada();
      },
      error: () => {
        this.erro.set('Não foi possível carregar o fechamento');
        this.finalizarChamada();
      },
    });

    if (this.temModulo('ATENDIMENTOS')) {
      this.iniciarChamada();
      this.atendimentoService.listarPorPeriodo(hoje.inicio, hoje.fim).subscribe({
        next: (atendimentos) => {
          this.atendimentosHoje.set(
            [...atendimentos].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
          );
          this.finalizarChamada();
        },
        error: () => {
          this.erro.set('Não foi possível carregar os atendimentos de hoje');
          this.finalizarChamada();
        },
      });
    }

    if (this.temModulo('ESTOQUE_VENDAS')) {
      this.iniciarChamada();
      this.vendaService.listarPorPeriodo(hoje.inicio, hoje.fim).subscribe({
        next: (vendas) => {
          this.vendasHoje.set(
            [...vendas].sort((a, b) => b.dataHora.localeCompare(a.dataHora))
          );
          this.finalizarChamada();
        },
        error: () => {
          this.erro.set('Não foi possível carregar as vendas de hoje');
          this.finalizarChamada();
        },
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
