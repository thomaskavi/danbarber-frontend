import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-novo-funcionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './novo-funcionario.component.html',
})
export class NovoFuncionarioComponent {

  private fb = inject(FormBuilder);
  private funcionarioService = inject(FuncionarioService);
  private notificacao = inject(NotificacaoService);
  private router = inject(Router);

  enviando = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
    login: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    temComissao: [false],
    percentualComissao: [null as number | null],
  });

  salvar() {
    if (this.form.invalid) return;

    const temComissao = this.form.value.temComissao ?? false;

    if (temComissao && !this.form.value.percentualComissao) {
      this.notificacao.erro('Informe o percentual de comissão');
      return;
    }

    this.enviando.set(true);

    this.funcionarioService.registrar({
      nome: this.form.value.nome!,
      login: this.form.value.login!,
      senha: this.form.value.senha!,
      temComissao,
      percentualComissao: temComissao ? this.form.value.percentualComissao! : null,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacao.sucesso('Funcionário cadastrado com sucesso');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.notificacao.erro(err?.error?.mensagem ?? 'Não foi possível cadastrar o funcionário');
      },
    });
  }
}