import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  notificacao = inject(NotificacaoService);
}