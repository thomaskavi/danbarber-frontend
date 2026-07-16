import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CriarFuncionarioRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FuncionarioService {

  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth/funcionarios`;

  registrar(dto: CriarFuncionarioRequest) {
    return this.http.post<void>(`${this.baseUrl}/register`, dto);
  }
}