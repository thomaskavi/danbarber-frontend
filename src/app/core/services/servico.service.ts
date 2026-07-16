import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ServicoResponse } from '../models/models';

export interface ServicoRequest {
  nome: string;
  preco: number;
}

@Injectable({ providedIn: 'root' })
export class ServicoService {

  private readonly baseUrl = `${environment.apiUrl}/servicos`;

  constructor(private http: HttpClient) {}

  listarAtivos() {
    return this.http.get<ServicoResponse[]>(this.baseUrl);
  }

  listarInativos() {
    return this.http.get<ServicoResponse[]>(`${this.baseUrl}/inativos`);
  }

  registrar(dto: ServicoRequest) {
    return this.http.post<ServicoResponse>(this.baseUrl, dto);
  }

  atualizar(id: number, dto: ServicoRequest) {
    return this.http.put<ServicoResponse>(`${this.baseUrl}/${id}`, dto);
  }

  desativar(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  reativar(id: number) {
    return this.http.patch<ServicoResponse>(`${this.baseUrl}/${id}/reativar`, {});
  }
}
