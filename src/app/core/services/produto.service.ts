import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AjusteEstoqueRequest, ProdutoRequest, ProdutoResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProdutoService {

  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/produtos`;

  listarAtivos() {
    return this.http.get<ProdutoResponse[]>(this.baseUrl);
  }

  listarInativos() {
    return this.http.get<ProdutoResponse[]>(`${this.baseUrl}/inativos`);
  }

  registrar(dto: ProdutoRequest) {
    return this.http.post<ProdutoResponse>(this.baseUrl, dto);
  }

  atualizar(id: number, dto: ProdutoRequest) {
    return this.http.put<ProdutoResponse>(`${this.baseUrl}/${id}`, dto);
  }

  ajustarEstoque(id: number, dto: AjusteEstoqueRequest) {
    return this.http.patch<ProdutoResponse>(`${this.baseUrl}/${id}/estoque`, dto);
  }

  desativar(id: number) {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desativar`, {});
  }

  reativar(id: number) {
    return this.http.patch<ProdutoResponse>(`${this.baseUrl}/${id}/reativar`, {});
  }
}