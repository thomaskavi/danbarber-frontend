import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Modulo } from '../models/models';

// Uso na rota: canActivate: [authGuard, moduloGuard('ESTOQUE_VENDAS')]
export function moduloGuard(modulo: Modulo): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.temModulo(modulo)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
}