import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';
import { map, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return tokenService.isAuthenticated().pipe(
    tap((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
      }
    }),
    map((isAuthenticated) => isAuthenticated)
  );
};
