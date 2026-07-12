import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.production';

export interface UsuarioResponse {
  id: number;
  nome: string;
  percentualComissao: number | null;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarBarbeiros() {
    return this.http.get<UsuarioResponse[]>(`${this.baseUrl}/barbeiros`);
  }
}
