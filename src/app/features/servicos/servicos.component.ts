import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicoService } from '../../core/services/servico.service';
import { ServicoResponse } from '../../core/models/models';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './servicos.component.html',
})
export class ServicosComponent implements OnInit {

  private fb = inject(FormBuilder);
  private servicoService = inject(ServicoService);

  servicos = signal<ServicoResponse[]>([]);
  servicosInativos = signal<ServicoResponse[]>([]);
  mostrarInativos = signal(false);

  carregando = signal(true);
  enviando = signal(false);
  erro = signal<string | null>(null);

  // Guarda o serviço que está sendo editado (null = criando um novo)
  servicoEmEdicao = signal<ServicoResponse | null>(null);

  form = this.fb.group({
    nome: ['', Validators.required],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
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
  }

  // Só busca os inativos quando o dono realmente pede pra ver
  // (evita uma chamada de API desnecessária toda vez que a tela carrega)
  alternarInativos() {
    const abrindo = !this.mostrarInativos();
    this.mostrarInativos.set(abrindo);

    if (abrindo) {
      this.servicoService.listarInativos().subscribe({
        next: (servicos) => this.servicosInativos.set(servicos),
        error: () => this.erro.set('Não foi possível carregar os serviços desativados'),
      });
    }
  }

  reativar(servico: ServicoResponse) {
    this.servicoService.reativar(servico.id).subscribe({
      next: () => {
        // Atualiza as duas listas: some dos inativos, aparece nos ativos
        this.servicosInativos.set(this.servicosInativos().filter(s => s.id !== servico.id));
        this.carregar();
      },
      error: () => this.erro.set('Não foi possível reativar o serviço'),
    });
  }

  editar(servico: ServicoResponse) {
    this.servicoEmEdicao.set(servico);
    this.form.patchValue({ nome: servico.nome, preco: servico.preco });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.servicoEmEdicao.set(null);
    this.form.reset({ nome: '', preco: null });
    this.erro.set(null);
  }

  salvar() {
    if (this.form.invalid) {
      return;
    }

    this.erro.set(null);
    this.enviando.set(true);

    const dto = {
      nome: this.form.value.nome!,
      preco: this.form.value.preco!,
    };

    const emEdicao = this.servicoEmEdicao();

    const operacao = emEdicao
      ? this.servicoService.atualizar(emEdicao.id, dto)
      : this.servicoService.registrar(dto);

    operacao.subscribe({
      next: () => {
        this.enviando.set(false);
        this.cancelarEdicao();
        this.carregar();
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set(emEdicao ? 'Não foi possível atualizar o serviço' : 'Não foi possível criar o serviço');
      },
    });
  }

  desativar(servico: ServicoResponse) {
    const confirmar = confirm(`Desativar "${servico.nome}"? Ele deixará de aparecer para novos atendimentos.`);

    if (!confirmar) {
      return;
    }

    this.servicoService.desativar(servico.id).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Não foi possível desativar o serviço'),
    });
  }
}
