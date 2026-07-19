import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registrar.component.html',
})
export class RegistrarComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificacao = inject(NotificacaoService);

  erro: string | null = null;
  carregando = false;

  form = this.fb.group({
    nomeEmpresa: ['', Validators.required],
    ramo: ['', Validators.required],
    nomeDono: ['', Validators.required],
    login: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  registrar() {
    if (this.form.invalid) {
      return;
    }

    this.erro = null;
    this.carregando = true;

    this.authService.registrar({
      nomeEmpresa: this.form.value.nomeEmpresa!,
      ramo: this.form.value.ramo!,
      nomeDono: this.form.value.nomeDono!,
      login: this.form.value.login!,
      senha: this.form.value.senha!,
    }).subscribe({
      next: () => {
        this.carregando = false;
        this.notificacao.sucesso('Conta criada com sucesso! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.carregando = false;
        this.notificacao.erro(err?.error?.mensagem ?? 'Erro ao criar conta. Tente novamente.');
      },
    });
  }
}