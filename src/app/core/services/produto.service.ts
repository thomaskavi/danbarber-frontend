import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AjusteEstoqueRequest, ProdutoRequest, ProdutoResponse } from '../models/models';
import { Observable } from 'rxjs';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService {

  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/produtos`;

  findAll(name: string = '', page: number = 0, size: number = 10): Observable<PageResponse<ProdutoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Só envia "name" se realmente houver um filtro —
    // evita mandar name='' pro back sem necessidade
    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<PageResponse<ProdutoResponse>>(this.baseUrl, { params });
  }

   buscarPorId(id: number) {
    return this.http.get<ProdutoResponse>(`${this.baseUrl}/${id}`);
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