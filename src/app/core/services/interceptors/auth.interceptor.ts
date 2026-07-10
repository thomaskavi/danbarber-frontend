import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obterToken();

  // Não anexa token nas chamadas de login (ainda não existe token nesse momento)
  if (token && !req.url.includes('/auth/login')) {
    const reqComToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(reqComToken);
  }

  return next(req);
};
