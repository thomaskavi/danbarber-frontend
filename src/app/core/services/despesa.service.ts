import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.production';
import { DespesaRequest, DespesaResponse } from '../../models/despesa.models';
 
@Injectable({ providedIn: 'root' })
export class DespesaService {
 
  private readonly baseUrl = `${environment.apiUrl}/despesas`;
 
  constructor(private http: HttpClient) {}
 
  registrar(dto: DespesaRequest) {
    return this.http.post<DespesaResponse>(this.baseUrl, dto);
  }
 
  // inicio e fim aqui são LocalDate (yyyy-MM-dd)
  listarPorPeriodo(inicio: string, fim: string) {
    return this.http.get<DespesaResponse[]>(this.baseUrl, {
      params: { inicio, fim },
    });
  }

  atualizar(id: number, dto: DespesaRequest) {
    return this.http.put<DespesaResponse>(
      `${this.baseUrl}/${id}`,
      dto
    );
  }

  excluir(id: number) {
    return this.http.delete(
      `${this.baseUrl}/${id}`
    );
  }
}
 