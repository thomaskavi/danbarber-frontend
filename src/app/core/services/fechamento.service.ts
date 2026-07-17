import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ComissaoFuncionario {
  FuncionarioId: number;
  nomeFuncionario: string;
  totalComissao: number;
}

export interface FechamentoMensal {
  inicio: string;
  fim: string;

  faturamentoAtendimentos: number;
  faturamentoVendas: number;
  faturamentoTotal: number;

  faturamentoPorFormaPagamento: Record<string, number>;

  comissoesPorFuncionario: ComissaoFuncionario[];

  totalComissoes: number;
  totalDespesas: number;
  saldoLiquido: number;
}

@Injectable({ providedIn: 'root' })
export class FechamentoService {

  private readonly baseUrl = `${environment.apiUrl}/fechamento`;

  constructor(private http: HttpClient) {}

  // Atenção: inicio e fim aqui são LocalDate (yyyy-MM-dd), não LocalDateTime
  gerarFechamento(inicio: string, fim: string) {
    return this.http.get<FechamentoMensal>(this.baseUrl, {
      params: { inicio, fim },
    });
  }
}
