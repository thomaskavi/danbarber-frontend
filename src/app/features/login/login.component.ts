import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-login',  
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  erro: string | null = null;
  sucesso: string | null = null;
  carregando = false;

  form = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  ngOnInit() {
    // Lê o ?registrado=true que vem do redirecionamento após criar conta
    this.route.queryParams.subscribe(params => {
      if (params['registrado'] === 'true') {
        this.sucesso = 'Conta criada com sucesso! Faça login para continuar.';
      }
    });
  }

  entrar() {
    if (this.form.invalid) {
      return;
    }

    this.erro = null;
    this.sucesso = null; // limpa a mensagem de sucesso ao tentar logar
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
        this.erro = err?.error?.mensagem ?? 'Login ou senha inválidos';
      },
    });
  }
  }