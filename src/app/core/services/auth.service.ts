import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/model';
import { Observable } from 'rxjs';

const CHAVE_TOKEN = 'danbarber_token';
const CHAVE_NOME = 'danbarber_nome';
const CHAVE_ROLE = 'danbarber_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  
  // Signals: qualquer componente que ler esses valores atualiza sozinho quando eles mudam
  private tokenSignal = signal<string | null>(localStorage.getItem(CHAVE_TOKEN));
  private nomeSignal = signal<string | null>(localStorage.getItem(CHAVE_NOME));
  private roleSignal = signal<string | null>(localStorage.getItem(CHAVE_ROLE));

  // Somente leitura para quem consome de fora do service
  readonly nome = this.nomeSignal.asReadonly();
  readonly role = this.roleSignal.asReadonly();
  readonly estaLogado = computed(() => this.tokenSignal() !== null);
  readonly isEmpregador = computed(() => this.roleSignal() === 'EMPREGADOR');

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: LoginRequest) {
    // O componente de login chama .subscribe() nisso e, no sucesso,
    // chama salvarSessao(resposta) — ver login.component.ts abaixo
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dto);


  }

  salvarSessao(resposta: LoginResponse) {
    localStorage.setItem(CHAVE_TOKEN, resposta.token);
    localStorage.setItem(CHAVE_NOME, resposta.nome);
    localStorage.setItem(CHAVE_ROLE, resposta.role);

    this.tokenSignal.set(resposta.token);
    this.nomeSignal.set(resposta.nome);
    this.roleSignal.set(resposta.role);
  }

  logout() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_NOME);
    localStorage.removeItem(CHAVE_ROLE);

    this.tokenSignal.set(null);
    this.nomeSignal.set(null);
    this.roleSignal.set(null);

    this.router.navigate(['/login']);
  }

  obterToken(): string | null {
    return this.tokenSignal();
  }

  registrar(dados: {
    nomeEmpresa: string;
    ramo: string;
    nomeDono: string;
    login: string;
    senha: string;
  }): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, dados);
  }
}
