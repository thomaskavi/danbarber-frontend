import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Modulo } from '../models/models';
import { Observable } from 'rxjs';

const CHAVE_TOKEN = 'danbarber_token';
const CHAVE_NOME = 'danbarber_nome';
const CHAVE_ROLE = 'danbarber_role';
const CHAVE_MODULOS = 'danbarber_modulos';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  
  // Signals: qualquer componente que ler esses valores atualiza sozinho quando eles mudam
  private tokenSignal = signal<string | null>(localStorage.getItem(CHAVE_TOKEN));
  private nomeSignal = signal<string | null>(localStorage.getItem(CHAVE_NOME));
  private roleSignal = signal<string | null>(localStorage.getItem(CHAVE_ROLE));
  private modulosSignal = signal<Modulo[]>(this.lerModulosSalvos());

  // Somente leitura para quem consome de fora do service
  readonly nome = this.nomeSignal.asReadonly();
  readonly role = this.roleSignal.asReadonly();
  readonly modulos = this.modulosSignal.asReadonly();
  readonly estaLogado = computed(() => this.tokenSignal() !== null);
  readonly isEmpregador = computed(() => this.roleSignal() === 'EMPREGADOR');

  constructor(private http: HttpClient, private router: Router) {}

  private lerModulosSalvos(): Modulo[] {
    const bruto = localStorage.getItem(CHAVE_MODULOS);
    return bruto ? JSON.parse(bruto) : [];
  }

  login(dto: LoginRequest) {
    // O componente de login chama .subscribe() nisso e, no sucesso,
    // chama salvarSessao(resposta) — ver login.component.ts abaixo
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dto);


  }

  salvarSessao(resposta: LoginResponse) {
    localStorage.setItem(CHAVE_TOKEN, resposta.token);
    localStorage.setItem(CHAVE_NOME, resposta.nome);
    localStorage.setItem(CHAVE_ROLE, resposta.role);
    localStorage.setItem(CHAVE_MODULOS, JSON.stringify(resposta.modulosAtivos ?? []));

    this.tokenSignal.set(resposta.token);
    this.nomeSignal.set(resposta.nome);
    this.roleSignal.set(resposta.role);
    this.modulosSignal.set(resposta.modulosAtivos ?? []);

  }

  temModulo(modulo: Modulo): boolean {
    return this.modulosSignal().includes(modulo);
  }

  logout() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_NOME);
    localStorage.removeItem(CHAVE_ROLE);
    localStorage.removeItem(CHAVE_MODULOS);


    this.tokenSignal.set(null);
    this.nomeSignal.set(null);
    this.roleSignal.set(null);
    this.modulosSignal.set([]);

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
