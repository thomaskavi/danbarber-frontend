import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
        // Depois de criar a conta, manda direto pro login
        this.router.navigate(['/login'], {
          queryParams: { registrado: 'true' }
        });
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err?.error?.mensagem ?? 'Erro ao criar conta. Tente novamente.';
      },
    });
  }
}