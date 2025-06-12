import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tokentsing = localStorage.getItem('token');
  let tokenData;
  if (tokentsing) {
    tokenData = JSON.parse(tokentsing);
  }
  const token = authService.CurrentUserRole == 'A' || (tokenData && tokenData.usertype == 'A');

  if (token) {
    return true;
  } else {
    router.navigate(['admin/login']);
    return false;
  }
};
