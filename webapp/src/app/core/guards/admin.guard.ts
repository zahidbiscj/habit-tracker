import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { IAuthService } from '../services/interfaces/auth.service.interface';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(IAuthService);
  const router = inject(Router);

  return authService.isAdmin().pipe(
    map(isAdmin => {
      if (!isAdmin) {
        router.navigate(['/user/dashboard']);
        return false;
      }
      return true;
    })
  );
};
