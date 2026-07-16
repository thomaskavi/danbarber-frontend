import { Injectable, signal } from '@angular/core';
import { Toast, TipoToast } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {

  private contador = 0;
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private mostrar(tipo: TipoToast, mensagem: string, duracaoMs = 4000) {
    const id = ++this.contador;
    this.toastsSignal.update(lista => [...lista, { id, tipo, mensagem }]);

    setTimeout(() => this.remover(id), duracaoMs);
  }

  sucesso(mensagem: string) {
    this.mostrar('sucesso', mensagem);
  }

  erro(mensagem: string) {
    this.mostrar('erro', mensagem);
  }

  info(mensagem: string) {
    this.mostrar('info', mensagem);
  }

  remover(id: number) {
    this.toastsSignal.update(lista => lista.filter(t => t.id !== id));
  }
}