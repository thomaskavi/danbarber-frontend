import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AtendimentoService } from '../../core/services/atendimento.service';
import { ServicoService } from '../../core/services/servico.service';
import { UsuarioService, UsuarioResponse } from '../../core/services/usuario.service';
import { ServicoResponse, FormaPagamento } from '../../core/models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-novo-atendimento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './novo-atendimento.component.html',
})
export class NovoAtendimentoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private atendimentoService = inject(AtendimentoService);
  private servicoService = inject(ServicoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  readonly isEmpregador = this.authService.isEmpregador;

  servicos = signal<ServicoResponse[]>([]);
  funcionarios = signal<UsuarioResponse[]>([]);
  servicosSelecionados = signal<Set<number>>(new Set());

  carregando = signal(true);
  enviando = signal(false);
  erro = signal<string | null>(null);

  readonly formasPagamento: FormaPagamento[] = ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'];

  // Recalcula sozinho toda vez que a seleção de serviços muda
  valorTotalEstimado = computed(() => {
    const idsSelecionados = this.servicosSelecionados();
    return this.servicos()
      .filter(s => idsSelecionados.has(s.id))
      .reduce((soma, s) => soma + s.preco, 0);
  });

  form = this.fb.group({
    funcionarioId: [null as number | null],
    nomeCliente: [''],
    formaPagamento: ['' as FormaPagamento | '', Validators.required],
    observacao: [''],
  });

  ngOnInit() {
    this.servicoService.listarAtivos().subscribe({
      next: (servicos) => {
        this.servicos.set(servicos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os serviços');
        this.carregando.set(false);
      },
    });

    if (this.isEmpregador()) {
      this.usuarioService.listarFuncionarios().subscribe({
        next: (funcionarios) => this.funcionarios.set(funcionarios),
        error: () => this.erro.set('Não foi possível carregar a lista de funcionarios'),
      });
    }
  }

  alternarServico(servicoId: number) {
    const atual = new Set(this.servicosSelecionados());
    if (atual.has(servicoId)) {
      atual.delete(servicoId);
    } else {
      atual.add(servicoId);
    }
    this.servicosSelecionados.set(atual);
  }

  servicoSelecionado(servicoId: number): boolean {
    return this.servicosSelecionados().has(servicoId);
  }

  salvar() {
    const idsServicos = Array.from(this.servicosSelecionados());

    if (idsServicos.length === 0) {
      this.erro.set('Selecione ao menos um serviço');
      return;
    }

    if (this.isEmpregador() && !this.form.value.funcionarioId) {
      this.erro.set('Selecione o funcionario');
      return;
    }

    this.erro.set(null);
    this.enviando.set(true);

    this.atendimentoService.registrar({
      funcionarioId: this.isEmpregador() ? this.form.value.funcionarioId : null,
      nomeCliente: this.form.value.nomeCliente || undefined,
      formaPagamento: this.form.value.formaPagamento as FormaPagamento,
      servicoIds: idsServicos,
      observacao: this.form.value.observacao || undefined,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Não foi possível registrar o atendimento');
      },
    });
  }
}
