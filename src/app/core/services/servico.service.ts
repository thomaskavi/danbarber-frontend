import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ServicoResponse } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class ServicoService {

  private readonly baseUrl = `${environment.apiUrl}/servicos`;

  constructor(private http: HttpClient) {}

  listarAtivos() {
    return this.http.get<ServicoResponse[]>(this.baseUrl);
  }
}
