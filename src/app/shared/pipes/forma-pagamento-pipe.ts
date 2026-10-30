import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formaPagamento',
  standalone: true
})
export class FormaPagamentoPipe implements PipeTransform {

  transform(value: string): string {

    switch (value) {

      case 'DINHEIRO':
        return 'Dinheiro';

      case 'PIX':
        return 'PIX';

      case 'CARTAO_DEBITO':
        return 'Cartão de débito';

      case 'CARTAO_CREDITO':
        return 'Cartão de crédito';

      default:
        return value;
    }

  }
}