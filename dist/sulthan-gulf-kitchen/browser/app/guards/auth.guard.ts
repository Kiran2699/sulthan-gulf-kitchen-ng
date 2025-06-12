import { CanActivateFn, Router } from '@angular/router';
import { MainService } from '../services/main.service';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tokentsing = localStorage.getItem('token');
  let tokenData;
  if (tokentsing) {
    tokenData = JSON.parse(tokentsing);
  }
  const token = authService.CurrentUserRole == 'C' || (tokenData && tokenData.usertype == 'C');

  if (token) {
    return true;
  } else {
    router.navigate(['login']);
    return false;
  }
};
