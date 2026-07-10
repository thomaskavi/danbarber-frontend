import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  erro: string | null = null;
  carregando = false;

  // Agora "this.fb" já existe quando essa linha roda,
  // porque inject() é resolvido na hora da criação do campo, não no construtor
  form = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  entrar() {
    if (this.form.invalid) {
      return;
    }

    this.erro = null;
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
      error: () => {
        this.carregando = false;
        this.erro = 'Login ou senha inválidos';
      },
    });
  }
}
