import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFirebaseService } from '../services/firebase/auth-firebase.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthFirebaseService);
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
