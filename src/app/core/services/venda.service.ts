import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VendaRequest, VendaResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class VendaService {

  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vendas`;

  registrar(dto: VendaRequest) {
    return this.http.post<VendaResponse>(this.baseUrl, dto);
  }

  listarPorPeriodo(inicio: string, fim: string) {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<VendaResponse[]>(this.baseUrl, { params });
  }
}