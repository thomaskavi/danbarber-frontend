import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificacao = inject(NotificacaoService);

  carregando = false;

  form = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  entrar() {
    if (this.form.invalid) {
      return;
    }

    this.carregando = true;

    this.authService.login({
      login: this.form.value.login!,
      senha: this.form.value.senha!,
    }).subscribe({
      next: (resposta) => {
        this.authService.salvarSessao(resposta);
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.carregando = false;
        this.notificacao.erro(err?.error?.mensagem ?? 'Login ou senha inválidos');
      },
    });
  }
}