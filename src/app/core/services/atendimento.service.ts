import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AtendimentoRequest, AtendimentoResponse } from '../models/model';

@Injectable({ providedIn: 'root' })
export class AtendimentoService {

  private readonly baseUrl = `${environment.apiUrl}/atendimentos`;

  constructor(private http: HttpClient) {}

  registrar(dto: AtendimentoRequest) {
    return this.http.post<AtendimentoResponse>(this.baseUrl, dto);
  }

  // Usado pelo BARBEIRO: só os próprios atendimentos
  listarMeus(inicio: string, fim: string) {
    return this.http.get<AtendimentoResponse[]>(`${this.baseUrl}/meus`, {
      params: { inicio, fim },
    });
  }

  // Usado pelo DONO: todos os atendimentos do período
  listarPorPeriodo(inicio: string, fim: string) {
    return this.http.get<AtendimentoResponse[]>(this.baseUrl, {
      params: { inicio, fim },
    });
  }
}
